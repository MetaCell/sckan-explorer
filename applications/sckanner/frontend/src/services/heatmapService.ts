import {
  HierarchicalNode,
  KnowledgeStatement,
  Organ,
} from '../models/explorer.ts';
import { ROOTS } from './hierarchyService.ts';
import {
  HierarchicalItem,
  HeatmapMatrixInformation,
  Option,
  KsRecord,
  LabelIdPair,
} from '../components/common/Types.ts';
import { Filters } from '../context/DataContext.ts';
import { extractEndOrganFiltersFromEntities } from './summaryHeatmapService.ts';

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
) {
  const heatmapInformation: HeatmapMatrixInformation = {
    heatmapMatrix: [],
    detailedHeatmap: [],
  };

  function addDataForItem(item: HierarchicalItem) {
    const itemConnections = connections.get(item.id);
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

export function filterKnowledgeStatements(
  knowledgeStatements: Record<string, KnowledgeStatement>,
  hierarchicalNodes: Record<string, HierarchicalNode>,
  filters: Filters,
  organs?: Record<string, Organ>,
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

  const newFilters = extractEndOrganFiltersFromEntities(filters, organs);
  const entityIds =
    newFilters.Entities?.flatMap((option) =>
      isLeaf(option.id, hierarchicalNodes)
        ? option.id
        : getLeafDescendants(option.id, hierarchicalNodes),
    ) || [];

  return Object.entries(knowledgeStatements).reduce(
    (filtered, [id, ks]) => {
      const phenotypeMatch =
        !phenotypeIds.length || phenotypeIds.includes(ks.phenotype);
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

      if (
        phenotypeMatch &&
        apiNATOMYMatch &&
        speciesMatch &&
        viaMatch &&
        originMatch &&
        entityMatch
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
