import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  DataContext,
  Filters,
  ConnectionSummary,
  RightWidgetState,
} from './DataContext';
import {
  HierarchicalNode,
  KnowledgeStatement,
  Organ,
} from '../models/explorer.ts';
import { PhenotypeDetail } from '../components/common/Types.ts';
import { generatePhenotypeColors } from '../services/summaryHeatmapService.ts';
import { OTHER_PHENOTYPE_LABEL } from '../settings.ts';
import { filterKnowledgeStatements } from '../services/heatmapService.ts';
import { encodeURLState, URLState } from '../utils/urlStateManager.ts';

export const DataContextProvider = ({
  hierarchicalNodes,
  organs,
  majorNerves,
  knowledgeStatements,
  initialUrlState = {},
  selectedDatasnapshot,
  children,
}: PropsWithChildren<{
  hierarchicalNodes: Record<string, HierarchicalNode>;
  organs: Record<string, Organ>;
  majorNerves: Set<string>;
  knowledgeStatements: Record<string, KnowledgeStatement>;
  initialUrlState?: URLState;
  selectedDatasnapshot?: string;
}>) => {
  const [filters, setFilters] = useState<Filters>(
    initialUrlState.filters || {
      Origin: [],
      EndOrgan: [],
      Species: [],
      Phenotype: [],
      apiNATOMY: [],
      Via: [],
      Entities: [],
    },
  );

  const [selectedConnectionSummary, setSelectedConnectionSummary] =
    useState<ConnectionSummary | null>(null);

  const [selectedCluster, setSelectedCluster] = useState<string | null>(
    initialUrlState.selectedCluster || null,
  );

  const [rightWidgetState, setRightWidgetState] = useState<RightWidgetState>(
    initialUrlState.rightWidget || { type: null },
  );

  const updateUrlState = useCallback(() => {
    const urlState: URLState = {
      datasnapshot: selectedDatasnapshot,
      filters,
      selectedCluster: selectedCluster || undefined,
      rightWidget: rightWidgetState,
    };

    const encodedState = encodeURLState(urlState);
    const newUrl = `${window.location.pathname}${encodedState ? `?${encodedState}` : ''}`;

    // Update URL without triggering a page reload
    window.history.replaceState(null, '', newUrl);
  }, [filters, selectedCluster, rightWidgetState, selectedDatasnapshot]);
  // Update URL when state changes
  useEffect(() => {
    updateUrlState();
  }, [filters, selectedCluster, rightWidgetState, updateUrlState]);

  const phenotypes = useMemo(() => {
    const allPhenotypes = Object.values(knowledgeStatements).map(
      (ks) => ks.phenotype || OTHER_PHENOTYPE_LABEL,
    );
    return Array.from(new Set(allPhenotypes)); // Get unique phenotypes
  }, [knowledgeStatements]);

  const phenotypesColorMap = useMemo(() => {
    const colors = generatePhenotypeColors(phenotypes.length);
    const phenotypesList = [
      'sympathetic pre-ganglionic',
      'not specified',
      'parasympathetic',
      'parasympathetic post-ganglionic',
      'sympathetic post-ganglionic',
      'Post ganglionic phenotype',
      'parasympathetic pre-ganglionic',
      'enteric',
    ];
    const phenoColor: Record<string, string> = {};
    phenotypesList.forEach((phenotype, index) => {
      phenoColor[phenotype] = colors[index];
    });
    const colorMap: Record<string, PhenotypeDetail> = {};
    phenotypes.sort().forEach((phenotype, index) => {
      colorMap[phenotype] = {
        label: phenotype,
        color: phenoColor[phenotype] || colors[index],
      };
    });
    return colorMap;
  }, [phenotypes]);

  const updateSelectedConnectionSummary = useCallback(
    (
      summary:
        | Omit<ConnectionSummary, 'filteredKnowledgeStatements'>
        | ConnectionSummary
        | null,
      filters: Filters,
      hierarchicalNodes: Record<string, HierarchicalNode>,
    ) => {
      if (summary) {
        let filteredKnowledgeStatements = filterKnowledgeStatements(
          summary.connections,
          hierarchicalNodes,
          filters,
          organs,
        );

        filteredKnowledgeStatements = Object.fromEntries(
          Object.entries(filteredKnowledgeStatements).map(
            ([key, statement]) => [
              key,
              {
                ...statement,
                vias: statement.vias.map((via) => ({
                  ...via,
                  anatomical_entities: via.anatomical_entities.filter(
                    (entity) => majorNerves.has(entity.id),
                  ),
                })),
              },
            ],
          ),
        );

        return {
          ...summary,
          filteredKnowledgeStatements,
        };
      }
      return null;
    },
    [majorNerves, organs],
  );

  const handleSetSelectedConnectionSummary = (
    summary: Omit<ConnectionSummary, 'filteredKnowledgeStatements'> | null,
  ) => {
    const updatedSummary = updateSelectedConnectionSummary(
      summary,
      filters,
      hierarchicalNodes,
    );
    setSelectedConnectionSummary(updatedSummary);
  };

  useEffect(() => {
    setSelectedConnectionSummary((prevSummary) =>
      updateSelectedConnectionSummary(prevSummary, filters, hierarchicalNodes),
    );
  }, [filters, hierarchicalNodes, updateSelectedConnectionSummary]);

  const dataContextValue = {
    filters,
    organs,
    majorNerves,
    hierarchicalNodes,
    knowledgeStatements,
    setFilters,
    selectedConnectionSummary,
    setSelectedConnectionSummary: handleSetSelectedConnectionSummary,
    phenotypesColorMap,
    selectedCluster,
    setSelectedCluster,
    rightWidgetState,
    setRightWidgetState,
    updateUrlState,
  };

  return (
    <DataContext.Provider value={dataContextValue}>
      {children}
    </DataContext.Provider>
  );
};
