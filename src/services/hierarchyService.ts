import { BaseEntity, HierarchicalNode, Organ } from '../models/explorer.ts';
import { Binding, JsonData, OrderJson } from '../models/json.ts';
import {
  HIERARCHY_ID_PATH_DELIMITER,
  OTHER_X_AXIS_ID,
  OTHER_X_AXIS_LABEL,
} from '../settings.ts';

interface RootNode {
  name: string;
  id: string;
  isAncestor: (a_l1_name: string) => boolean;
}

interface PostProcessNode {
  entry: Binding;
  currentParentId: string;
  leafNodeId: string;
}

const CNS = {
  name: 'Central nervous system',
  id: 'http://purl.obolibrary.org/obo/UBERON_0001017',
  isAncestor: (a_l1_name: string) =>
    a_l1_name == 'brain' || a_l1_name == 'spinal cord',
} as RootNode;

const PNS = {
  name: 'Peripheral nervous system',
  id: 'http://purl.obolibrary.org/obo/UBERON_0000010',
  isAncestor: (a_l1_name: string) => a_l1_name !== 'brain' && a_l1_name !== '',
} as RootNode;

const UNK = {
  name: 'Others',
  id: 'Others_Y_Axis_ID',
  isAncestor: (a_l1_name: string) => a_l1_name == '',
} as RootNode;

export const ROOTS = [CNS, PNS, UNK];

export const getHierarchicalNodes = (
  jsonData: JsonData,
  orderJson: OrderJson,
) => {
  const { results } = jsonData;

  // Initialize root nodes
  const hierarchicalNodes: Record<string, HierarchicalNode> = ROOTS.reduce(
    (acc, rootNode) => {
      acc[rootNode.id] = {
        id: rootNode.id,
        name: rootNode.name,
        uri: '',
        children: new Set<string>(),
      };
      return acc;
    },
    {} as Record<string, HierarchicalNode>,
  );

  const postProcessingNodes: Array<PostProcessNode> = [];

  results.bindings.forEach((entry) => {
    const a_l1_name = entry.A_L1?.value || '';
    let currentParentId = getRootNode(a_l1_name);
    let currentPath = currentParentId;

    // Handle all hierarchy levels until there are no more A_LX_ID entries
    let level = 1;
    while (entry[`A_L${level}_ID`]) {
      const levelId = entry[`A_L${level}_ID`]?.value;
      const levelName = entry[`A_L${level}`]?.value;

      if (levelId && levelName) {
        currentPath += `${HIERARCHY_ID_PATH_DELIMITER}${levelId}`; // Append current level ID to path to create a unique path identifier

        // Get or create the hierarchical node
        if (!hierarchicalNodes[currentPath]) {
          hierarchicalNodes[currentPath] = {
            id: currentPath,
            name: levelName,
            uri: '',
            children: new Set<string>(),
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
      const leafNodeId =
        currentPath + `${HIERARCHY_ID_PATH_DELIMITER}${entry.A_ID.value}`;
      const leafNodeName = entry.A.value;

      // Get or create the leaf node
      let leafNode = hierarchicalNodes[leafNodeId];
      if (!leafNode) {
        leafNode = {
          id: leafNodeId,
          name: leafNodeName,
          uri: '',
          children: new Set<string>(),
          connectionDetails: {},
          destinationDetails: {},
        };
        hierarchicalNodes[leafNodeId] = leafNode;
      }

      // Update or initialize connection details
      leafNode.connectionDetails = leafNode.connectionDetails || {};
      leafNode.destinationDetails = leafNode.destinationDetails || {};

      const neuronId = entry.Neuron_ID?.value;
      let targetOrganIRI = entry.Target_Organ_IRI?.value;
      let endOrganIRI = entry.B_ID?.value;

      if (!targetOrganIRI || !endOrganIRI) {
        postProcessingNodes.push({
          entry,
          currentParentId,
          leafNodeId,
        });
      } else {
        if (neuronId) {
          if (!targetOrganIRI) {
            console.warn(
              `Target_Organ_IRI not found for entry with Neuron_ID: ${neuronId}`,
            );
            targetOrganIRI = OTHER_X_AXIS_ID;
          }
          if (!endOrganIRI) {
            endOrganIRI = OTHER_X_AXIS_ID;
            console.warn(
              `B_ID not found for entry with Neuron_ID: ${neuronId}`,
            );
          }

          // Ensure connectionDetails for this targetOrganIRI is initialized
          if (!leafNode.connectionDetails[targetOrganIRI]) {
            leafNode.connectionDetails[targetOrganIRI] = []; // Initialize as an empty set
          }
          if (!leafNode.destinationDetails[endOrganIRI]) {
            leafNode.destinationDetails[endOrganIRI] = []; // Initialize as an empty array
          }

          // Add the KnowledgeStatement to the array for this target organ
          leafNode.connectionDetails[targetOrganIRI].push(neuronId);
          leafNode.destinationDetails[endOrganIRI].push(neuronId);
        } else {
          if (!neuronId) {
            console.error(`Error: Neuron_ID not found for entry`);
          }
        }

        // Add this leaf node's path to the parent's children set
        hierarchicalNodes[currentParentId].children.add(leafNodeId);
      }
    }
  });

  postProcessingNodes.forEach((node) => {
    const entry: Binding = node.entry;
    const currentParentId = node.currentParentId;
    const leafNodeId = node.leafNodeId;
    const neuronId = entry.Neuron_ID?.value;
    let targetOrganIRI = entry.Target_Organ_IRI?.value;
    let endOrganIRI = entry.B_ID?.value;
    const leafNodeName = entry?.A?.value || '';
    let leafNode = hierarchicalNodes[leafNodeId];
    if (!leafNode) {
      leafNode = {
        id: leafNodeId,
        name: leafNodeName,
        uri: '',
        children: new Set<string>(),
        connectionDetails: {},
        destinationDetails: {},
      };
      hierarchicalNodes[leafNodeId] = leafNode;
    }

    // Update or initialize connection details
    leafNode.connectionDetails = leafNode.connectionDetails || {};
    leafNode.destinationDetails = leafNode.destinationDetails || {};

    if (neuronId) {
      if (!targetOrganIRI) {
        console.warn(
          `Target_Organ_IRI not found for entry with Neuron_ID: ${neuronId}`,
        );
        targetOrganIRI = OTHER_X_AXIS_ID;
      }
      if (!endOrganIRI) {
        endOrganIRI = OTHER_X_AXIS_ID;
        console.warn(`B_ID not found for entry with Neuron_ID: ${neuronId}`);
      } else {
        if (leafNode.connectionDetails[endOrganIRI]) {
          targetOrganIRI = endOrganIRI;
        }
      }

      // Ensure connectionDetails for this targetOrganIRI is initialized
      if (!leafNode.connectionDetails[targetOrganIRI]) {
        leafNode.connectionDetails[targetOrganIRI] = []; // Initialize as an empty set
      }
      if (!leafNode.destinationDetails[endOrganIRI]) {
        leafNode.destinationDetails[endOrganIRI] = []; // Initialize as an empty array
      }

      // Add the KnowledgeStatement to the array for this target organ
      leafNode.connectionDetails[targetOrganIRI].push(neuronId);
      leafNode.destinationDetails[endOrganIRI].push(neuronId);
    } else {
      if (!neuronId) {
        console.error(`Error: Neuron_ID not found for entry`);
      }
    }

    // Add this leaf node's path to the parent's children set
    hierarchicalNodes[currentParentId].children.add(leafNodeId);
  });

  // Sort the children of each node
  Object.values(hierarchicalNodes).forEach((node) => {
    if (node.children) {
      node.children = new Set(
        Array.from(node.children).sort((nodeAPath, nodeBPath) => {
          const nodeA = hierarchicalNodes[nodeAPath];
          const nodeB = hierarchicalNodes[nodeBPath];

          // First, compare based on whether they have children
          if (nodeA.children.size > 0 && nodeB.children.size === 0) return -1;
          if (nodeA.children.size === 0 && nodeB.children.size > 0) return 1;

          // Check if the current node's id exists in orderJson
          const order = orderJson[getNodeIdFromPath(node.id)];
          if (order) {
            const idA = getNodeIdFromPath(nodeAPath);
            const idB = getNodeIdFromPath(nodeBPath);
            const indexA = order.indexOf(idA);
            const indexB = order.indexOf(idB);

            // Both nodes are in the order array
            if (indexA !== -1 && indexB !== -1) {
              return indexA - indexB;
            }

            // Only nodeA is in the order array
            if (indexA !== -1) {
              return -1;
            }

            // Only nodeB is in the order array
            if (indexB !== -1) {
              return 1;
            }
          }

          // Fallback to natural sort
          return naturalSort(nodeA.name, nodeB.name);
        }),
      );
    }
  });

  return hierarchicalNodes;
};

function getRootNode(a_l1_name: string): string {
  return ROOTS.find((root) => root.isAncestor(a_l1_name))?.id || UNK.id;
}

export const getOrgans = (jsonData: JsonData): Record<string, Organ> => {
  const { bindings } = jsonData.results;
  const organsRecord: Record<string, Organ> = {};
  let creationOrder = 0;

  organsRecord[OTHER_X_AXIS_ID] = {
    id: OTHER_X_AXIS_ID,
    name: OTHER_X_AXIS_LABEL,
    children: new Map<string, BaseEntity>(),
    order: 0,
  };

  bindings.forEach((binding: Binding) => {
    const organId = binding.Target_Organ_IRI?.value;
    const organName = binding.Target_Organ?.value;
    const childId = binding.B_ID?.value;
    const childName = binding.B?.value;

    if (organId && organName) {
      if (!organsRecord[organId]) {
        organsRecord[organId] = {
          id: organId,
          name: organName,
          children: new Map<string, BaseEntity>(),
          order: ++creationOrder,
        };
      }

      organsRecord[organId].children.set(organId, {
        id: organId,
        name: organName,
      });

      if (childId && childName) {
        const organ = organsRecord[organId];
        if (!organ.children.has(childId)) {
          organ.children.set(childId, { id: childId, name: childName });
        }
      }
    } else {
      if (childId && childName) {
        const otherOrgan = organsRecord[OTHER_X_AXIS_ID];
        if (!otherOrgan.children.has(childId)) {
          otherOrgan.children.set(childId, { id: childId, name: childName });
        }
      }
    }
  });

  // Assign the highest order number to OTHER_X_AXIS_ID
  organsRecord[OTHER_X_AXIS_ID].order = creationOrder + 1;

  return organsRecord;
};

const naturalSort = (a: string, b: string) => {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
};

const getNodeIdFromPath = (fullPath: string): string => {
  const parts = fullPath.split(HIERARCHY_ID_PATH_DELIMITER);
  return parts[parts.length - 1];
};
