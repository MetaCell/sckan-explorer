import { Box, Button, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { vars } from '../theme/variables';
import HeatmapGrid from './common/Heatmap';
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
} from '../services/heatmapService.ts';
import FiltersDropdowns from './FiltersDropdowns.tsx';
import { HierarchicalItem } from './common/Types.ts';
import { Organ } from '../models/explorer.ts';
import Loader from './common/Loader.tsx';

const {
  gray500,
  white: white,
  gray25,
  gray100,
  primaryPurple600,
  gray400,
} = vars;

function ConnectivityGrid() {
  const {
    hierarchicalNodes,
    organs,
    knowledgeStatements,
    filters,
    setFilters,
    setSelectedConnectionSummary,
  } = useDataContext();

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
      filters,
    );
    setConnectionsMap(connections);
  }, [hierarchicalNodes, organs, knowledgeStatements, filters]);

  const { min, max } = useMemo(() => {
    return getMinMaxConnections(connectionsMap);
  }, [connectionsMap]);

  useEffect(() => {
    const organList = getXAxisOrgans(organs);
    setXAxisOrgans(organList);
  }, [organs]);

  useEffect(() => {
    const yAxis = getYAxis(hierarchicalNodes);
    setYAxis(yAxis);
    setInitialYAxis(yAxis);
  }, [hierarchicalNodes]);

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

  const handleReset = () => {
    setYAxis(initialYAxis);
    setFilters({
      Origin: [],
      EndOrgan: [],
      Species: [],
      Phenotype: [],
      apiNATOMY: [],
      Via: [],
    });
    setSelectedCell(null);
    setSelectedConnectionSummary(null);
  };

  const isLoading = yAxis.length == 0;

  return isLoading ? (
    <Loader />
  ) : (
    <Box
      minHeight="100%"
      p={3}
      pb={0}
      fontSize={14}
      display="flex"
      flexDirection="column"
    >
      <Box pb={2.5}>
        <Typography variant="h6" sx={{ fontWeight: 400 }}>
          Connection Origin to End Organ
        </Typography>
      </Box>

      <FiltersDropdowns />

      <HeatmapGrid
        yAxis={filteredYAxis}
        setYAxis={setYAxis}
        heatmapData={heatmapData}
        xAxis={filteredXOrgans.map((organ) => organ.name)}
        xAxisLabel={'End organ'}
        yAxisLabel={'Connection Origin'}
        onCellClick={handleClick}
        selectedCell={selectedCell}
      />

      <Box
        py={1.5}
        borderTop={`0.0625rem solid ${gray100}`}
        width={1}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        position="sticky"
        bottom={0}
        sx={{ background: white }}
      >
        <Button
          variant="text"
          sx={{
            fontSize: '0.875rem',
            fontWeight: 600,
            lineHeight: '1.25rem',
            color: primaryPurple600,
            borderRadius: '0.25rem',
            border: `0.0625rem solid ${primaryPurple600}`,
            padding: '0.5rem',

            '&:hover': {
              background: 'transparent',
            },
          }}
          onClick={handleReset}
        >
          Reset All
        </Button>

        <Box
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
