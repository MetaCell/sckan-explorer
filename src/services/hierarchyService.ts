import {HierarchicalNode, KnowledgeStatement, Organ} from "../models/explorer.ts";
import {Binding, JsonData} from "../models/json.ts";


const PATH_DELIMITER = "#"

interface RootNode {
    name: string;
    id: string;
    isAncestor: (a_l1_name: string) => boolean;
}


const CNS = {
    name: 'Central nervous system',
    id: "http://purl.obolibrary.org/obo/UBERON_0001017",
    isAncestor: (a_l1_name: string) => a_l1_name == "brain"
} as RootNode

const PNS = {
    name: 'Peripheral nervous system',
    id: "http://purl.obolibrary.org/obo/UBERON_0000010 ",
    isAncestor: (a_l1_name: string) => a_l1_name !== "brain" && a_l1_name !== ""
} as RootNode

const UNK = {
    name: 'Others',
    id: "-1",
    isAncestor: (a_l1_name: string) => a_l1_name == ""
} as RootNode

export const ROOTS = [CNS, PNS, UNK]


export const getHierarchicalNodes = (jsonData: JsonData) => {
    const {results} = jsonData;

    // Initialize root nodes
    const hierarchicalNodes: Record<string, HierarchicalNode> = ROOTS.reduce((acc, rootNode) => {
        acc[rootNode.id] = {
            id: rootNode.id,
            name: rootNode.name,
            children: new Set<string>()
        };
        return acc;
    }, {} as Record<string, HierarchicalNode>);

    results.bindings.forEach(entry => {
        const a_l1_name = entry.A_L1?.value || "";
        let currentParentId = getRootNode(a_l1_name);
        let currentPath = currentParentId;

        // Handle all hierarchy levels until there are no more A_LX_ID entries
        let level = 1;
        while (entry[`A_L${level}_ID`]) {
            const levelId = entry[`A_L${level}_ID`]?.value;
            const levelName = entry[`A_L${level}`]?.value;

            if (levelId && levelName) {
                currentPath += `${PATH_DELIMITER}${levelId}`; // Append current level ID to path to create a unique path identifier

                // Get or create the hierarchical node
                if (!hierarchicalNodes[currentPath]) {
                    hierarchicalNodes[currentPath] = {
                        id: currentPath,
                        name: levelName,
                        children: new Set<string>()
                    };
                }

                // Update parent node's children
                hierarchicalNodes[currentParentId].children.add(currentPath);


                // Update currentParentId for the next level
                currentParentId = currentPath;
            }
            level++;
        }

        // Process the leaf node given by A_ID column
        if (entry.A_ID && entry.A) {
            const leafNodeId = currentPath + `${PATH_DELIMITER}${entry.A_ID.value}`;
            const leafNodeName = entry.A.value;

            // Get or create the leaf node
            let leafNode = hierarchicalNodes[leafNodeId];
            if (!leafNode) {
                leafNode = {
                    id: leafNodeId,
                    name: leafNodeName,
                    children: new Set<string>(),
                    connectionDetails: {}
                };
                hierarchicalNodes[leafNodeId] = leafNode;
            }

            // Update or initialize connection details
            leafNode.connectionDetails = leafNode.connectionDetails || {};

            const neuronId = entry.Neuron_ID?.value;
            const targetOrganIRI = entry.Target_Organ_IRI?.value;

            if (neuronId && targetOrganIRI) {
                // Ensure connectionDetails for this targetOrganIRI is initialized
                if (!leafNode.connectionDetails[targetOrganIRI]) {
                    leafNode.connectionDetails[targetOrganIRI] = [];  // Initialize as an empty array
                }

                // Create or update the KnowledgeStatement
                const knowledgeStatement: KnowledgeStatement = {
                    id: neuronId,
                    phenotype: '',
                    apinatomy: '',
                    species: [],
                    via: [],
                    origins: [],
                    destinations: []
                };

                // Add the KnowledgeStatement to the array for this target organ
                leafNode.connectionDetails[targetOrganIRI].push(knowledgeStatement);
            } else {
                if (!targetOrganIRI) {
                    console.error(`Error: Target_Organ_IRI not found for entry with Neuron_ID: ${neuronId}`);
                }
                if (!neuronId) {
                    console.error(`Error: Neuron_ID not found for entry`);
                }
            }

            // Add this leaf node's path to the parent's children set
            hierarchicalNodes[currentParentId].children.add(leafNodeId);
        }
    });

    return hierarchicalNodes;
};

function getRootNode(a_l1_name: string): string {
    return ROOTS.find(root => root.isAncestor(a_l1_name))?.id || UNK.id;
}


export const getOrgans = (jsonData: JsonData): Organ[] => {
    const {bindings} = jsonData.results;
    const organSet = new Set<string>();
    const uniqueOrgans: Organ[] = [];

    bindings.forEach((binding: Binding) => {
        const organId = binding.Target_Organ_IRI?.value;
        const organName = binding.Target_Organ?.value;

        if (organId && organName && !organSet.has(organId)) {
            organSet.add(organId);
            uniqueOrgans.push({id: organId, name: organName});
        }
    });

    return uniqueOrgans;
}