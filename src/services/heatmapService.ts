import { HierarchicalNode, KnowledgeStatement, Organ } from "../models/explorer.ts";
import {ROOTS} from "./hierarchyService.ts";
import { HierarchicalItem, IHeatmapMatrixInformation, Option, ksMapType } from "../components/common/Types.ts";
import {Filters} from "../context/DataContext.ts";

export function getYAxis(hierarchicalNodes: Record<string, HierarchicalNode>): HierarchicalItem[] {
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


    return ROOTS.map(root => {
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
            // heatmapMatrix.push(itemConnectionsCount);
            heatmapInformation.heatmapMatrix.push(itemConnectionsCount);
        }
    }

    function traverseItems(items: HierarchicalItem[], fetchNextLevel: boolean) {
        items.forEach(item => {
            if (item.expanded) {
                // push the details of the current item
                const itemData = connections.get(item.label);
                heatmapInformation.detailedHeatmap.push({ label: item.label, id: item.id || '', data: itemData || [] })

                // Fetch data for the current expanded item
                addDataForItem(item);
                // Traverse further into the expanded item
                if (item.children && typeof item.children[0] !== 'string') {
                    traverseItems(item.children as HierarchicalItem[], true);
                }
            } else if (fetchNextLevel) {
                const itemData = connections.get(item.label);
                heatmapInformation.detailedHeatmap.push({ label: item.label, id: item.id || '', data: itemData || [] })

                // Fetch data for the immediate children of the last expanded item
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
        const viaMatch = !viaIds.length || ks.via.some(via => viaIds.includes(via.id.toString()));
        const originMatch = !originIds.length || ks.origins.some(origin => originIds.includes(origin.id));

        if (phenotypeMatch && apiNATOMYMatch && speciesMatch && viaMatch && originMatch) {
            filtered[id] = ks;
        }
        return filtered;
    }, {} as Record<string, KnowledgeStatement>);
}


export function getHierarchyFromId(id: string, hierarchicalNodes: Record<string, HierarchicalNode>): HierarchicalNode {
    return Object.values(hierarchicalNodes).find(node => node.id === id) as HierarchicalNode;
}


export function getKnowledgeStatementAndCount(ksIds: Set<string>, knowledgeStatements: Record<string, KnowledgeStatement>): ksMapType {
    const ksMap: ksMapType = {};
    ksIds.forEach((id: string) => {
        const ks = knowledgeStatements[id];
        if (ks) {
            ksMap[id] = {
                'ks': ks,
                'count': ksMap[id] ? ksMap[id].count + 1 : 1
            }
        }
    });
    return ksMap;
}