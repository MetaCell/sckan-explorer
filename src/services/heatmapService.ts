import {HierarchicalNode, Organ} from "../models/explorer.ts";
import {ListItem} from "../components/ConnectivityGrid.tsx";
import {ROOTS} from "./hierarchyService.ts";

export function getYAxis(hierarchicalNodes: Record<string, HierarchicalNode>): ListItem[] {
    function buildListItem(nodeId: string): ListItem {
        const node = hierarchicalNodes[nodeId];
        const childrenListItems: (ListItem | string)[] = [];

        node.children.forEach(childId => {
            const childNode = hierarchicalNodes[childId];
            if (childNode && childNode.children.size > 0) {
                childrenListItems.push(buildListItem(childId));
            } else if (childNode) {
                childrenListItems.push(childNode.name);
            }
        });

        return {
            label: node.name,
            options: childrenListItems,
            expanded: false // Default to collapsed
        };
    }


    return ROOTS.map(root => {
        return hierarchicalNodes[root.id] ? buildListItem(root.id) : null;
    }).filter(item => item !== null) as ListItem[];
}

export function getXAxis(organs: Organ[]): string[] {
    // TODO: We need to see how to sort it
    return organs.map(organ => organ.name);
}