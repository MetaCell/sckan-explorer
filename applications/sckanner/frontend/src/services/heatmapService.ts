import {
  HierarchicalNode,
  KnowledgeStatement,
  Organ,
} from '../models/explorer.ts';
import { ROOTS } from './hierarchyService.ts';
import {
  HierarchicalItem,
  HierarchicalXItem,
  XLabelIdPair,
  HeatmapMatrixInformation,
  Option,
  KsRecord,
  LabelIdPair,
  HeatmapMode,
} from '../components/common/Types.ts';
import { Filters } from '../context/DataContext.ts';
import endOrganCategories from '../data/endOrganCategories.json';

export function getYAxis(
  hierarchicalNodes: Record<string, HierarchicalNode>,
  hierarchyNode?: Record<string, HierarchicalNode>,
): HierarchicalItem[] {
  function buildListItem(nodeId: string): HierarchicalItem {
    const node = hierarchicalNodes[nodeId];
    const childrenListItems: HierarchicalItem[] = [];

    node.children.forEach((childId) => {
      childrenListItems.push(buildListItem(childId));
    });

    return {
      id: nodeId,
      label: node.name,
      children: childrenListItems,
      expanded: false, // Default to collapsed
    };
  }

  const yRoot = hierarchyNode ? Object.values(hierarchyNode) : ROOTS;
  return yRoot
    .map((root) => {
      return hierarchicalNodes[root.id] ? buildListItem(root.id) : null;
    })
    .filter((item) => item !== null) as HierarchicalItem[];
}

export function getXAxisOrgans(organs: Record<string, Organ>): Organ[] {
  return Object.values(organs)
    .sort((a, b) => a.order - b.order)
    .map((organ) => organ);
}

// X-axis hierarchy functions
export function getXAxisHierarchy(
  organs: Record<string, Organ>,
): HierarchicalXItem[] {
  // Use the imported categories
  const categories = Object.values(endOrganCategories) as {
    id: string;
    label: string;
    children: string[];
  }[];

  // Create hierarchy based on actual organs data
  const organsByName: Record<string, Organ> = {};
  Object.values(organs).forEach((organ) => {
    organsByName[organ.name.toLowerCase()] = organ;
  });

  return categories
    .map((category) => ({
      id: category.id,
      label: category.label,
      expanded: false,
      children: category.children
        .map((organName) => {
          const organ = organsByName[organName.toLowerCase()];
          return organ
            ? {
                id: organ.id,
                label: organ.name,
                expanded: false,
                children: [] as HierarchicalXItem[],
              }
            : null;
        })
        .filter((item): item is HierarchicalXItem => item !== null)
        .sort((a, b) => {
          const organA = organsByName[a.label.toLowerCase()];
          const organB = organsByName[b.label.toLowerCase()];
          return (organA?.order || 0) - (organB?.order || 0);
        }),
    }))
    .filter((category) => category.children.length > 0);
}

export function generateXLabelsAndIds(
  xAxis: HierarchicalXItem[],
): XLabelIdPair {
  const labels: string[] = [];
  const ids: string[] = [];
  const expanded: boolean[] = [];
  const parentLabels: string[] = [];
  const isChild: boolean[] = [];

  function processItem(item: HierarchicalXItem) {
    if (item.expanded && item.children.length > 0) {
      // When expanded, add only children individually as vertical labels
      // The parent will be shown as a horizontal overlay, not in the heatmap
      item.children.forEach((child) => {
        labels.push(child.label);
        ids.push(child.id);
        expanded.push(false); // Children are not expandable in 2-level hierarchy
        parentLabels.push(item.label);
        isChild.push(true);
      });
    } else {
      // When collapsed, add the parent item as vertical label
      labels.push(item.label);
      ids.push(item.id);
      expanded.push(item.expanded);
      parentLabels.push('');
      isChild.push(false);
    }
  }

  xAxis.forEach((item) => processItem(item));

  return { labels, ids, expanded, parentLabels, isChild };
}

export function traceForwardConnectionPaths(
  startKsId: string,
  knowledgeStatements: Record<string, KnowledgeStatement>,
): string[][] {
  const paths: string[][] = [];

  function tracePath(currentKsId: string, currentPath: string[]): void {
    // Avoid infinite loops by checking if we've already visited this node in the current path
    if (currentPath.includes(currentKsId)) {
      return;
    }

    const currentKs = knowledgeStatements[currentKsId];
    if (!currentKs) {
      return;
    }

    const newPath = [...currentPath, currentKsId];

    // If this knowledge statement has no forward connections, it's the end of a path
    if (
      !currentKs.forwardConnections ||
      currentKs.forwardConnections.length === 0
    ) {
      if (newPath.length > 1) {
        // Only add paths with more than just the starting node
        paths.push(newPath);
      }
      return;
    }

    // Follow each forward connection
    currentKs.forwardConnections.forEach((fwNode) => {
      const fwId = fwNode.reference_uri;
      if (fwId && knowledgeStatements[fwId]) {
        tracePath(fwId, newPath);
      }
    });
  }

  // Start tracing from the initial knowledge statement
  tracePath(startKsId, []);

  return paths;
}

export function mapForwardConnections(
  allKnowledgeStatements: Record<string, KnowledgeStatement>,
): Map<string, Set<string>> {
  const forwardMap = new Map<string, Set<string>>();
  Object.entries(allKnowledgeStatements).forEach(([ksId, ks]) => {
    ks.forwardConnections.forEach((fwNode) => {
      const fwId = fwNode.reference_uri;
      // first check if the fwId exists in the allKnowledgeStatements since it might have been filtered out
      // if it does not exist, we skip adding it to the forwardMap
      if (!fwId || !allKnowledgeStatements[fwId]) return;
      // if the fwId does not exist in the forwardMap, we create a new Set
      // if it exists, we add the ksId to the Set
      // this way we can keep track of all knowledge statements that forward to a specific fwId
      if (fwId && !forwardMap.has(fwId)) {
        forwardMap.set(fwId, new Set([ksId]));
      } else if (fwId) {
        forwardMap.get(fwId)!.add(ksId);
      }
    });
  });

  return forwardMap;
}

export function calculateConnections(
  hierarchicalNodes: Record<string, HierarchicalNode>,
  allOrgans: Record<string, Organ>,
  allKnowledgeStatements: Record<string, KnowledgeStatement>,
  filters: Filters,
): Map<string, string[][]> {
  // Apply filters to organs and knowledge statements

  const knowledgeStatements = filterKnowledgeStatements(
    allKnowledgeStatements,
    hierarchicalNodes,
    filters,
    allOrgans,
  );
  const organs = filterOrgans(allOrgans, filters.EndOrgan);

  // Create a map of organ IRIs to their index positions for quick lookup
  const sortedOrgans = Object.values(allOrgans).sort(
    (a, b) => a.order - b.order,
  );
  const organIndexMap = sortedOrgans.reduce<Record<string, number>>(
    (map, organ, index) => {
      map[organ.id] = index;
      return map;
    },
    {},
  );

  // Memoization map to store computed results for nodes
  const memo = new Map<string, string[][]>();

  // Function to compute node connections with memoization
  function computeNodeConnections(nodeId: string): string[][] {
    if (memo.has(nodeId)) {
      return memo.get(nodeId)!;
    }

    const node = hierarchicalNodes[nodeId];
    const result: string[][] = Array.from(
      { length: Object.keys(allOrgans).length },
      () => [],
    );

    if (node.children && node.children.size > 0) {
      node.children.forEach((childId) => {
        const childConnections = computeNodeConnections(childId);
        childConnections.forEach((arr, index) => {
          result[index] = result[index].concat(arr);
        });
      });
    } else if (node.connectionDetails) {
      Object.keys(node.connectionDetails).forEach((targetOrganIRI) => {
        const index = organIndexMap[targetOrganIRI];
        if (index !== undefined && targetOrganIRI in organs) {
          const subOrgans = node.connectionDetails![targetOrganIRI];
          Object.keys(subOrgans).forEach((subOrgan) => {
            subOrgans[subOrgan].forEach((ksId) => {
              if (ksId in knowledgeStatements) {
                result[index].push(ksId);
              }
            });
          });
        }
      });
    }

    memo.set(nodeId, result);
    return result;
  }

  const connectionsMap = new Map<string, string[][]>();
  Object.values(hierarchicalNodes).forEach((node) => {
    connectionsMap.set(node.id, computeNodeConnections(node.id));
  });
  return connectionsMap;
}

export function getHeatmapData(
  yAxis: HierarchicalItem[],
  connections: Map<string, string[][]>,
  knowledgeStatements: Record<string, KnowledgeStatement>,
  filteredOrgans: Organ[],
  heatmapMode: HeatmapMode = HeatmapMode.Default,
) {
  const heatmapInformation: HeatmapMatrixInformation = {
    heatmapMatrix: [],
    synapticData: [],
    detailedHeatmap: [],
    synapticConnections: [],
  };

  function addDataForItem(item: HierarchicalItem) {
    const itemConnections = connections
      ?.get(item.id)
      ?.map((level) => [...new Set(level)]);
    if (itemConnections) {
      const itemConnectionsCount = itemConnections.map((arr) => arr.length);
      heatmapInformation.heatmapMatrix.push(itemConnectionsCount);
      heatmapInformation.detailedHeatmap.push({
        label: item.label,
        id: item.id || '',
        data: itemConnections || [],
      });
    }
  }

  function traverseItems(items: HierarchicalItem[], fetchNextLevel: boolean) {
    items.forEach((item) => {
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

  // iterate all the organs and all their children to create a map where from the children id we can get the index of the organ in the sortedOrgans array
  const childToParentMap = new Map<string, string>();
  Object.values(filteredOrgans).forEach((organ) => {
    if (organ.children instanceof Map) {
      organ.children.forEach((childOrgan) => {
        childToParentMap.set(childOrgan.id, organ.id);
      });
    }
  });

  const organIndexMap = filteredOrgans.reduce<Record<string, number>>(
    (map, organ, index) => {
      map[organ.id] = index;
      return map;
    },
    {},
  );

  if (heatmapMode === HeatmapMode.Synaptic) {
    const fwsMap = mapForwardConnections(knowledgeStatements);
    heatmapInformation.synapticConnections =
      heatmapInformation.detailedHeatmap.map((item) => {
        const id = item.id || '';
        const label = item.label;
        const synapticData: string[][][] = Array.from(
          { length: item.data.length },
          () => [],
        );
        item.data.forEach((ksIds) => {
          ksIds.forEach((ksId) => {
            if (fwsMap.has(ksId)) return;
            if (
              !knowledgeStatements[ksId] ||
              knowledgeStatements[ksId].forwardConnections.length === 0
            )
              return;

            // Use the new function to trace all forward connection paths
            const connectionPaths = traceForwardConnectionPaths(
              ksId,
              knowledgeStatements,
            );

            // Iterate through each connectivity path
            connectionPaths.forEach((path: string[]) => {
              // Get the last knowledge statement ID (end of the connectivity path)
              const endKsId = path[path.length - 1];
              const endKs = knowledgeStatements[endKsId];

              if (endKs && endKs.destinations) {
                // Process each destination to find the corresponding organ
                endKs.destinations.forEach((destination) => {
                  destination.anatomical_entities.forEach((entity) => {
                    const entityId = entity.id.split(' ')[0];
                    // Check if this entity belongs to any organ or if it's a child of an organ
                    let organIndex = organIndexMap[entityId];

                    // If not found directly, check if it's a child organ
                    if (organIndex === undefined) {
                      const parentOrganId = childToParentMap.get(entityId);
                      if (parentOrganId) {
                        organIndex = organIndexMap[parentOrganId];
                      }
                    }

                    // If we found a matching organ, push the path to that organ's cell (avoid duplicates)
                    if (organIndex !== undefined) {
                      const existingPaths = synapticData[organIndex];
                      const pathExists = existingPaths.some(
                        (existingPath: string[]) =>
                          existingPath.length === path.length &&
                          existingPath.every((id, index) => id === path[index]),
                      );

                      if (!pathExists) {
                        synapticData[organIndex].push(path);
                      }
                    }
                  });
                });
              }
            });
          });
        });
        return {
          id,
          label,
          synapticConnections: synapticData,
          directConnections: item.data,
        };
      });
    heatmapInformation.synapticData = heatmapInformation.heatmapMatrix.map(
      (row, rowIndex) => {
        const _row = row.map((_cell, colIndex) => {
          const uniqueUris = new Set<string>();
          heatmapInformation.synapticConnections[rowIndex].synapticConnections[
            colIndex
          ].forEach((path) => {
            path.forEach((uri) => uniqueUris.add(uri));
          });
          heatmapInformation.synapticConnections[rowIndex].directConnections[
            colIndex
          ].forEach((path) => {
            uniqueUris.add(path);
          });
          const connections = uniqueUris.size;
          return connections;
        });
        return _row;
      },
    );
  }

  return heatmapInformation;
}

export function getMinMaxConnections(connectionsMap: Map<string, string[][]>): {
  min: number;
  max: number;
} {
  let min = Infinity;
  let max = -Infinity;

  ROOTS.forEach((root) => {
    const connectionCounts = connectionsMap.get(root.id);
    if (connectionCounts) {
      // Flatten all connection counts and find min/max across all
      connectionCounts.forEach((connectionArray) => {
        const size = connectionArray.length;
        if (size < min) min = size;
        if (size > max) max = size;
      });
    }
  });

  return { min, max };
}

export function getMinMaxKnowledgeStatements(
  connectionsMap: Map<string, string[][]>,
): {
  min: number;
  max: number;
} {
  let min = Infinity;
  let max = -Infinity;

  const uniqueStrings = new Set<string>();
  // iterate all the items of the connectionsMap, each item contains an array of array of string. With these strings build
  // a set so that we get the unique list of strings contained in the connections map.
  connectionsMap.forEach((connectionArray) => {
    connectionArray.forEach((column) => {
      column.forEach((connection) => uniqueStrings.add(connection));
    });
  });
  min = 0;
  max = uniqueStrings.size;

  return { min, max };
}

export function filterOrgans(
  organs: Record<string, Organ>,
  endOrganFilter: Option[],
): Record<string, Organ> {
  if (endOrganFilter.length === 0) {
    // If no filter is selected, return all organs
    return organs;
  }
  const filterIds = endOrganFilter.map((option) => option.id);
  return Object.entries(organs).reduce(
    (filtered, [id, organ]) => {
      if (filterIds.includes(id)) {
        filtered[id] = organ;
      }
      return filtered;
    },
    {} as Record<string, Organ>,
  );
}

export function extractEndOrganKeys(organs: Record<string, Organ>) {
  const organKeys: string[] = [];
  Object.values(organs).forEach((organ) => {
    organKeys.push(organ.id); // Add the organ's own ID
    if (organ.children instanceof Map) {
      organ.children.forEach((childOrgan) => {
        organKeys.push(childOrgan.id); // Add each child's ID
      });
    }
  });
  return organKeys;
}

export function filterKnowledgeStatements(
  knowledgeStatements: Record<string, KnowledgeStatement>,
  hierarchicalNodes: Record<string, HierarchicalNode>,
  filters: Filters,
  allOrgans: Record<string, Organ>,
): Record<string, KnowledgeStatement> {
  const phenotypeIds = filters.Phenotype.map((option) => option.id);
  const apiNATOMYIds =
    (filters as Filters).apiNATOMY?.map((option) => option.id) || [];
  const speciesIds = filters.Species?.flatMap((option) => option.id) || [];

  const viaIds =
    filters.Via?.flatMap((option) =>
      isLeaf(option.id, hierarchicalNodes)
        ? option.id
        : getLeafDescendants(option.id, hierarchicalNodes),
    ) || [];

  const originIds =
    filters.Origin?.flatMap((option) =>
      isLeaf(option.id, hierarchicalNodes)
        ? option.id
        : getLeafDescendants(option.id, hierarchicalNodes),
    ) || [];

  const entityIds =
    filters.Entities?.flatMap((option) =>
      isLeaf(option.id, hierarchicalNodes)
        ? option.id
        : getLeafDescendants(option.id, hierarchicalNodes),
    ) || [];

  const organs = filterOrgans(allOrgans, filters.EndOrgan);
  const organKeysSelectedFromFilters = extractEndOrganKeys(organs);

  return Object.entries(knowledgeStatements).reduce(
    (filtered, [id, ks]) => {
      const phenotypeMatch =
        !phenotypeIds.length ||
        phenotypeIds.includes(ks.phenotype) ||
        phenotypeIds.includes(ks.circuit_type) ||
        phenotypeIds.includes(ks.projection);
      const apiNATOMYMatch =
        !apiNATOMYIds.length || apiNATOMYIds.includes(ks.apinatomy);
      const speciesMatch =
        !speciesIds.length ||
        ks.species?.some((species) => speciesIds.includes(species.id));
      const viaMatch =
        !viaIds.length ||
        ks.vias
          ?.flatMap((via) => via.anatomical_entities)
          .some((via) => viaIds.includes(via.id));
      const originMatch =
        !originIds.length ||
        ks.origins?.some((origin) => originIds.includes(origin.id));
      const entityMatch =
        !entityIds.length ||
        ks.destinations
          ?.flatMap((destination) => destination.anatomical_entities)
          .some((entity) => entityIds.includes(entity.id)) ||
        ks.vias
          ?.flatMap((via) => via.anatomical_entities)
          .some((entity) => entityIds.includes(entity.id)) ||
        ks.origins?.some((origin) => entityIds.includes(origin.id));

      const organMatch =
        filters.EndOrgan.length > 0
          ? ks.destinations
              ?.flatMap((destination) => destination.anatomical_entities)
              .some((destination) =>
                organKeysSelectedFromFilters.some((organKey) =>
                  destination.id.includes(organKey),
                ),
              )
          : true;

      if (
        phenotypeMatch &&
        apiNATOMYMatch &&
        speciesMatch &&
        viaMatch &&
        originMatch &&
        entityMatch &&
        organMatch
      ) {
        filtered[id] = ks;
      }
      return filtered;
    },
    {} as Record<string, KnowledgeStatement>,
  );
}

const isLeaf = (
  nodeId: string,
  hierarchicalNodes: Record<string, HierarchicalNode>,
): boolean => {
  return (
    !hierarchicalNodes[nodeId]?.children ||
    hierarchicalNodes[nodeId].children.size === 0
  );
};

const getLeafDescendants = (
  nodeId: string,
  hierarchicalNodes: Record<string, HierarchicalNode>,
): string[] => {
  const descendants: string[] = [];

  const getDescendants = (currentId: string) => {
    const node = hierarchicalNodes[currentId];
    if (node.children && node.children.size > 0) {
      node.children.forEach((childId) => getDescendants(childId));
    } else {
      const descendantID = currentId.split('#').pop() || currentId;
      descendants.push(descendantID);
    }
  };

  getDescendants(nodeId);
  return descendants;
};

export function getKnowledgeStatementMap(
  ksIds: string[],
  knowledgeStatements: Record<string, KnowledgeStatement>,
): KsRecord {
  const ksMap: KsRecord = {};
  ksIds.forEach((id: string) => {
    const ks = knowledgeStatements[id];
    if (ks) {
      ksMap[id] = ks;
    }
  });
  return ksMap;
}

export const getPhenotypeColors = (
  normalizedValue: number,
  phenotypeColors: string[],
): string => {
  // convert each to percentage values = for linear gradient
  // example: rgba(131, 0, 191, 0.5) 0%, rgba(131, 0, 191, 0.5) 50%, rgba(131, 0, 191, 0.5) 100%
  const phenotypeColorsWithPercentage = phenotypeColors.map((color, index) => {
    return `${color} ${(100 / phenotypeColors.length) * index}%, ${color} ${(100 / phenotypeColors.length) * (index + 1)}%`;
  });

  // if there are multiple colors, create a linear gradient
  const phenotypeColor =
    phenotypeColors.length > 1
      ? `linear-gradient(to right, ${phenotypeColorsWithPercentage.join(',')}`
      : phenotypeColors.length === 1
        ? phenotypeColors[0]
        : '';

  // ADD the following if we need opacity for secondary/phenotype heatmap -  replace the alpha value of the color with the normalized value
  // phenotypeColor = phenotypeColor?.replace(/rgba\(([^,]+),([^,]+),([^,]+),([^)]+)\)/g, `rgba($1,$2,$3,${normalizedValue})`).replace(
  //     /rgb\(([^,]+),([^,]+),([^,]+)\)/g, `rgba($1,$2,$3,${normalizedValue})`
  // );
  return phenotypeColor
    ? phenotypeColor
    : `rgba(131, 0, 191, ${normalizedValue})`;
};

export const generateYLabelsAndIds = (
  list: HierarchicalItem[],
  prefix = '',
): LabelIdPair => {
  let labels: string[] = [];
  let ids: string[] = [];
  let expanded: boolean[] = [];
  list?.forEach((item) => {
    const fullLabel = prefix ? `${prefix} - ${item.label}` : item.label;
    labels.push(fullLabel);
    ids.push(item.id);
    expanded.push(item.expanded);
    if (item.expanded && item.children.length > 0) {
      const children = generateYLabelsAndIds(item.children, fullLabel);
      labels = labels.concat(children.labels);
      ids = ids.concat(children.ids);
      expanded = expanded.concat(children.expanded);
    }
  });
  return { labels, ids, expanded };
};

type ConnectionsMap<T> = Map<string, T[]>;

export const filterYAxis = <T extends object>(
  items: HierarchicalItem[],
  connectionsMap: ConnectionsMap<T>,
): HierarchicalItem[] => {
  return items
    .map((item) => {
      const row = connectionsMap.get(item.id);
      const hasConnections =
        row && row.some((connections) => Object.keys(connections).length > 0);

      if (item.children) {
        const filteredChildren = filterYAxis(item.children, connectionsMap);
        return filteredChildren.length > 0 || hasConnections
          ? { ...item, children: filteredChildren }
          : null;
      }

      return hasConnections ? item : null;
    })
    .filter((item): item is HierarchicalItem => item !== null);
};

// Determine columns with data
export const getNonEmptyColumns = <T extends object>(
  filteredYAxis: HierarchicalItem[],
  connectionsMap: ConnectionsMap<T>,
): Set<number> => {
  const columnsWithData = new Set<number>();
  filteredYAxis.forEach((item) => {
    const row = connectionsMap.get(item.id);
    if (row) {
      row.forEach((connections, index) => {
        if (Object.keys(connections).length > 0) {
          columnsWithData.add(index);
        }
      });
    }
  });
  return columnsWithData;
};

// Recursive function to filter connections map
export const filterConnectionsMap = <T>(
  items: HierarchicalItem[],
  map: ConnectionsMap<T>,
  columnsWithData: Set<number>,
): ConnectionsMap<T> => {
  const filteredMap = new Map<string, T[]>();
  items.forEach((item) => {
    const row = map.get(item.id);
    if (row) {
      const filteredRow = row.filter((_, index) => columnsWithData.has(index));
      filteredMap.set(item.id, filteredRow);
    }
    if (item.children) {
      const childMap = filterConnectionsMap(
        item.children,
        map,
        columnsWithData,
      );
      childMap.forEach((value, key) => {
        filteredMap.set(key, value);
      });
    }
  });
  return filteredMap;
};

export const assignExpandedState = (
  yAxis: HierarchicalItem[],
  expandedState: string[],
): HierarchicalItem[] => {
  return yAxis.map((item: HierarchicalItem) => ({
    ...item,
    expanded: expandedState.includes(item.id),
    children: item.children
      ? assignExpandedState(item.children, expandedState)
      : item.children,
  }));
};
