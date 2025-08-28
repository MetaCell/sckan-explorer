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
  WidgetState,
  URLState,
} from './DataContext';
import {
  HierarchicalNode,
  KnowledgeStatement,
  Organ,
} from '../models/explorer.ts';
import { PhenotypeDetail, HeatmapMode } from '../components/common/Types.ts';
import { generatePhenotypeColors } from '../services/summaryHeatmapService.ts';
import { OTHER_PHENOTYPE_LABEL } from '../settings.ts';
import { filterKnowledgeStatements } from '../services/heatmapService.ts';
import {
  getUniqueOrigins,
  getUniqueOrgans,
  getUniqueSpecies,
  getUniquePhenotypes,
  getUniqueApinatomies,
  getUniqueVias,
  getUniqueAllEntities,
} from '../services/filterValuesService.ts';
import { getYAxis } from '../services/heatmapService.ts';
import { encodeURLState } from '../utils/urlStateManager.ts';

export const DataContextProvider = ({
  hierarchicalNodes,
  organs,
  majorNerves,
  knowledgeStatements,
  urlState,
  setUrlState,
  selectedDatasnapshot,
  children,
}: PropsWithChildren<{
  hierarchicalNodes: Record<string, HierarchicalNode>;
  organs: Record<string, Organ>;
  majorNerves: Set<string>;
  knowledgeStatements: Record<string, KnowledgeStatement>;
  urlState: URLState;
  setUrlState: (urlState: URLState) => void;
  selectedDatasnapshot: string;
}>) => {
  const initialFilters = useMemo<Filters>(
    () =>
      urlState && urlState.filters
        ? urlState.filters
        : {
            Origin: [],
            EndOrgan: [],
            Species: [],
            Phenotype: [],
            apiNATOMY: [],
            Via: [],
            Entities: [],
          },
    [urlState],
  );
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [heatmapMode, setHeatmapMode] = useState<HeatmapMode>(() => {
    const mode = urlState?.heatmapMode || HeatmapMode.Default;
    return mode;
  });

  const [selectedConnectionSummary, setSelectedConnectionSummary] =
    useState<ConnectionSummary | null>(null);

  const [widgetState, setWidgetState] = useState<WidgetState>(
    urlState || {
      datasnapshot: selectedDatasnapshot,
      view: null,
      leftWidgetConnectionId: null,
      rightWidgetConnectionId: null,
      filters: initialFilters,
      summaryFilters: null,
      heatmapExpandedState: null,
      secondaryHeatmapExpandedState: null,
    },
  );

  const switchHeatmapMode = () => {
    const mode =
      heatmapMode === HeatmapMode.Default
        ? HeatmapMode.Synaptic
        : HeatmapMode.Default;
    setHeatmapMode(mode);
  };

  const resetWidgetState = (datasnapshot: string) => {
    const resetURL: URLState = {
      datasnapshot: datasnapshot,
      view: null,
      leftWidgetConnectionId: null,
      rightWidgetConnectionId: null,
      filters: null,
      summaryFilters: null,
      connectionPage: null,
      heatmapExpandedState: null,
      secondaryHeatmapExpandedState: null,
      heatmapMode: urlState?.heatmapMode || HeatmapMode.Default, // Preserve URL heatmap mode or use default
    };
    const encodedURLState = encodeURLState(resetURL);
    const newURL = encodedURLState
      ? `${window.location.pathname}?${encodedURLState}`
      : window.location.pathname;
    window.history.replaceState(null, '', newURL);
    setWidgetState(resetURL);
    setUrlState(resetURL);
    // Only reset heatmapMode if it wasn't specified in the URL
    if (!urlState?.heatmapMode) {
      setHeatmapMode(HeatmapMode.Default);
    }
  };

  const updateURLState = useCallback(() => {
    const urlState: URLState = {
      datasnapshot: widgetState.datasnapshot || selectedDatasnapshot,
      filters: widgetState.filters,
      leftWidgetConnectionId: widgetState.leftWidgetConnectionId,
      rightWidgetConnectionId: widgetState.rightWidgetConnectionId,
      view: widgetState.view,
      summaryFilters: widgetState?.summaryFilters,
      connectionPage: widgetState?.connectionPage,
      heatmapExpandedState: widgetState?.heatmapExpandedState,
      secondaryHeatmapExpandedState: widgetState?.secondaryHeatmapExpandedState,
      heatmapMode: heatmapMode,
    };
    const encodedURLState = encodeURLState(urlState);
    const newURL = encodedURLState
      ? `${window.location.pathname}?${encodedURLState}`
      : window.location.pathname;
    window.history.replaceState(null, '', newURL);
  }, [
    widgetState.datasnapshot,
    widgetState.filters,
    widgetState.leftWidgetConnectionId,
    widgetState.rightWidgetConnectionId,
    widgetState.view,
    widgetState?.summaryFilters,
    widgetState?.connectionPage,
    widgetState?.heatmapExpandedState,
    widgetState?.secondaryHeatmapExpandedState,
    selectedDatasnapshot,
    heatmapMode,
  ]);

  useEffect(() => {
    if (
      urlState.datasnapshot === selectedDatasnapshot ||
      urlState.datasnapshot === null
    ) {
      updateURLState();
    }
  }, [updateURLState, selectedDatasnapshot, urlState]);

  // Update URL when heatmapMode changes (from toggle or other state changes)
  useEffect(() => {
    updateURLState();
  }, [heatmapMode, updateURLState]);

  const phenotypes = useMemo(() => {
    const allPhenotypes = Object.values(knowledgeStatements).map(
      (ks) =>
        ks.phenotype ||
        ks.circuit_type ||
        ks.projection ||
        OTHER_PHENOTYPE_LABEL,
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

  const initialFilterOptions = useMemo(() => {
    const yAxis = getYAxis(hierarchicalNodes);
    const xAxisOrgans = Object.values(organs);
    return {
      Origin: getUniqueOrigins(knowledgeStatements, yAxis),
      EndOrgan: getUniqueOrgans(xAxisOrgans),
      Species: getUniqueSpecies(knowledgeStatements),
      Phenotype: getUniquePhenotypes(knowledgeStatements),
      apiNATOMY: getUniqueApinatomies(knowledgeStatements),
      Via: getUniqueVias(knowledgeStatements),
      Entities: getUniqueAllEntities(knowledgeStatements, yAxis, xAxisOrgans),
    };
  }, [hierarchicalNodes, organs, knowledgeStatements]);

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

  // Reset state when knowledge statements change (new datasnapshot)
  useEffect(() => {
    setFilters(initialFilters);
    setSelectedConnectionSummary(null);
  }, [knowledgeStatements, initialFilters]);

  const resetApplicationState = useCallback(() => {
    setFilters(initialFilters);
    setSelectedConnectionSummary(null);
  }, [initialFilters]);

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
    widgetState,
    setWidgetState,
    resetWidgetState,
    resetApplicationState,
    isDataLoading: false,
    setIsDataLoading: () => {},
    initialFilterOptions,
    heatmapMode: heatmapMode,
    switchHeatmapMode,
  };

  return (
    <DataContext.Provider value={dataContextValue}>
      {children}
    </DataContext.Provider>
  );
};
