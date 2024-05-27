import { HierarchicalNode, KnowledgeStatement, Organ } from "../models/explorer.ts";
import {ROOTS} from "./hierarchyService.ts";
import { HierarchicalItem, IHeatmapMatrixInformation, Option, KsMapType, LabelIdPair } from "../components/common/Types.ts";
import {Filters} from "../context/DataContext.ts";

export function getYAxis(hierarchicalNodes: Record<string, HierarchicalNode>, hierarchyNode?: Record<string, HierarchicalNode>): HierarchicalItem[] {
    function buildListItem(nodeId: string): HierarchicalItem {
        const node = hierarchicalNodes[nodeId];
        const childrenListItems: HierarchicalItem[] = [];

        node.children.forEach(childId => {
            childrenListItems.push(buildListItem(childId));
        });

        return {
            id: nodeId,
            label: node.name,
            children: childrenListItems,
            expanded: false // Default to collapsed
        };
    }

    const yRoot = hierarchyNode ? Object.values(hierarchyNode) : ROOTS
    return yRoot.map(root => {
        return hierarchicalNodes[root.id] ? buildListItem(root.id) : null;
    }).filter(item => item !== null) as HierarchicalItem[];
}


export function getXAxisOrgans(organs: Record<string, Organ>): Organ[] {
    return Object.values(organs)
        .sort((a, b) => a.order - b.order)
        .map(organ => organ);
}


export function calculateConnections(hierarchicalNodes: Record<string, HierarchicalNode>, allOrgans: Record<string, Organ>,
                                     allKnowledgeStatements: Record<string, KnowledgeStatement>, filters: Filters): Map<string, Set<string>[]> {

    // Apply filters to organs and knowledge statements

    const knowledgeStatements = filterKnowledgeStatements(allKnowledgeStatements, filters);
    const organs = filterOrgans(allOrgans, filters.EndOrgan);

    // Create a map of organ IRIs to their index positions for quick lookup
    const sortedOrgans = Object.values(allOrgans).sort((a, b) => a.order - b.order);
    const organIndexMap = sortedOrgans.reduce<Record<string, number>>((map, organ, index) => {
        map[organ.id] = index;
        return map;
    }, {});

    // Memoization map to store computed results for nodes
    const memo = new Map<string, Set<string>[]>();

    // Function to compute node connections with memoization
    function computeNodeConnections(nodeId: string): Set<string>[] {
        if (memo.has(nodeId)) {
            return memo.get(nodeId)!;
        }

        const node = hierarchicalNodes[nodeId];
        const result = Array.from({ length: Object.keys(allOrgans).length }, () => new Set<string>());

        if (node.children && node.children.size > 0) {
            node.children.forEach(childId => {
                const childConnections = computeNodeConnections(childId);
                childConnections.forEach((set, index) => {
                    set.forEach(knowledgeStatementId => {
                        result[index].add(knowledgeStatementId);
                    });
                });
            });
        } else if (node.connectionDetails) {
            Object.keys(node.connectionDetails).forEach(targetOrganIRI => {
                const index = organIndexMap[targetOrganIRI];
                node.connectionDetails = node.connectionDetails || {}; // Keeps linter happy
                if (index !== undefined && targetOrganIRI in organs) {
                    const knowledgeStatementIds = node.connectionDetails[targetOrganIRI];
                    knowledgeStatementIds.forEach(ksId => {
                        if (ksId in knowledgeStatements) {
                            result[index].add(ksId);
                        }
                    });
                }
            });
        }

        memo.set(nodeId, result);
        return result;
    }

    const connectionsMap = new Map<string, Set<string>[]>();
    Object.values(hierarchicalNodes).forEach(node => {
        connectionsMap.set(node.id, computeNodeConnections(node.id));
    });
    return connectionsMap;
}


export function getHeatmapData(yAxis: HierarchicalItem[], connections: Map<string, Set<string>[]>) {
    const heatmapInformation: IHeatmapMatrixInformation = {
        heatmapMatrix: [],
        detailedHeatmap: []
    }

    function addDataForItem(item: HierarchicalItem) {
        const itemConnections = connections.get(item.id);
        if (itemConnections) {
            const itemConnectionsCount = itemConnections.map(set => set.size);
            heatmapInformation.heatmapMatrix.push(itemConnectionsCount);
            heatmapInformation.detailedHeatmap.push({ label: item.label, id: item.id || '', data: itemConnections || [] })
        }
    }

    function traverseItems(items: HierarchicalItem[], fetchNextLevel: boolean) {
        items.forEach(item => {
            if (item.expanded) {
                addDataForItem(item);
                // Traverse further into the expanded item
                if (item.children && typeof item.children[0] !== 'string') {
                    traverseItems(item.children as HierarchicalItem[], true);
                }
            } else if (fetchNextLevel) {
                addDataForItem(item);
            }
        });
    }

    // Start traversal with the initial yAxis, allowing to fetch immediate children of the root if expanded
    traverseItems(yAxis, true);

    return heatmapInformation;
}

export function getMinMaxConnections(connectionsMap: Map<string, Set<string>[]>): { min: number, max: number } {
    let min = Infinity;
    let max = -Infinity;

    ROOTS.forEach(root => {
        const connectionCounts = connectionsMap.get(root.id);
        if (connectionCounts) {
            // Flatten all connection counts and find min/max across all
            connectionCounts.forEach(connectionSet => {
                const size = connectionSet.size;
                if (size < min) min = size;
                if (size > max) max = size;
            });
        }
    });

    return {min, max};
}

export function filterOrgans(organs: Record<string, Organ>, endOrganFilter: Option[]): Record<string, Organ> {
    if (endOrganFilter.length === 0) {
        // If no filter is selected, return all organs
        return organs;
    }
    const filterIds = endOrganFilter.map(option => option.id);
    return Object.entries(organs).reduce((filtered, [id, organ]) => {
        if (filterIds.includes(id)) {
            filtered[id] = organ;
        }
        return filtered;
    }, {} as Record<string, Organ>);
}

export function filterKnowledgeStatements(knowledgeStatements: Record<string, KnowledgeStatement>, filters: Filters): Record<string, KnowledgeStatement> {
    const phenotypeIds = filters.Phenotype.map(option => option.id);
    const apiNATOMYIds = filters.apiNATOMY.map(option => option.id);
    const speciesIds = filters.Species.flatMap(option => option.id);
    const viaIds = filters.Via.flatMap(option => option.id);
    const originIds = filters.Origin.flatMap(option => option.id);

    return Object.entries(knowledgeStatements).reduce((filtered, [id, ks]) => {
        const phenotypeMatch = !phenotypeIds.length || phenotypeIds.includes(ks.phenotype);
        const apiNATOMYMatch = !apiNATOMYIds.length || apiNATOMYIds.includes(ks.apinatomy);
        const speciesMatch = !speciesIds.length || ks.species.some(species => speciesIds.includes(species.id));
        const viaMatch = !viaIds.length || ks.vias.flatMap(via => via.anatomical_entities).some(via => viaIds.includes(via.id));
        const originMatch = !originIds.length || ks.origins.some(origin => originIds.includes(origin.id));

        if (phenotypeMatch && apiNATOMYMatch && speciesMatch && viaMatch && originMatch) {
            filtered[id] = ks;
        }
        return filtered;
    }, {} as Record<string, KnowledgeStatement>);
}


export function getHierarchyFromId(id: string, hierarchicalNodes: Record<string, HierarchicalNode>): HierarchicalNode {
    return hierarchicalNodes[id];
}


export function getKnowledgeStatementMap(ksIds: Set<string>, knowledgeStatements: Record<string, KnowledgeStatement>): KsMapType {
    const ksMap: KsMapType = {};
    ksIds.forEach((id: string) => {
        const ks = knowledgeStatements[id];
        if (ks) {
            ksMap[id] = ks;
        }
    });
    return ksMap;
}

export const getPhenotypeColors = (normalizedValue: number, phenotypeColors: string[]): string => {
    // convert each to percentage values = for linear gradient
    // example: rgba(131, 0, 191, 0.5) 0%, rgba(131, 0, 191, 0.5) 50%, rgba(131, 0, 191, 0.5) 100%
    const phenotypeColorsWithPercentage = phenotypeColors.map((color, index) => {
        return `${color} ${100 / phenotypeColors.length * index}%, ${color} ${100 / phenotypeColors.length * (index + 1)}%`
    });

    // if there are multiple colors, create a linear gradient
    let phenotypeColor = phenotypeColors.length > 1 ? `linear-gradient(to right, ${phenotypeColorsWithPercentage.join(',')}` :
        phenotypeColors.length === 1 ? phenotypeColors[0] : '';

    // ADD the following if we need opacity for secondary/phenotype heatmap -  replace the alpha value of the color with the normalized value
    // phenotypeColor = phenotypeColor?.replace(/rgba\(([^,]+),([^,]+),([^,]+),([^)]+)\)/g, `rgba($1,$2,$3,${normalizedValue})`).replace(
    //     /rgb\(([^,]+),([^,]+),([^,]+)\)/g, `rgba($1,$2,$3,${normalizedValue})`
    // );
    return phenotypeColor ? phenotypeColor : `rgba(131, 0, 191, ${normalizedValue})`;
};


export const generateYLabelsAndIds = (list: HierarchicalItem[], prefix = ''): LabelIdPair => {
    let labels: string[] = [];
    let ids: string[] = [];
    list?.forEach(item => {
        const fullLabel = prefix ? `${prefix} - ${item.label}` : item.label;
        labels.push(fullLabel);
        ids.push(item.id);
        if (item.expanded && item.children.length > 0) {
            const children = generateYLabelsAndIds(item.children, fullLabel);
            labels = labels.concat(children.labels);
            ids = ids.concat(children.ids);
        }
    });
    return { labels, ids };
};
