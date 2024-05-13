import {HierarchicalNode, KnowledgeStatement, Organ} from "../models/explorer.ts";
import {HierarchicalItem} from "../components/ConnectivityGrid.tsx";
import {ROOTS} from "./hierarchyService.ts";

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
            expanded: false, // Default to collapsed
            id: node.id
        };
    }

    return ROOTS.map(root => {
        return hierarchicalNodes[root.id] ? buildListItem(root.id) : null;
    }).filter(item => item !== null) as HierarchicalItem[];
}

export function getXAxisOrgans(organs: Record<string, Organ>): Organ[] {
    return Object.values(organs).map(organ => organ);
}



export function calculateConnections(
    hierarchicalNodes: Record<string, HierarchicalNode>, organs: Record<string, Organ>,
    knowledgeStatements: Record<string, KnowledgeStatement>,
    subConnections: boolean = false
): Map<string, number[]> {
    // Create a map of organ IRIs to their index positions for quick lookup
    const organIndexMap = Object.values(organs).reduce<Record<string, number>>((map, organ, index) => {
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
        const result = new Array(Object.keys(organs).length).fill(0);

        if (!node) {
            return result;
        }

        if (node.children && node.children.size > 0) {
            node.children.forEach(childId => {
                const childConnections = computeNodeConnections(childId);
                childConnections.forEach((count, index) => {
                    result[index] += count;
                });
            });
        } else if (node.connectionDetails || node.endOrgansUri) {
            if (subConnections && node.endOrgansUri) {
                // Add the sub end organs to the connection details
                Object.keys(node.endOrgansUri).forEach(endOrganIRI => {
                    const index = organIndexMap[endOrganIRI];
                    node.endOrgansUri = node.endOrgansUri || {}; // Keeps linter happy
                    if (index !== undefined) {
                        const validKnowledgeStatementCount = node.endOrgansUri[endOrganIRI]
                            .filter(ksId => ksId in knowledgeStatements)
                            .length;
                        result[index] += validKnowledgeStatementCount;
                    }
                });
            } else if (node.connectionDetails) {
                Object.keys(node.connectionDetails).forEach(targetOrganIRI => {
                    const index = organIndexMap[targetOrganIRI];
                    node.connectionDetails = node.connectionDetails || {}; // Keeps linter happy
                    if (index !== undefined) {
                        const validKnowledgeStatementCount = node.connectionDetails[targetOrganIRI]
                            .filter(ksId => ksId in knowledgeStatements)
                            .length;
                        result[index] += validKnowledgeStatementCount;
                    }
                });
            }
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
        items?.forEach(item => {
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

type DetailedHeatmapData = { label: string, data: number[], id: string }[];

export function getDetailedHeatmapData(yAxis: HierarchicalItem[], connectionsMap: Map<string, number[]>) {
    const detailedHeatmap: DetailedHeatmapData = []
    function traverseItems(items: HierarchicalItem[], fetchNextLevel: boolean) {
        items?.forEach(item => {
            if (item.expanded) {
                // Fetch data for the current expanded item
                const itemData = connectionsMap.get(item.label);
                detailedHeatmap.push({ label: item.label, id: item.id || '', data: itemData || [] })

                // Traverse further into the expanded item
                if (item.children && typeof item.children[0] !== 'string') {
                    traverseItems(item.children as HierarchicalItem[], true);
                }
            } else if (fetchNextLevel) {
                // Fetch data for the immediate children of the last expanded item
                const itemData = connectionsMap.get(item.label);
                detailedHeatmap.push({ label: item.label, id: item.id || '', data: itemData || [] })
            }
        });
    }

    traverseItems(yAxis, true);
    return detailedHeatmap

}


export function getHierarchyFromId(id: string, hierarchicalNodes: Record<string, HierarchicalNode>): HierarchicalNode {
    return Object.values(hierarchicalNodes).find(node => node.id === id) as HierarchicalNode;
}
