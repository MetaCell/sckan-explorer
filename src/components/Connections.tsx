import React, { useEffect, useMemo, useState } from 'react';
import { Box, Chip, TextField, Typography } from '@mui/material';
import { ArrowRightIcon } from './icons';
import { vars } from '../theme/variables';
import {
  HierarchicalItem,
  KsPerPhenotype,
  SummaryType,
  KsRecord,
  Option,
} from './common/Types';
import { useDataContext } from '../context/DataContext.ts';
import {
  calculateSecondaryConnections,
  convertViaToString,
  filterConnectionsMap,
  filterYAxis,
  getAllPhenotypes,
  getAllViasFromConnections,
  getDestinations,
  getEmptyColumns,
  getNerveFilters,
  getSecondaryHeatmapData,
  getXAxisForHeatmap,
} from '../services/summaryHeatmapService.ts';
import {
  getYAxis,
  getKnowledgeStatementMap,
} from '../services/heatmapService.ts';
import SummaryHeader from './connections/SummaryHeader';
import SummaryInstructions from './connections/SummaryInstructions.tsx';
import PhenotypeLegend from './connections/PhenotypeLegend.tsx';
import HeatmapGrid from './common/Heatmap.tsx';
import { Organ } from '../models/explorer.ts';
import SummaryDetails from './connections/SummaryDetails.tsx';
import SummaryFiltersDropdown from './SummaryFiltersDropdown.tsx';

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
  } = useDataContext();

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
  const [filteredYAxis, setFilteredYAxis] = useState<HierarchicalItem[]>([]);
  const [filteredXAxis, setFilteredXAxis] = useState<string[]>([]);
  const [selectedCell, setSelectedCell] = useState<{
    x: number;
    y: number;
  } | null>(null); // useful for coordinates
  const [knowledgeStatementsMap, setKnowledgeStatementsMap] =
    useState<KsRecord>({});
  const [nerveFilters, setNerveFilters] = useState<Option[]>([]);
  const [phenotypeFilters, setPhenotypeFilters] = useState<Option[]>([]);

  const summaryFilters = useMemo(
    () => ({
      ...filters,
      Nerve: nerveFilters,
      Phenotype: phenotypeFilters,
    }),
    [filters, nerveFilters, phenotypeFilters],
  );

  useEffect(() => {
    // By default on the first render, show the instruction/summary
    if (selectedConnectionSummary) {
      setShowConnectionDetails(SummaryType.Summary);
    } else {
      setShowConnectionDetails(SummaryType.Instruction);
    }
  }, [selectedConnectionSummary]);

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

  const handleCellClick = (x: number, y: number, yId: string): void => {
    // when the heatmap cell is clicked
    setSelectedCell({ x, y });
    const row = filteredConnectionsMap.get(yId);
    if (row) {
      setConnectionPage(1);
      const ksIds = Object.values(row[x]).reduce((acc, phenotypeData) => {
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
      }
    }
  };

  useEffect(() => {
    // Filter yAxis
    const filteredYAxis = filterYAxis(yAxis, connectionsMap);

    // Determine columns with data
    const columnsWithData = getEmptyColumns(filteredYAxis, connectionsMap);

    // Filter connections map
    const filteredConnectionsMap = filterConnectionsMap(
      filteredYAxis,
      connectionsMap,
      columnsWithData,
    );

    // Filter xAxis
    const filteredXAxis = xAxis.filter((_, index) =>
      columnsWithData.has(index),
    );

    setFilteredYAxis(filteredYAxis);
    setFilteredXAxis(filteredXAxis);
    setFilteredConnectionsMap(filteredConnectionsMap);
  }, [yAxis, xAxis, connectionsMap]);

  const heatmapData = useMemo(() => {
    return getSecondaryHeatmapData(filteredYAxis, filteredConnectionsMap);
  }, [filteredYAxis, filteredConnectionsMap]);
  return (
    <Box display="flex" flexDirection="column" minHeight={1}>
      <SummaryHeader
        showDetails={showConnectionDetails}
        setShowDetails={setShowConnectionDetails}
        knowledgeStatementsMap={knowledgeStatementsMap}
        connectionPage={connectionPage}
        setConnectionPage={setConnectionPage}
        totalConnectionCount={totalConnectionCount}
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
              <Typography sx={styles.heading}>Amount of connections</Typography>
              <Chip
                label={totalConnectionCount + ' connections'}
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
              xAxis={filteredXAxis}
              onCellClick={handleCellClick}
              selectedCell={selectedCell}
              secondaryHeatmapData={heatmapData}
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
