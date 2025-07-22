import { Box, Button, Divider, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { vars } from '../theme/variables.ts';
import HeatmapGrid from './common/Heatmap.tsx';
import { useDataContext } from '../context/DataContext.ts';
import {
  calculateConnections,
  getMinMaxConnections,
  getXAxisOrgans,
  getYAxis,
  getHeatmapData,
  getKnowledgeStatementMap,
  filterConnectionsMap,
  getNonEmptyColumns,
  filterYAxis,
  filterKnowledgeStatements,
} from '../services/heatmapService.ts';
import FiltersDropdowns from './FiltersDropdowns.tsx';
import { DetailedHeatmapData, HierarchicalItem } from './common/Types.ts';
import { Organ } from '../models/explorer.ts';
import LoaderSpinner from './common/LoaderSpinner.tsx';
import { extractEndOrganFiltersFromEntities } from '../services/summaryHeatmapService.ts';
import { COORDINATE_SEPARATOR } from '../utils/urlStateManager.ts';

const { gray500, white: white, gray25, gray100, gray400, gray600A } = vars;

function ConnectivityGrid() {
  const {
    hierarchicalNodes,
    organs,
    knowledgeStatements,
    filters,
    setFilters,
    setSelectedConnectionSummary,
    widgetState,
    setWidgetState,
  } = useDataContext();

  const organizedFilters = useMemo(
    () => extractEndOrganFiltersFromEntities(filters, organs),
    [filters, organs],
  );
  const [xAxisOrgans, setXAxisOrgans] = useState<Organ[]>([]);
  const [filteredXOrgans, setFilteredXOrgans] = useState<Organ[]>([]);
  const [initialYAxis, setInitialYAxis] = useState<HierarchicalItem[]>([]);

  const [yAxis, setYAxis] = useState<HierarchicalItem[]>([]);
  const [filteredYAxis, setFilteredYAxis] = useState<HierarchicalItem[]>([]);
  // Maps YaxisId -> KnowledgeStatementIds for each Organ
  const [connectionsMap, setConnectionsMap] = useState<
    Map<string, Array<string>[]>
  >(new Map());

  const [filteredConnectionsMap, setFilteredConnectionsMap] = useState<
    Map<string, Array<string>[]>
  >(new Map());

  const [selectedCell, setSelectedCell] = useState<{
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    const connections = calculateConnections(
      hierarchicalNodes,
      organs,
      knowledgeStatements,
      organizedFilters,
    );
    setConnectionsMap(connections);
  }, [hierarchicalNodes, organs, knowledgeStatements, organizedFilters]);

  const { min, max } = useMemo(() => {
    return getMinMaxConnections(connectionsMap);
  }, [connectionsMap]);

  useEffect(() => {
    const organList = getXAxisOrgans(organs);
    setXAxisOrgans(organList);
  }, [organs]);

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
    const freshYAxis = getYAxis(hierarchicalNodes);

    // If yAxis already exists (meaning this is a filter change, not initial load)
    // preserve the expand/collapse state
    if (yAxis.length > 0) {
      const yAxisWithPreservedState = applyExpandedState(freshYAxis, yAxis);
      setYAxis(yAxisWithPreservedState);
    } else {
      // Initial load
      setYAxis(freshYAxis);
      setInitialYAxis(freshYAxis);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hierarchicalNodes, organizedFilters]); // Add organizedFilters as dependency


  useEffect(() => {
    const assignExpandedState = (yAxis: HierarchicalItem[], expandedState: string[]) => {
      return yAxis.map((item) => ({
        ...item,
        expanded: expandedState.includes(item.id),
        children: item.children ? assignExpandedState(item.children, expandedState) : item.children,
      }));
    };
    const freshYAxis = getYAxis(hierarchicalNodes);
    if (widgetState.heatmapExpandedState && widgetState.heatmapExpandedState.length > 0 && yAxis.length === 0) {
      const yAxisWithExpandedState = assignExpandedState(freshYAxis, widgetState.heatmapExpandedState);
      const yAxisWithExpandedStateApplied = applyExpandedState(freshYAxis, yAxisWithExpandedState);
      setYAxis(yAxisWithExpandedStateApplied);
    }
  }, [widgetState.heatmapExpandedState]);

  useEffect(() => {
    if (connectionsMap.size > 0 && yAxis.length > 0) {
      // Apply filtering logic
      const filteredYAxis = filterYAxis<Array<string>>(yAxis, connectionsMap);
      const columnsWithData = getNonEmptyColumns(filteredYAxis, connectionsMap);
      const filteredConnectionsMap = filterConnectionsMap(
        filteredYAxis,
        connectionsMap,
        columnsWithData,
      );
      const filteredOrgans = xAxisOrgans.filter((_, index) =>
        columnsWithData.has(index),
      );

      setFilteredYAxis(filteredYAxis);
      setFilteredXOrgans(filteredOrgans);
      setFilteredConnectionsMap(filteredConnectionsMap);
    }
  }, [yAxis, connectionsMap, xAxisOrgans]);

  const { heatmapData, detailedHeatmapData } = useMemo(() => {
    const heatmapData = getHeatmapData(filteredYAxis, filteredConnectionsMap);
    return {
      heatmapData: heatmapData.heatmapMatrix,
      detailedHeatmapData: heatmapData.detailedHeatmap,
    };
  }, [filteredYAxis, filteredConnectionsMap]);

  const handleClick = useCallback(
    (x: number, y: number, yId: string, isConnectionView?: boolean, removeSummaryFilters: boolean = false): void => {
      // When the primary heatmap cell is clicked - this sets the react-context state for Connections in SummaryType.summary
      setSelectedCell({ x, y });
      const row = filteredConnectionsMap.get(yId);
      if (row) {
        const endOrgan = filteredXOrgans[x];
        const nodeData = detailedHeatmapData[y];
        const hierarchicalNode = hierarchicalNodes[nodeData.id];
        const ksMap = getKnowledgeStatementMap(row[x], knowledgeStatements);

        const leftSideHeatmapCoordinates = `${x}${COORDINATE_SEPARATOR}${y}`;
        setWidgetState({
          ...widgetState,
          view:
            widgetState.view === 'connectionView' || isConnectionView
              ? 'connectionView'
              : 'connectionDetailsView',
          rightWidgetConnectionId: isConnectionView
            ? null
            : widgetState.rightWidgetConnectionId,
          leftWidgetConnectionId: leftSideHeatmapCoordinates,
          filters: widgetState.filters,
          summaryFilters: removeSummaryFilters ? null : widgetState.summaryFilters,
          connectionPage: isConnectionView ? null : widgetState.connectionPage,
        });

        setSelectedConnectionSummary({
          connections: ksMap,
          endOrgan: endOrgan,
          hierarchicalNode: hierarchicalNode,
        });
      }
    },
    [
      filteredConnectionsMap,
      filteredXOrgans,
      detailedHeatmapData,
      hierarchicalNodes,
      knowledgeStatements,
      widgetState,
      setWidgetState,
      setSelectedCell,
      setSelectedConnectionSummary,
    ],
  );

  const validateIfCoordinatesAreInBounds = (
    x: number,
    y: number,
    filteredXOrgans: Organ[],
    detailedHeatmapData: DetailedHeatmapData,
  ): boolean => {
    if (
      x >= 0 &&
      x < filteredXOrgans.length &&
      y >= 0 &&
      y < detailedHeatmapData.length
    ) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (
      widgetState.leftWidgetConnectionId &&
      filteredConnectionsMap.size > 0 &&
      detailedHeatmapData.length > 0 &&
      yAxis.length > 0
    ) {
      const [x, y] = widgetState.leftWidgetConnectionId
        .split(COORDINATE_SEPARATOR)
        .map(Number);
      if (
        validateIfCoordinatesAreInBounds(
          x,
          y,
          filteredXOrgans,
          detailedHeatmapData,
        )
      ) {
        const nodeData = detailedHeatmapData[y];
        const yId = nodeData.id;
        handleClick(x, y, yId, widgetState.view === 'connectionView');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    widgetState.leftWidgetConnectionId,
    filteredConnectionsMap,
    filteredXOrgans,
    detailedHeatmapData,
    yAxis,
  ]);

  // Custom handler for updating yAxis from the heatmap collapsible list
  const handleYAxisUpdate = (updatedFilteredYAxis: HierarchicalItem[]) => {
    // Apply the expand/collapse changes from the filtered yAxis back to the original yAxis
    setYAxis((currentYAxis) =>
      applyExpandedState(currentYAxis, updatedFilteredYAxis),
    );
  };

  const handleReset = () => {
    setYAxis(initialYAxis);
    setFilters({
      Origin: [],
      EndOrgan: [],
      Species: [],
      Phenotype: [],
      apiNATOMY: [],
      Via: [],
      Entities: [],
    });
    setSelectedCell(null);
    setSelectedConnectionSummary(null);
    setWidgetState({
      ...widgetState,
      view: null,
      filters: null,
      summaryFilters: null,
      leftWidgetConnectionId: null,
      rightWidgetConnectionId: null,
      connectionPage: null,
      heatmapExpandedState: null,
      secondaryHeatmapExpandedState: null,
    });
  };

  const isLoading = yAxis.length == 0;

  const totalPopulationCount = useMemo(() => {
    const filteredStatements = filterKnowledgeStatements(
      knowledgeStatements,
      hierarchicalNodes,
      organizedFilters,
      organs,
    );
    return Object.keys(filteredStatements).length;
  }, [knowledgeStatements, hierarchicalNodes, organizedFilters, organs]);

  const checkIfAllFiltersAreEmpty = () => {
    return Object.values(organizedFilters).every((arr) => arr.length === 0);
  };

  return isLoading ? (
    <LoaderSpinner />
  ) : (
    <Box
      minHeight="100%"
      // p={3}
      pb={0}
      fontSize={14}
      display="flex"
      flexDirection="column"
      width="fit-content"
      position="relative"
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        px={3}
        pt={3}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 400 }}>
            Connection Origin to End Organ
          </Typography>
          <Divider flexItem sx={{ borderWidth: '1px' }} />
          <Typography
            sx={{
              fontSize: '0.875rem',
              fontWeight: 500,
              lineHeight: '1.25rem',
              color: gray600A,
            }}
          >
            {checkIfAllFiltersAreEmpty()
              ? `${totalPopulationCount} populations`
              : `Filtered ${totalPopulationCount} populations`}
          </Typography>
        </Box>

        <Button
          sx={{
            position: 'sticky',
            right: '2rem',
            top: 0,
          }}
          variant="contained"
          onClick={handleReset}
        >
          Reset All
        </Button>
      </Box>

      <FiltersDropdowns
        filteredYAxis={filteredYAxis}
        filteredXOrgans={filteredXOrgans}
      />

      <HeatmapGrid
        yAxis={filteredYAxis}
        setYAxis={handleYAxisUpdate}
        heatmapData={heatmapData}
          setSelectedCell={setSelectedCell}
        xAxis={filteredXOrgans.map((organ) => organ.name)}
        xAxisLabel={'End organ'}
        yAxisLabel={'Connection Origin'}
          onCellClick={(x, y, yId) => handleClick(x, y, yId, true, true)}
        selectedCell={selectedCell}
      />

      <Box
        p={1.5}
        borderTop={`0.0625rem solid ${gray100}`}
        width={1}
        display="flex"
        alignItems="center"
        justifyContent="start"
        sx={{ background: white }}
      >
        <Box
          position="sticky"
          left={0}
          bottom={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            height: '1.875rem',
            padding: '0 0.75rem',
            borderRadius: '0.25rem',
            background: gray25,
            border: `0.0625rem solid ${gray100}`,
            gap: '0.75rem',
          }}
        >
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 500,
              lineHeight: '1.125rem',
              color: gray500,
            }}
          >
            Connections
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <Typography
              sx={{
                fontSize: '0.75rem',
                fontWeight: 400,
                lineHeight: '1.125rem',
                color: gray400,
              }}
            >
              {min}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {[1, 2, 3, 4, 5, 6].reverse().map((el: number) => (
                <Box
                  key={el}
                  sx={{
                    width: '1.5rem',
                    height: '1rem',
                    background: `rgba(131, 0, 191, ${1 - el / 6.5})`,
                  }}
                />
              ))}
            </Box>

            <Typography
              sx={{
                fontSize: '0.75rem',
                fontWeight: 400,
                lineHeight: '1.125rem',
                color: gray400,
              }}
            >
              {max}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default ConnectivityGrid;
