import {HierarchicalNode, KnowledgeStatement, Organ} from "../models/explorer.ts";
import {HierarchicalItem} from "../components/ConnectivityGrid.tsx";
import {ROOTS} from "./hierarchyService.ts";
import {Option} from "../components/common/Types.ts";
import {Filters} from "../context/DataContext.ts";

export function getYAxis(hierarchicalNodes: Record<string, HierarchicalNode>): HierarchicalItem[] {
    function buildListItem(nodeId: string): HierarchicalItem {
        const node = hierarchicalNodes[nodeId];
        const childrenListItems: HierarchicalItem[] = [];

        node.children.forEach(childId => {
            childrenListItems.push(buildListItem(childId));
        });

        return {
            label: node.name,
            children: childrenListItems,
            expanded: false // Default to collapsed
        };
    }


    return ROOTS.map(root => {
        return hierarchicalNodes[root.id] ? buildListItem(root.id) : null;
    }).filter(item => item !== null) as HierarchicalItem[];
}

export function getXAxis(organs: Record<string, Organ>): string[] {
    return Object.values(organs)
        .sort((a, b) => a.order - b.order)
        .map(organ => organ.name);
}


export function calculateConnections(hierarchicalNodes: Record<string, HierarchicalNode>, allOrgans: Record<string, Organ>,
                                     allKnowledgeStatements: Record<string, KnowledgeStatement>, filters: Filters): Map<string, number[]> {

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
    const memo = new Map<string, number[]>();

    // Function to compute node connections with memoization
    function computeNodeConnections(nodeId: string): number[] {
        if (memo.has(nodeId)) {
            return memo.get(nodeId)!;
        }

        const node = hierarchicalNodes[nodeId];
        const result = new Array(Object.keys(allOrgans).length).fill(0);

        if (node.children && node.children.size > 0) {
            node.children.forEach(childId => {
                const childConnections = computeNodeConnections(childId);
                childConnections.forEach((count, index) => {
                    result[index] += count;
                });
            });
        } else if (node.connectionDetails) {
            Object.keys(node.connectionDetails).forEach(targetOrganIRI => {
                const index = organIndexMap[targetOrganIRI];
                node.connectionDetails = node.connectionDetails || {}; // Keeps linter happy
                if (index !== undefined && targetOrganIRI in organs) {
                    const validKnowledgeStatementCount = Array.from(node.connectionDetails[targetOrganIRI])
                        .filter(ksId => ksId in knowledgeStatements)
                        .length;
                    result[index] += validKnowledgeStatementCount;
                }
            });
        }

        memo.set(nodeId, result);
        return result;
    }

    const connectionsMap = new Map<string, number[]>();
    Object.values(hierarchicalNodes).forEach(node => {
        connectionsMap.set(node.name, computeNodeConnections(node.id));
    });
    return connectionsMap;
}

export function getHeatmapData(yAxis: HierarchicalItem[], connections: Map<string, number[]>) {
    const newData: number[][] = [];

    function addDataForItem(item: HierarchicalItem) {
        const itemData = connections.get(item.label);
        if (itemData) {
            newData.push(itemData);
        }
    }

    function traverseItems(items: HierarchicalItem[], fetchNextLevel: boolean) {
        items.forEach(item => {
            if (item.expanded) {
                // Fetch data for the current expanded item
                addDataForItem(item);
                // Traverse further into the expanded item
                if (item.children && typeof item.children[0] !== 'string') {
                    traverseItems(item.children as HierarchicalItem[], true);
                }
            } else if (fetchNextLevel) {
                // Fetch data for the immediate children of the last expanded item
                addDataForItem(item);
            }
        });
    }

    // Start traversal with the initial yAxis, allowing to fetch immediate children of the root if expanded
    traverseItems(yAxis, true);

    return newData;
}

export function getMinMaxConnections(connectionsMap: Map<string, number[]>): { min: number, max: number } {
    let min = Infinity;
    let max = -Infinity;

    ROOTS.forEach(root => {
        const connectionCounts = connectionsMap.get(root.name);
        if (connectionCounts) {
            // Flatten all connection counts and find min/max across all
            connectionCounts.forEach(count => {
                if (count < min) min = count;
                if (count > max) max = count;
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
        const viaMatch = !viaIds.length || ks.via.some(via => viaIds.includes(via.id));
        const originMatch = !originIds.length || ks.origins.some(origin => originIds.includes(origin.id));

        if (phenotypeMatch && apiNATOMYMatch && speciesMatch && viaMatch && originMatch) {
            filtered[id] = ks;
        }
        return filtered;
    }, {} as Record<string, KnowledgeStatement>);
}