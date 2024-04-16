import {HierarchicalNode, Organ} from "../models/explorer.ts";
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
            expanded: false // Default to collapsed
        };
    }


    return ROOTS.map(root => {
        return hierarchicalNodes[root.id] ? buildListItem(root.id) : null;
    }).filter(item => item !== null) as HierarchicalItem[];
}

export function getXAxis(organs: Organ[]): string[] {
    return organs.map(organ => organ.name);
}


export function calculateConnections(hierarchicalNodes: Record<string, HierarchicalNode>, organs: Organ[]): Map<string, number[]> {
    // Create a map of organ IRIs to their index positions for quick lookup
    const organIndexMap = organs.reduce<Record<string, number>>((map, organ, index) => {
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
        const result = new Array(organs.length).fill(0);

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
                if (index !== undefined) {
                    result[index] += node.connectionDetails[targetOrganIRI].length;
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