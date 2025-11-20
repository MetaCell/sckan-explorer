import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from 'react';
import { Box, Chip, TextField, Typography } from '@mui/material';
import { ArrowRightIcon } from './icons/index.tsx';
import { vars } from '../theme/variables.ts';
import {
  HierarchicalItem,
  KsPerPhenotype,
  SummaryType,
  KsRecord,
  Option,
  HeatmapMode,
} from './common/Types.ts';
import { useDataContext } from '../context/DataContext.ts';
import { useWidgetStateActions } from '../hooks/useWidgetStateActions.ts';
import {
  calculateSecondaryConnections,
  convertViaToString,
  getAllPhenotypes,
  getAllViasFromConnections,
  getDestinations,
  getNerveFilters,
  getSecondaryHeatmapData,
  getXAxisForHeatmap,
  reorderXAxis,
  sortHeatmapData,
  filterConnectionsMap,
} from '../services/summaryHeatmapService.ts';
import {
  getYAxis,
  getKnowledgeStatementMap,
  filterYAxis,
  getNonEmptyColumns,
  assignExpandedState,
} from '../services/heatmapService.ts';
import SummaryHeader from './connections/SummaryHeader.tsx';
import SummaryInstructions from './connections/SummaryInstructions.tsx';
import PhenotypeLegend from './connections/PhenotypeLegend.tsx';
import HeatmapGrid from './common/Heatmap.tsx';
import { Organ } from '../models/explorer.ts';
import SummaryDetails from './connections/SummaryDetails.tsx';
import SummaryFiltersDropdown from './SummaryFiltersDropdown.tsx';
import { COORDINATE_SEPARATOR } from '../utils/urlStateManager.ts';

const { gray700, gray600A, gray100 } = vars;

const styles = {
  heading: {
    fontSize: '0.875rem',
    fontWeight: '500',
    lineHeight: '1.25rem',
    color: gray700,
    marginBottom: '0.5rem',
  },
  text: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: '1.25rem',
    color: gray600A,
  },
};

function Connections() {
  const {
    selectedConnectionSummary,
    majorNerves,
    hierarchicalNodes,
    knowledgeStatements,
    filters,
    widgetState,
    heatmapMode,
  } = useDataContext();

  const { goToConnectionDetailsView, updateSummaryFilters, updateWidgetState } =
    useWidgetStateActions();

  const [showConnectionDetails, setShowConnectionDetails] =
    useState<SummaryType>(SummaryType.Instruction);
  const [connectionsMap, setConnectionsMap] = useState<
    Map<string, KsPerPhenotype[]>
  >(new Map());
  const [filteredConnectionsMap, setFilteredConnectionsMap] = useState<
    Map<string, KsPerPhenotype[]>
  >(new Map());
  const [connectionPage, setConnectionPage] = useState(1); // represents the page number / index of the connections - if (x,y) has 4 connections, then connectionPage will be 1, 2, 3, 4
  const [yAxis, setYAxis] = useState<HierarchicalItem[]>([]);
  const [xAxis, setXAxis] = useState<string[]>([]);
  const [filteredKsIds, setFilteredKsIds] = useState<Set<string>>(new Set());
  const [filteredYAxis, setFilteredYAxis] = useState<HierarchicalItem[]>([]);
  const [filteredXAxis, setFilteredXAxis] = useState<string[]>([]);
  const [reorderedAxis, setReorderedAxis] = useState<string[]>([]);
  const [selectedCell, setSelectedCell] = useState<{
    x: number;
    y: number;
  } | null>(null); // useful for coordinates
  const [knowledgeStatementsMap, setKnowledgeStatementsMap] =
    useState<KsRecord>({});
  const [nerveFilters, setNerveFilters] = useState<Option[]>([]);
  const [phenotypeFilters, setPhenotypeFilters] = useState<Option[]>([]);

  // Track if expanded state has been applied from URL
  const expandedStateAppliedRef = useRef(false);

  const summaryFilters = useMemo(
    () => ({
      ...filters,
      Nerve: nerveFilters,
      Phenotype: phenotypeFilters,
    }),
    [filters, nerveFilters, phenotypeFilters],
  );

  useEffect(() => {
    if (nerveFilters.length > 0 || phenotypeFilters.length > 0) {
      updateSummaryFilters(summaryFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nerveFilters, phenotypeFilters, summaryFilters]);

  useEffect(() => {
    if (widgetState.summaryFilters) {
      setNerveFilters(widgetState.summaryFilters.Nerve);
      setPhenotypeFilters(widgetState.summaryFilters.Phenotype);
    } else {
      setNerveFilters([]);
      setPhenotypeFilters([]);
    }
  }, [widgetState.summaryFilters]);

  useEffect(() => {
    if (widgetState.view === 'connectionView' && selectedConnectionSummary) {
      setShowConnectionDetails(SummaryType.Summary);
    } else if (
      widgetState.view === 'connectionDetailsView' &&
      selectedConnectionSummary &&
      (widgetState.rightWidgetConnectionId || widgetState.connectionPage)
    ) {
      setShowConnectionDetails(SummaryType.DetailedSummary);
      if (widgetState.connectionPage) {
        setConnectionPage(widgetState.connectionPage);
      }
    } else {
      setShowConnectionDetails(SummaryType.Instruction);
    }
  }, [
    selectedConnectionSummary,
    widgetState.view,
    widgetState.rightWidgetConnectionId,
    widgetState.connectionPage,
  ]);

  // Values from the selected connection - In the SummaryType.summary
  const viasConnection = getAllViasFromConnections(
    selectedConnectionSummary?.filteredKnowledgeStatements || ({} as KsRecord),
  );
  const viasStatement = convertViaToString(Object.values(viasConnection));
  const totalConnectionCount = Object.keys(
    selectedConnectionSummary?.filteredKnowledgeStatements || ({} as KsRecord),
  ).length;

  const availableNerves = getNerveFilters(viasConnection, majorNerves);
  const availablePhenotypes = useMemo(
    () =>
      selectedConnectionSummary
        ? getAllPhenotypes(
            selectedConnectionSummary.filteredKnowledgeStatements,
          )
        : [],
    [selectedConnectionSummary],
  );

  useEffect(() => {
    // calculate the connectionsMap for the secondary heatmap
    if (
      selectedConnectionSummary &&
      selectedConnectionSummary.hierarchicalNode &&
      hierarchicalNodes
    ) {
      const destinations = getDestinations(selectedConnectionSummary);
      const connections = calculateSecondaryConnections(
        hierarchicalNodes,
        destinations,
        selectedConnectionSummary.filteredKnowledgeStatements,
        summaryFilters,
        selectedConnectionSummary.hierarchicalNode,
      );
      setConnectionsMap(connections);
    }
  }, [
    hierarchicalNodes,
    selectedConnectionSummary,
    summaryFilters,
    knowledgeStatements,
  ]);

  useEffect(() => {
    // set the xAxis for the heatmap
    if (selectedConnectionSummary) {
      const xAxis = getXAxisForHeatmap(
        selectedConnectionSummary?.endOrgan || ({} as Organ),
      );
      setXAxis(xAxis);
    }
  }, [selectedConnectionSummary]);

  useEffect(() => {
    // set the yAxis for the heatmap
    if (selectedConnectionSummary && hierarchicalNodes) {
      const hierarchyNode = {
        [selectedConnectionSummary.hierarchicalNode.id]:
          selectedConnectionSummary.hierarchicalNode,
      };
      const yHierarchicalItem = getYAxis(hierarchicalNodes, hierarchyNode);
      setYAxis(yHierarchicalItem);
    }
  }, [selectedConnectionSummary, hierarchicalNodes]);

  const handleCellSelection = useCallback(
    (
      x: number,
      y: number,
      yId: string,
      shouldUpdateWidgetState: boolean = true,
    ): void => {
      setSelectedCell({ x, y });
      const row = filteredConnectionsMap.get(yId);
      if (row) {
        setConnectionPage(widgetState.connectionPage ?? 1);
        const newX = filteredXAxis.indexOf(reorderedAxis[x]);
        const ksIds = Object.values(row[newX]).reduce((acc, phenotypeData) => {
          return acc.concat(phenotypeData.ksIds);
        }, [] as string[]);

        if (
          selectedConnectionSummary &&
          Object.keys(selectedConnectionSummary.filteredKnowledgeStatements)
            .length !== 0 &&
          ksIds.length > 0
        ) {
          setShowConnectionDetails(SummaryType.DetailedSummary);
          const ksMap = getKnowledgeStatementMap(ksIds, knowledgeStatements);
          setKnowledgeStatementsMap(ksMap);
          setFilteredKsIds(new Set(ksIds));

          if (shouldUpdateWidgetState) {
            // Store the KS IDs along with view and coordinates in one call
            goToConnectionDetailsView(x, y, widgetState.connectionPage ?? 1, {
              connectionKsIds: ksIds,
            });
          }
        }
      }
    },
    [
      filteredConnectionsMap,
      filteredXAxis,
      reorderedAxis,
      selectedConnectionSummary,
      knowledgeStatements,
      widgetState,
      goToConnectionDetailsView,
    ],
  );

  const handleCellClick = useCallback(
    (x: number, y: number, yId: string): void => {
      handleCellSelection(x, y, yId, true);
    },
    [handleCellSelection],
  );

  useEffect(() => {
    // Filter yAxis
    const filteredYAxis = filterYAxis(yAxis, connectionsMap);

    // Determine columns with data
    const columnsWithData = getNonEmptyColumns(filteredYAxis, connectionsMap);

    // Filter connections map
    const filteredConnectionsResults = filterConnectionsMap(
      filteredYAxis,
      connectionsMap,
      columnsWithData,
    );

    // Filter xAxis
    const filteredXAxis = xAxis.filter((_, index) =>
      columnsWithData.has(index),
    );

    setFilteredKsIds(filteredConnectionsResults.ksIds);
    setFilteredYAxis(filteredYAxis);
    setFilteredXAxis(filteredXAxis);
    setReorderedAxis(reorderXAxis([...filteredXAxis].sort()));
    setFilteredConnectionsMap(filteredConnectionsResults.filteredMap);
  }, [yAxis, xAxis, connectionsMap]);

  // Helper function to apply expand/collapse state to fresh yAxis
  const applyExpandedState = (
    freshYAxis: HierarchicalItem[],
    existingYAxis: HierarchicalItem[],
  ): HierarchicalItem[] => {
    const expandedStateMap = new Map<string, boolean>();

    const collectExpandedState = (items: HierarchicalItem[]) => {
      items.forEach((item) => {
        expandedStateMap.set(item.id, item.expanded);
        if (item.children) {
          collectExpandedState(item.children);
        }
      });
    };

    const applyExpandedStateRecursive = (
      items: HierarchicalItem[],
    ): HierarchicalItem[] => {
      return items.map((item) => ({
        ...item,
        expanded: expandedStateMap.has(item.id)
          ? expandedStateMap.get(item.id)!
          : item.expanded,
        children: item.children
          ? applyExpandedStateRecursive(item.children)
          : item.children,
      }));
    };

    // Collect the expanded state from existing yAxis
    collectExpandedState(existingYAxis);
    // Apply the expanded state to fresh yAxis
    return applyExpandedStateRecursive(freshYAxis);
  };

  useEffect(() => {
    if (selectedConnectionSummary && hierarchicalNodes) {
      const hierarchyNode = {
        [selectedConnectionSummary.hierarchicalNode.id]:
          selectedConnectionSummary.hierarchicalNode,
      };

      if (
        widgetState.secondaryHeatmapExpandedState &&
        widgetState.secondaryHeatmapExpandedState.length > 0
      ) {
        const freshYAxis = getYAxis(hierarchicalNodes, hierarchyNode);
        const yAxisWithExpandedState = assignExpandedState(
          freshYAxis,
          widgetState.secondaryHeatmapExpandedState,
        );
        const yAxisWithExpandedStateApplied = applyExpandedState(
          freshYAxis,
          yAxisWithExpandedState,
        );
        setYAxis(yAxisWithExpandedStateApplied);
        expandedStateAppliedRef.current = true;
      } else {
        // No expanded state to apply, mark as ready
        expandedStateAppliedRef.current = true;
      }
    }
  }, [
    widgetState.secondaryHeatmapExpandedState,
    selectedConnectionSummary,
    hierarchicalNodes,
  ]);

  // Restore connection from KS IDs (new approach - more reliable)
  useEffect(() => {
    if (
      widgetState.view === 'connectionDetailsView' &&
      widgetState.connectionKsIds &&
      widgetState.connectionKsIds.length > 0 &&
      selectedConnectionSummary
    ) {
      const ksMap = getKnowledgeStatementMap(
        widgetState.connectionKsIds,
        knowledgeStatements,
      );
      setKnowledgeStatementsMap(ksMap);
      setFilteredKsIds(new Set(widgetState.connectionKsIds));
      setShowConnectionDetails(SummaryType.DetailedSummary);
      setConnectionPage(widgetState.connectionPage ?? 1);
    }
  }, [
    widgetState.view,
    widgetState.connectionKsIds,
    widgetState.connectionPage,
    selectedConnectionSummary,
    knowledgeStatements,
  ]);

  // Restore connection from coordinates (legacy approach - kept for backwards compatibility)
  useEffect(() => {
    // Skip if we have KS IDs (new approach takes precedence)
    if (widgetState.connectionKsIds && widgetState.connectionKsIds.length > 0) {
      return;
    }

    if (
      widgetState.view === 'connectionDetailsView' &&
      widgetState.rightWidgetConnectionId &&
      selectedConnectionSummary && // Ensure selectedConnectionSummary exists first
      expandedStateAppliedRef.current && // Wait for expanded state to be applied
      filteredConnectionsMap.size > 0 &&
      filteredXAxis.length > 0 &&
      filteredYAxis.length > 0
    ) {
      const [xStr, yStr] =
        widgetState.rightWidgetConnectionId.split(COORDINATE_SEPARATOR);
      const x = parseInt(xStr);
      const y = parseInt(yStr);

      if (
        x >= 0 &&
        x < filteredXAxis.length &&
        y >= 0 &&
        y < filteredYAxis.length
      ) {
        const yId = filteredYAxis[y].id;
        handleCellSelection(x, y, yId, false);
      } else {
        // Gracefully degrade to first available connection
        if (filteredXAxis.length > 0 && filteredYAxis.length > 0) {
          const defaultX = Math.min(x, filteredXAxis.length - 1);
          const defaultY = Math.min(y, filteredYAxis.length - 1);
          const yId = filteredYAxis[defaultY].id;
          handleCellSelection(defaultX, defaultY, yId, false);
        }
      }
    }
  }, [
    widgetState.view,
    widgetState.rightWidgetConnectionId,
    widgetState.connectionPage,
    widgetState.connectionKsIds,
    filteredConnectionsMap,
    filteredXAxis,
    filteredYAxis,
    reorderedAxis,
    knowledgeStatements,
    selectedConnectionSummary,
    handleCellSelection,
  ]);

  const heatmapData = useMemo(() => {
    return getSecondaryHeatmapData(filteredYAxis, filteredConnectionsMap);
  }, [filteredYAxis, filteredConnectionsMap]);

  const sortedResults = sortHeatmapData(
    filteredXAxis,
    reorderedAxis,
    heatmapData,
  );
  const sortedData = sortedResults.data;
  const connectionsCounter = sortedResults.total;

  const getPostSynapticConnections = () => {
    if (!selectedConnectionSummary?.filteredKnowledgeStatements) {
      return [];
    }

    // Get all knowledge statement IDs from selectedConnectionSummary
    const allKsIds = new Set(
      Object.keys(selectedConnectionSummary.filteredKnowledgeStatements),
    );

    // Compute the delta: knowledge statements in selectedConnectionSummary but not in filteredKsIds
    const postSynapticKsIds = Array.from(allKsIds).filter(
      (ksId) => !filteredKsIds.has(ksId),
    );

    const handleChipClick = (clickedKsId: string) => {
      // Build knowledge statements map with all post synaptic IDs
      const ksMap = getKnowledgeStatementMap(
        postSynapticKsIds,
        knowledgeStatements,
      );
      setKnowledgeStatementsMap(ksMap);

      // Set connection page based on which chip was clicked (1-indexed)
      const connectionPageIndex = postSynapticKsIds.indexOf(clickedKsId) + 1;
      setConnectionPage(connectionPageIndex);

      // Update widget state to maintain the detailed view without coordinates
      updateWidgetState({
        view: 'connectionDetailsView',
        rightWidgetConnectionId: 'postSynaptic', // Special identifier for post-synaptic connections
        connectionPage: connectionPageIndex,
      });

      // Show connection details
      setShowConnectionDetails(SummaryType.DetailedSummary);
    };

    // Return clickable chips
    return postSynapticKsIds.map((ksId) => (
      <Chip
        key={ksId}
        label={ksId}
        variant="outlined"
        color="primary"
        onClick={() => handleChipClick(ksId)}
        sx={{
          margin: '0.25rem',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'primary.light',
          },
        }}
      />
    ));
  };

  return (
    <Box display="flex" flexDirection="column" minHeight={1}>
      <SummaryHeader
        showDetails={showConnectionDetails}
        setShowDetails={setShowConnectionDetails}
        knowledgeStatementsMap={knowledgeStatementsMap}
        connectionPage={connectionPage}
        setConnectionPage={setConnectionPage}
        totalConnectionCount={totalConnectionCount}
        connectionsCounter={connectionsCounter}
      />
      {showConnectionDetails === SummaryType.Instruction && (
        <SummaryInstructions />
      )}

      {showConnectionDetails === SummaryType.DetailedSummary ? (
        <SummaryDetails
          knowledgeStatementsMap={knowledgeStatementsMap}
          connectionPage={connectionPage}
        />
      ) : showConnectionDetails === SummaryType.Instruction ? (
        <></>
      ) : (
        <>
          <Box p={3} display="flex" flexDirection="column" gap={3}>
            <Box display="flex" alignItems="flex-end" gap={1.5}>
              <Box flex={1}>
                <Typography sx={{ ...styles.heading, marginBottom: '0.75rem' }}>
                  Connection origin
                </Typography>
                <TextField
                  value={selectedConnectionSummary?.hierarchicalNode.name || ''}
                  fullWidth
                />
              </Box>
              <ArrowRightIcon />
              <Box flex={1}>
                <Typography sx={{ ...styles.heading, marginBottom: '0.75rem' }}>
                  End Organ
                </Typography>
                <TextField
                  value={selectedConnectionSummary?.endOrgan?.name}
                  fullWidth
                />
              </Box>
            </Box>

            <Box>
              <Typography sx={styles.heading}>Selected populations</Typography>
              <Chip
                label={
                  Object.keys(selectedConnectionSummary?.connections || {})
                    .length + ' populations'
                }
                variant="outlined"
                color="primary"
              />
            </Box>

            <Box>
              <Typography sx={styles.heading}>
                Connections are through these nerves
              </Typography>
              <Typography sx={styles.text}>{viasStatement}</Typography>
            </Box>
            {heatmapMode === HeatmapMode.Synaptic && (
              <Box>
                <Typography sx={styles.heading}>
                  Post synaptic connections not fitting the summary heatmap
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                  {getPostSynapticConnections()}
                </Box>
              </Box>
            )}
          </Box>

          <Box
            display="flex"
            flexDirection="column"
            flex={1}
            p={3}
            sx={{
              borderTop: `0.0625rem solid ${gray100}`,
            }}
          >
            <Box mb={3}>
              <Typography
                sx={{
                  ...styles.heading,
                  fontSize: '1rem',
                  lineHeight: '1.5rem',
                }}
              >
                Summary map
              </Typography>
              <Typography sx={styles.text}>
                Summary map shows the connections of the selected connection
                origin and end organ with phenotypes. Select individual squares
                to view the details of each connections.
              </Typography>
            </Box>
            <SummaryFiltersDropdown
              nerves={availableNerves}
              nerveFilters={nerveFilters}
              setNerveFilters={setNerveFilters}
              phenotypes={availablePhenotypes}
              phenotypeFilters={phenotypeFilters}
              setPhenotypeFilters={setPhenotypeFilters}
            />
            <HeatmapGrid
              yAxis={filteredYAxis}
              setYAxis={setYAxis}
              xAxis={reorderedAxis.map((label) => ({
                id: label,
                label: label,
                children: [],
                expanded: false,
              }))}
              setXAxis={() => {}} // No-op for secondary heatmap
              onCellClick={handleCellClick}
              selectedCell={selectedCell}
              setSelectedCell={setSelectedCell}
              secondaryHeatmapData={sortedData}
              xAxisLabel={'Project to'}
              yAxisLabel={'Somas in'}
            />
          </Box>

          <PhenotypeLegend phenotypes={availablePhenotypes} />
        </>
      )}
    </Box>
  );
}

export default Connections;
