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
      'aquamarine',
      'green',
      'orange',
      'purple',
      'gray',
      'brown',
      'cyan',
      'magenta',
      'pink',
      'yellow',
      'teal',
      'slategray',
      'hotpink',
      'skyblue',
      'darkseagreen',
      'navy',
      'gold',
      'coral',
      'darkorange',
      'crimson',
      'indigo',
      'olive',
      'maroon',
      'lime',
      'turquoise',
      'violet',
      'salmon',
      'plum',
      'orchid',
      'sienna',
      'peru',
      'tan',
      'chocolate',
      'darkgoldenrod',
      'mediumslateblue',
      'mediumorchid',
      'mediumvioletred',
      'mediumturquoise',
      'mediumseagreen',
      'mediumspringgreen',
      'mediumaquamarine',
      'lightseagreen',
      'lightcoral',
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
  console.log('getSecondaryHeatmapData function called with:', {
    yAxisLength: yAxis.length,
    connectionsSize: connections.size,
    yAxisItems: yAxis.map((item) => ({
      id: item.id,
      expanded: item.expanded,
      hasChildren: !!item.children,
    })),
  });
  
  const newData: KsPerPhenotype[][] = [];

  function addDataForItem(item: HierarchicalItem) {
    const itemData = connections.get(item.id);
    console.log('addDataForItem called for:', {
      itemId: item.id,
      hasData: !!itemData,
      dataLength: itemData?.length || 0,
    });
    if (itemData) {
      newData.push(itemData);
    }
  }

  function traverseItems(items: HierarchicalItem[], fetchNextLevel: boolean) {
    console.log('traverseItems called with:', {
      itemsLength: items?.length || 0,
      fetchNextLevel,
      itemsData:
        items?.map((item) => ({ id: item.id, expanded: item.expanded })) ||
        [],
    });
    
    items?.forEach((item) => {
      if (item.expanded) {
        console.log('Processing expanded item:', item.id);
        // Fetch data for the current expanded item
        addDataForItem(item);
        // Traverse further into the expanded item
        if (item.children && typeof item.children[0] !== 'string') {
          traverseItems(item.children as HierarchicalItem[], true);
        }
      } else if (fetchNextLevel) {
        console.log(
          'Processing non-expanded item with fetchNextLevel:',
          item.id,
        );
        // Fetch data for the immediate children of the last expanded item
        addDataForItem(item);
      }
    });
  }

  // Start traversal with the initial yAxis, allowing to fetch immediate children of the root if expanded
  traverseItems(yAxis, true);

  console.log('getSecondaryHeatmapData returning:', {
    newDataLength: newData.length,
    newDataStructure: newData.map((row) => row?.length || 0),
  });

  return newData;
}

export function calculateSecondaryConnections(
  hierarchicalNodes: Record<string, HierarchicalNode>,
  destinationsRecord: Record<string, Organ>,
  allKnowledgeStatements: Record<string, KnowledgeStatement>,
  summaryFilters: SummaryFilters,
  hierarchyNode: HierarchicalNode,
): Map<string, KsPerPhenotype[]> {
  console.log('🔥 calculateSecondaryConnections ENTRY POINT:', {
    hierarchyNodeId: hierarchyNode.id,
    hierarchyNodeName: hierarchyNode.name,
    destinationsCount: Object.keys(destinationsRecord).length,
    allKsCount: Object.keys(allKnowledgeStatements).length,
  });
  
  console.log('calculateSecondaryConnections called with:', {
    hierarchyNodeId: hierarchyNode.id,
    hierarchyNodeName: hierarchyNode.name,
    destinationsCount: Object.keys(destinationsRecord).length,
    destinationNames: Object.values(destinationsRecord)
      .slice(0, 3)
      .map((organ) => organ.name),
    allKsCount: Object.keys(allKnowledgeStatements).length,
    summaryFiltersNerve: summaryFilters.Nerve.length,
    summaryFiltersPhenotype: summaryFilters.Phenotype.length,
  });
  
  // Apply filters to organs and knowledge statements
  const knowledgeStatements = summaryFilterKnowledgeStatements(
    allKnowledgeStatements,
    summaryFilters,
  );

  console.log('After summaryFilterKnowledgeStatements:', {
    originalCount: Object.keys(allKnowledgeStatements).length,
    filteredCount: Object.keys(knowledgeStatements).length,
  });

  const organIndexMap = Object.values(destinationsRecord).reduce<
    Record<string, number>
  >((map, organ, index) => {
    map[organ.id] = index;
    return map;
  }, {});

  console.log('calculateSecondaryConnections organIndexMap:', {
    destinationsCount: Object.keys(destinationsRecord).length,
    organIndexMapSize: Object.keys(organIndexMap).length,
    organIndexMapSample: Object.entries(organIndexMap).slice(0, 3),
    organIndexMapAllKeys: Object.keys(organIndexMap),
    destinationsSample: Object.values(destinationsRecord)
      .slice(0, 3)
      .map((organ) => ({ id: organ.id, name: organ.name })),
    destinationsAllIds: Object.values(destinationsRecord).map(
      (organ) => organ.id,
    ),
  });

  // Memoization map to store computed results for nodes
  const memo = new Map<string, KsPerPhenotype[]>();

  // Function to compute node connections with memoization
  function computeNodeConnections(nodeId: string): KsPerPhenotype[] {
    console.log('computeNodeConnections called for nodeId:', nodeId);
    
    if (memo.has(nodeId)) {
      const memoResult = memo.get(nodeId)!;
      console.log('computeNodeConnections returning memoized result for:', {
        nodeId,
        resultLength: memoResult.length,
        resultSample: memoResult[0] ? Object.keys(memoResult[0]) : 'empty',
      });
      return memoResult;
    }

    const node = hierarchicalNodes[nodeId];
    if (!node) {
      console.log('computeNodeConnections - node not found:', nodeId);
      return [];
    }
    
    const result: KsPerPhenotype[] = Object.values(destinationsRecord).map(
      () => ({}),
    );
    
    console.log('computeNodeConnections initialized result:', {
      nodeId,
      nodeName: node.name,
      resultLength: result.length,
      hasChildren: !!(node.children && node.children.size > 0),
      hasConnectionDetails: !!node.connectionDetails,
    });

    if (node.children && node.children.size > 0) {
      console.log('computeNodeConnections - processing children for node:', {
        nodeId,
        childrenCount: node.children.size,
        childrenIds: Array.from(node.children),
      });
      
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
      console.log(
        'computeNodeConnections - processing connectionDetails for node:',
        {
          nodeId,
          connectionDetailsKeys: Object.keys(node.connectionDetails),
          connectionDetailsCount: Object.keys(node.connectionDetails).length,
        },
      );
      
      // Add the sub end organs to the connection details
      Object.keys(node.connectionDetails).forEach((endOrganIRI) => {
        const subOrgans = node.connectionDetails![endOrganIRI];
        if (subOrgans === undefined) return;
        
        console.log('computeNodeConnections - processing endOrganIRI:', {
          endOrganIRI,
          subOrgansKeys: Object.keys(subOrgans),
          subOrgansCount: Object.keys(subOrgans).length,
        });

        Object.keys(subOrgans).forEach((subOrgan) => {
          const index = organIndexMap[subOrgan];
          // console.log('computeNodeConnections - processing subOrgan:', {
          //   subOrgan,
          //   index,
          //   indexFound: index !== undefined,
          //   organIndexMapHasKey: subOrgan in organIndexMap,
          //   ksIds: subOrgans[subOrgan],
          //   ksIdsCount: subOrgans[subOrgan].length,
          // });
          
          if (index === undefined) return;

          const knowledgeStatementIds = subOrgans[subOrgan].filter(
            (ksId) => ksId in knowledgeStatements,
          );
          
          // console.log('computeNodeConnections - filtered ksIds:', {
          //   subOrgan,
          //   index,
          //   originalKsIdsCount: subOrgans[subOrgan].length,
          //   filteredKsIdsCount: knowledgeStatementIds.length,
          //   filteredKsIds: knowledgeStatementIds,
          // });

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
  
  console.log('calculateSecondaryConnections returning:', {
    memoSize: memo.size,
    memoKeys: Array.from(memo.keys()),
    hierarchyNodeIdInMemo: memo.has(hierarchyNode.id),
    hierarchyNodeConnections: memo.get(hierarchyNode.id)?.length || 0,
  });
  
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
  console.log('getXAxisForHeatmap called with:', {
    endOrganName: endorgan?.name,
    endOrganId: endorgan?.id,
    hasChildren: !!endorgan?.children,
    childrenSize: endorgan?.children?.size || 0,
    isVirtualCategory: endorgan?.isVirtualCategory,
  });
  
  if (endorgan?.children) {
    const results = Array.from(endorgan.children.values()).map(
      (endOrgan) => endOrgan.name,
    );
    console.log('getXAxisForHeatmap results:', results);
    return results;
  }
  console.log('getXAxisForHeatmap returning empty array');
  return [];
}

export const getDestinations = (
  connection: ConnectionSummary,
): Record<string, Organ> => {
  console.log('getDestinations called with:', {
    endOrganName: connection.endOrgan?.name,
    endOrganId: connection.endOrgan?.id,
    hasChildren: !!connection.endOrgan?.children,
    childrenSize: connection.endOrgan?.children?.size || 0,
    isVirtualCategory: connection.endOrgan?.isVirtualCategory,
    ksCount: Object.keys(connection.filteredKnowledgeStatements || {}).length,
  });
  
  // For virtual category organs, build destinations from actual knowledge statement destinations
  if (connection.endOrgan?.isVirtualCategory) {
    const destinationOrgans: Record<string, Organ> = {};
    let destinationIndex = 0;
    
    // Extract all unique destination organ IDs from knowledge statements
    Object.values(connection.filteredKnowledgeStatements || {}).forEach(
      (ks) => {
        ks.destinations.forEach((dest) => {
          dest.anatomical_entities.forEach((entity) => {
            if (!destinationOrgans[entity.id]) {
              destinationOrgans[entity.id] = {
                id: entity.id,
                name: entity.name,
                children: new Map<string, BaseEntity>(),
                order: destinationIndex++,
              };
            }
          });
        });
      },
    );
    
    console.log('getDestinations virtual category result:', {
      resultKeys: Object.keys(destinationOrgans),
      resultCount: Object.keys(destinationOrgans).length,
      sampleDestinations: Object.keys(destinationOrgans).slice(0, 3),
    });
    
    return destinationOrgans;
  }
  
  // For regular organs, use the existing logic
  const result = Array.from(connection.endOrgan?.children?.values()).reduce(
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
  
  console.log('getDestinations regular result:', {
    resultKeys: Object.keys(result),
    resultCount: Object.keys(result).length,
  });
  
  return result;
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

type ConnectionsMap<T> = Map<string, T[]>;

type FilterConnectionsMapResult<T> = {
  ksIds: Set<string>;
  filteredMap: Map<string, T[]>;
};

// Recursive function to filter connections map
export const filterConnectionsMap = <T>(
  items: HierarchicalItem[],
  map: ConnectionsMap<T>,
  columnsWithData: Set<number>,
): FilterConnectionsMapResult<T> => {
  const ksIds = new Set<string>();
  const filteredMap = new Map<string, T[]>();
  items.forEach((item) => {
    const row = map.get(item.id);
    if (row) {
      const filteredRow = row.filter((_, index) => columnsWithData.has(index));
      filteredMap.set(item.id, filteredRow);
    }
    if (item.children) {
      const childResult = filterConnectionsMap(
        item.children,
        map,
        columnsWithData,
      );
      childResult.filteredMap.forEach((value, key) => {
        filteredMap.set(key, value);
        value.forEach((valueChild) => {
          if (typeof valueChild === 'object' && valueChild !== null) {
            Object.keys(valueChild).forEach((phenotype) => {
              const phenoObj = valueChild as {
                [key: string]: { ksIds: string[] };
              };
              phenoObj[phenotype].ksIds.forEach((ksId) => ksIds.add(ksId));
            });
          }
        });
      });
      childResult.ksIds.forEach((ksId) => ksIds.add(ksId));
    }
  });
  // return both ksIds and filteredMap
  return { ksIds, filteredMap };
};
