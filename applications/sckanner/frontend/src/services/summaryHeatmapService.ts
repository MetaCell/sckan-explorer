import chroma from 'chroma-js';
import {
  HierarchicalItem,
  KsPerPhenotype,
  KsRecord,
} from '../components/common/Types.ts';
import {
  ConnectionSummary,
  Filters,
  SummaryFilters,
} from '../context/DataContext.ts';
import {
  HierarchicalNode,
  KnowledgeStatement,
  Organ,
  BaseEntity,
  SortedResults,
} from '../models/explorer.ts';
import {
  OTHER_PHENOTYPE_LABEL,
  DESTINATIONS_ORDER,
  STRINGS_NUMBERS,
} from '../settings.ts';

export const generatePhenotypeColors = (num: number) => {
  const scale = chroma
    .scale([
      'red',
      'blue',
      'green',
      'orange',
      'purple',
      'gray',
      'brown',
      'cyan',
      'magenta',
      'pink',
    ])
    .mode('lch')
    .colors(num);
  return scale;
};

export function convertViaToString(via: string[]): string {
  if (via.length === 0) return '-';
  if (via.length > 1) {
    return via.join(', ').replace(/,(?=[^,]*$)/, ' and');
  }
  return via[0];
}

export function getAllViasFromConnections(connections: KsRecord): {
  [key: string]: string;
} {
  const vias: { [key: string]: string } = {};
  Object.values(connections).forEach((connection) => {
    if (connection.vias && connection.vias.length > 0) {
      const flattenedVias = connection.vias.flatMap(
        (via) => via.anatomical_entities,
      );
      flattenedVias.forEach((via) => {
        vias[via.id] = via.name;
      });
    }
  });
  return vias;
}

export function getAllPhenotypes(connections: KsRecord): string[] {
  const phenotypeNames: Set<string> = new Set();

  Object.values(connections).forEach((ks) => {
    if (ks.phenotype) {
      phenotypeNames.add(ks.phenotype);
    }
    if (ks.circuit_type) {
      phenotypeNames.add(ks.circuit_type);
    }
    if (!ks.phenotype && !ks.circuit_type) {
      phenotypeNames.add(OTHER_PHENOTYPE_LABEL);
    }
    if (ks.projection) {
      phenotypeNames.add(ks.projection);
    }
  });

  return Array.from(phenotypeNames).sort();
}

export const getNerveFilters = (
  viasConnection: { [key: string]: string },
  majorNerves: Set<string>,
) => {
  const nerves: { [key: string]: string } = {};
  Object.keys(viasConnection).forEach((via) => {
    if (majorNerves.has(via)) {
      nerves[via] = viasConnection[via];
    }
  });
  return nerves;
};

export function summaryFilterKnowledgeStatements(
  knowledgeStatements: Record<string, KnowledgeStatement>,
  summaryFilters: SummaryFilters,
): Record<string, KnowledgeStatement> {
  const phenotypeIds = summaryFilters.Phenotype.map((option) => option.id);
  const nerveIds = summaryFilters.Nerve.map((option) => option.id);
  return Object.entries(knowledgeStatements).reduce(
    (filtered, [id, ks]) => {
      const phenotypeMatch =
        !phenotypeIds.length ||
        phenotypeIds.includes(ks.phenotype) ||
        (ks.circuit_type && phenotypeIds.includes(ks.circuit_type)) ||
        (ks.projection && phenotypeIds.includes(ks.projection));
      const nerveMatch =
        !nerveIds.length ||
        ks.vias?.some((via) =>
          via.anatomical_entities
            .map((entity) => entity.id)
            .some((id) => nerveIds.includes(id)),
        );
      if (phenotypeMatch && nerveMatch) {
        filtered[id] = ks;
      }
      return filtered;
    },
    {} as Record<string, KnowledgeStatement>,
  );
}

// NOTE: this function is similar to /services/heatmapService.ts - getHeatmapData
// output type - PhenotypeKsIdMap[][]
// ***** Recursive function - traverseItems *****
// logic to note below - item.expanded
// If item.expanded is true, store the data for the current item/level and traverse further into the expanded item
// else just store the data for that level
export function getSecondaryHeatmapData(
  yAxis: HierarchicalItem[],
  connections: Map<string, KsPerPhenotype[]>,
) {
  const newData: KsPerPhenotype[][] = [];

  function addDataForItem(item: HierarchicalItem) {
    const itemData = connections.get(item.id);
    if (itemData) {
      newData.push(itemData);
    }
  }

  function traverseItems(items: HierarchicalItem[], fetchNextLevel: boolean) {
    items?.forEach((item) => {
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

export function calculateSecondaryConnections(
  hierarchicalNodes: Record<string, HierarchicalNode>,
  destinationsRecord: Record<string, Organ>,
  allKnowledgeStatements: Record<string, KnowledgeStatement>,
  summaryFilters: SummaryFilters,
  hierarchyNode: HierarchicalNode,
): Map<string, KsPerPhenotype[]> {
  // Apply filters to organs and knowledge statements

  const knowledgeStatements = summaryFilterKnowledgeStatements(
    allKnowledgeStatements,
    summaryFilters,
  );

  const organIndexMap = Object.values(destinationsRecord).reduce<
    Record<string, number>
  >((map, organ, index) => {
    map[organ.id] = index;
    return map;
  }, {});

  // Memoization map to store computed results for nodes
  const memo = new Map<string, KsPerPhenotype[]>();

  // Function to compute node connections with memoization
  function computeNodeConnections(nodeId: string): KsPerPhenotype[] {
    if (memo.has(nodeId)) {
      return memo.get(nodeId)!;
    }

    const node = hierarchicalNodes[nodeId];
    const result: KsPerPhenotype[] = Object.values(destinationsRecord).map(
      () => ({}),
    );

    if (node.children && node.children.size > 0) {
      node.children.forEach((childId) => {
        const childConnections = computeNodeConnections(childId);
        childConnections.forEach((child, index) => {
          Object.keys(child).forEach((phenotype) => {
            if (!result[index][phenotype]) {
              result[index][phenotype] = { ksIds: [] };
            }
            result[index][phenotype].ksIds = result[index][
              phenotype
            ].ksIds.concat(child[phenotype].ksIds);
          });
        });
      });
    } else if (node.connectionDetails) {
      // Add the sub end organs to the connection details
      Object.keys(node.connectionDetails).forEach((endOrganIRI) => {
        const subOrgans = node.connectionDetails![endOrganIRI];
        if (subOrgans === undefined) return;

        Object.keys(subOrgans).forEach((subOrgan) => {
          const index = organIndexMap[subOrgan];
          if (index === undefined) return;

          const knowledgeStatementIds = subOrgans[subOrgan].filter(
            (ksId) => ksId in knowledgeStatements,
          );

          knowledgeStatementIds.forEach((ksId) => {
            const phenotype =
              knowledgeStatements[ksId].phenotype ||
              knowledgeStatements[ksId].circuit_type ||
              knowledgeStatements[ksId].projection ||
              OTHER_PHENOTYPE_LABEL;
            const circuit_type = knowledgeStatements[ksId].circuit_type;
            const projection = knowledgeStatements[ksId].projection;
            if (!result[index][phenotype]) {
              result[index][phenotype] = { ksIds: [] };
            }
            result[index][phenotype].ksIds.push(ksId);
            if (circuit_type !== '') {
              if (!result[index][circuit_type]) {
                result[index][circuit_type] = { ksIds: [] };
              }
              result[index][circuit_type].ksIds.push(ksId);
            }
            if (projection !== '') {
              if (!result[index][projection]) {
                result[index][projection] = { ksIds: [] };
              }
              result[index][projection].ksIds.push(ksId);
            }
          });
        });
      });
    }

    memo.set(nodeId, result);
    return result;
  }

  computeNodeConnections(hierarchyNode.id);
  return memo;
}

export const getNormalizedValueForMinMax = (
  value: number,
  min: number,
  max: number,
): number => {
  // keep the min 0 always...
  // Ex. for situations where min is 4... the value 4 will not be shown...
  min = 0;
  if (max === 0) return 0;
  return max !== min ? (value - min) / (max - min) : 1;
};

export function getXAxisForHeatmap(endorgan: Organ) {
  if (endorgan?.children) {
    const results = Array.from(endorgan.children.values()).map(
      (endOrgan) => endOrgan.name,
    );
    return results;
  }
  return [];
}

export const getDestinations = (
  connection: ConnectionSummary,
): Record<string, Organ> => {
  return Array.from(connection.endOrgan?.children?.values()).reduce(
    (acc, organ, index) => {
      acc[organ.id] = {
        ...organ,
        children: new Map<string, BaseEntity>(),
        order: index,
      };
      return acc;
    },
    {} as Record<string, Organ>,
  );
};

export const getConnectionDetails = (
  uniqueKS: KsRecord,
  connectionPage: number,
): KnowledgeStatement => {
  return uniqueKS !== undefined
    ? uniqueKS[Object.keys(uniqueKS)[connectionPage - 1]]
    : ({} as KnowledgeStatement);
};

export const reorderXAxis = (xAxis: string[]): string[] => {
  const reorderedXAxis: string[] = [];
  const anatomicallySorted: string[] = [];
  // First sort by numbers
  STRINGS_NUMBERS.forEach((order) => {
    xAxis.forEach((destination) => {
      if (
        destination.toLowerCase().includes(order.toLowerCase()) &&
        !reorderedXAxis.includes(destination)
      ) {
        reorderedXAxis.push(destination);
      }
    });
  });

  // Add the remaning destinations
  xAxis.forEach((destination) => {
    if (!reorderedXAxis.includes(destination)) {
      reorderedXAxis.push(destination);
    }
  });

  // Then sort anatomically
  DESTINATIONS_ORDER.forEach((entity) => {
    reorderedXAxis.forEach((destination) => {
      if (
        destination.toLowerCase().includes(entity.toLowerCase()) &&
        !anatomicallySorted.includes(destination)
      ) {
        anatomicallySorted.push(destination);
      }
    });
  });

  // Add the remaning destinations
  reorderedXAxis.forEach((destination) => {
    if (!anatomicallySorted.includes(destination)) {
      anatomicallySorted.push(destination);
    }
  });

  return anatomicallySorted;
};

export const sortHeatmapData = (
  originalDestinationsArray: string[],
  reorderedDestinationsArray: string[],
  data: KsPerPhenotype[][],
): SortedResults => {
  const newData: KsPerPhenotype[][] = [];
  let counter = 0;
  data.forEach((item) => {
    newData.push(Array(originalDestinationsArray.length).fill({}));
    item.forEach((phenotype) => {
      Object.keys(phenotype).forEach((key) => {
        counter += phenotype[key].ksIds.length;
      });
    });
  });
  originalDestinationsArray.forEach((originalPosition, index) => {
    const newPosition = reorderedDestinationsArray.indexOf(originalPosition);
    data.forEach((_row, innerIndex) => {
      newData[innerIndex][newPosition] = data[innerIndex][index];
    });
  });
  return {
    data: newData,
    total: counter,
  };
};

export const extractEndOrganFiltersFromEntities = (
  filters = {} as Filters,
  organs = {} as Record<string, Organ>,
) => {
  const updatedFilters = {
    ...filters,
    EndOrgan: filters.EndOrgan ? [...filters.EndOrgan] : [],
  };
  const endOrganIds = new Set(Object.keys(organs));
  const remainingEntities = [];

  if (filters.Entities && filters.Entities.length > 0) {
    for (const entity of filters.Entities) {
      if (endOrganIds.has(entity.id)) {
        if (!updatedFilters.EndOrgan.some((e) => e.id === entity.id)) {
          updatedFilters.EndOrgan.push(entity);
        }
      } else {
        remainingEntities.push(entity);
      }
    }
    updatedFilters.Entities = remainingEntities;
  }

  return updatedFilters;
};
