import { Box, Button, Divider, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
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
import { HierarchicalItem } from './common/Types.ts';
import { Organ } from '../models/explorer.ts';
import LoaderSpinner from './common/LoaderSpinner.tsx';
import { extractEndOrganFiltersFromEntities } from '../services/summaryHeatmapService.ts';

const { gray500, white: white, gray25, gray100, gray400, gray600A } = vars;

function ConnectivityGrid() {
  const {
    hierarchicalNodes,
    organs,
    knowledgeStatements,
    filters,
    setFilters,
    setSelectedConnectionSummary,
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

  const handleClick = (x: number, y: number, yId: string): void => {
    // When the primary heatmap cell is clicked - this sets the react-context state for Connections in SummaryType.summary
    setSelectedCell({ x, y });
    const row = filteredConnectionsMap.get(yId);
    if (row) {
      const endOrgan = filteredXOrgans[x];
      const nodeData = detailedHeatmapData[y];
      const hierarchicalNode = hierarchicalNodes[nodeData.id];
      const ksMap = getKnowledgeStatementMap(row[x], knowledgeStatements);

      setSelectedConnectionSummary({
        connections: ksMap,
        endOrgan: endOrgan,
        hierarchicalNode: hierarchicalNode,
      });
    }
  };

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
        xAxis={filteredXOrgans.map((organ) => organ.name)}
        xAxisLabel={'End organ'}
        yAxisLabel={'Connection Origin'}
        onCellClick={handleClick}
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
