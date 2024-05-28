import React, { useEffect, useMemo, useState } from "react";
import { Box, Chip, TextField, Typography } from "@mui/material";
import { ArrowRightIcon } from "./icons";
import { vars } from "../theme/variables";
import { HierarchicalItem, PhenotypeKsIdMap, SummaryType, KsMapType, PhenotypeType } from "./common/Types";
import { useDataContext } from "../context/DataContext.ts";
import {
  calculateSecondaryConnections,
  convertViaToString, generatePhenotypeColors,
  getAllPhenotypes, getAllViasFromConnections, getDestinations, getNerveFilters,
  getSecondaryHeatmapData,
  getXAxisForHeatmap,
} from "../services/summaryHeatmapService.ts";
import { getYAxis, getKnowledgeStatementMap } from "../services/heatmapService.ts";
import SummaryHeader from "./connections/SummaryHeader";
import SummaryInstructions from "./connections/SummaryInstructions.tsx";
import PhenotypeLegend from "./connections/PhenotypeLegend.tsx";
import HeatmapGrid from "./common/Heatmap.tsx";
import { Organ } from "../models/explorer.ts";
import SummaryDetails from "./connections/SummaryDetails.tsx";
import SummaryFiltersDropdown from "./SummaryFiltersDropdown.tsx";

const { gray700, gray600A, gray100 } = vars;

const styles = {
  heading: {
    fontSize: '0.875rem',
    fontWeight: '500',
    lineHeight: '1.25rem',
    color: gray700,
    marginBottom: '0.5rem'
  },
  text: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: '1.25rem',
    color: gray600A
  }
}


function Connections() {
  const [showConnectionDetails, setShowConnectionDetails] = useState<SummaryType>(SummaryType.Instruction);
  const [connectionsMap, setConnectionsMap] = useState<Map<string, PhenotypeKsIdMap[]>>(new Map());
  const [connectionPage, setConnectionPage] = useState(1);   // represents the page number / index of the connections - if (x,y) has 4 connections, then connectionPage will be 1, 2, 3, 4
  const [yAxis, setYAxis] = useState<HierarchicalItem[]>([]);
  const [selectedCell, setSelectedCell] = useState<{ x: number, y: number } | null>(null);   // useful for coordinates
  const [phenotypes, setPhenotypes] = useState<PhenotypeType>({});
  const [uniqueKS, setUniqueKS] = useState<KsMapType>({});
  const [xAxis, setXAxis] = useState<string[]>([]);

  const { selectedConnectionSummary, majorNerves, hierarchicalNodes, knowledgeStatements, summaryFilters } = useDataContext();

  useEffect(() => {
    // By default on the first render, show the instruction/summary
    if (selectedConnectionSummary) {
      setShowConnectionDetails(SummaryType.Summary);
    }
  }, [selectedConnectionSummary])

  // Values from the selected connection - In the SummaryType.summary
  const viasConnection = getAllViasFromConnections(selectedConnectionSummary?.connections || {} as KsMapType);
  const viasStatement = convertViaToString(Object.values(viasConnection))
  const totalConnectionCount = Object.keys(selectedConnectionSummary?.connections || {} as KsMapType).length;
  const phenotypeNamesArray = useMemo(() => getAllPhenotypes(selectedConnectionSummary?.connections || {} as KsMapType), [selectedConnectionSummary]);


  useEffect(() => {
    // Generate the phenotype colors and set the phenotypes
    if (selectedConnectionSummary && phenotypeNamesArray && phenotypeNamesArray.length > 0) {
      const phenotypeColors: string[] = generatePhenotypeColors(phenotypeNamesArray.length)
      const phenotypes: PhenotypeType = {};
      phenotypeNamesArray.forEach((phenotype, index) => {
        phenotypes[phenotype] = {
          label: phenotype,
          color: phenotypeColors[index],
        }
      })
      setPhenotypes(phenotypes);
    }
  }, [phenotypeNamesArray, selectedConnectionSummary])

  const nerves = getNerveFilters(viasConnection, majorNerves);


  useEffect(() => {
    // calculate the connectionsMap for the secondary heatmap
    if (selectedConnectionSummary && phenotypes && selectedConnectionSummary.hierarchy && hierarchicalNodes) {
      const destinations = getDestinations(selectedConnectionSummary);
      const connections = calculateSecondaryConnections(hierarchicalNodes, destinations, knowledgeStatements, summaryFilters, selectedConnectionSummary.hierarchy)
      setConnectionsMap(connections);
    }
  }, [hierarchicalNodes, selectedConnectionSummary, summaryFilters, knowledgeStatements, phenotypes]);


  useEffect(() => {
    // set the xAxis for the heatmap
    if (selectedConnectionSummary) {
      const xAxis = getXAxisForHeatmap(selectedConnectionSummary?.endOrgan || {} as Organ)
      setXAxis(xAxis);
    }
  }, [selectedConnectionSummary]);

  useEffect(() => {
    // set the yAxis for the heatmap
    if (selectedConnectionSummary && hierarchicalNodes) {
      const hierarchyNode = {
        [selectedConnectionSummary.hierarchy.id]: selectedConnectionSummary.hierarchy
      }
      const yHierarchicalItem = getYAxis(hierarchicalNodes, hierarchyNode);
      setYAxis(yHierarchicalItem);
    }
  }, [selectedConnectionSummary, hierarchicalNodes]);


  const handleCellClick = (x: number, y: number, yId: string): void => {
    // when the heatmap cell is clicked
    setSelectedCell({ x, y });
    const row = connectionsMap.get(yId);
    if (row) {
      setConnectionPage(1)
      const ksIds = Object.values(row[x]).reduce((acc, phenotypeData) => {
        return new Set([...acc, ...phenotypeData.ksIds]);
      }, new Set<string>());

      if (selectedConnectionSummary && Object.keys(selectedConnectionSummary.connections).length !== 0) {
        setShowConnectionDetails(SummaryType.DetailedSummary);
        const ksMap = getKnowledgeStatementMap(ksIds, knowledgeStatements);
        setUniqueKS(ksMap);
      }
    }
  }

  const heatmapData = useMemo(() => {
    return getSecondaryHeatmapData(yAxis, connectionsMap);
  }, [yAxis, connectionsMap]);

  return (
    <Box display='flex' flexDirection='column' minHeight={1}>
      <SummaryHeader
        showDetails={showConnectionDetails}
        setShowDetails={setShowConnectionDetails}
        uniqueKS={uniqueKS}
        connectionPage={connectionPage}
        setConnectionPage={setConnectionPage}
        totalConnectionCount={totalConnectionCount}
      />
      {
        showConnectionDetails === SummaryType.Instruction && (
          <SummaryInstructions />
        )
      }

      {showConnectionDetails === SummaryType.DetailedSummary ? (
        <SummaryDetails
          uniqueKS={uniqueKS}
          connectionPage={connectionPage}
        />
      ) : showConnectionDetails === SummaryType.Instruction ? (<></>) : (
        <>
          <Box p={3} display='flex' flexDirection='column' gap={3}>
            <Box display='flex' alignItems='flex-end' gap={1.5}>
              <Box flex={1}>
                <Typography sx={{ ...styles.heading, marginBottom: '0.75rem' }}>Connection origin</Typography>
                <TextField value={selectedConnectionSummary?.origin || ''} fullWidth />
              </Box>
              <ArrowRightIcon />
              <Box flex={1}>
                <Typography sx={{ ...styles.heading, marginBottom: '0.75rem' }}>End Organ</Typography>
                <TextField value={selectedConnectionSummary?.endOrgan?.name} fullWidth />
              </Box>
            </Box>

            <Box>
              <Typography sx={styles.heading}>Amount of connections</Typography>
              <Chip label={totalConnectionCount + ' connections'} variant="outlined" color="primary" />
            </Box>

            <Box>
              <Typography sx={styles.heading}>Connections are through these nerves</Typography>
              <Typography sx={styles.text}>{viasStatement}</Typography>
            </Box>
          </Box>

          <Box display='flex' flexDirection='column' flex={1} p={3} sx={{
            borderTop: `0.0625rem solid ${gray100}`,
          }}>
            <Box mb={3}>
              <Typography sx={{ ...styles.heading, fontSize: '1rem', lineHeight: '1.5rem' }}>Summary map</Typography>
              <Typography sx={styles.text}>
                Summary map shows the connections of the selected connection origin and end organ with phenotypes. Select individual squares to view the details of each connections.
              </Typography>
            </Box>
            <SummaryFiltersDropdown nerves={nerves} phenotypes={phenotypes} />
            <HeatmapGrid
              yAxis={yAxis}
              setYAxis={setYAxis}
              xAxis={xAxis}
              onCellClick={handleCellClick}
              selectedCell={selectedCell}
              secondaryHeatmapData={heatmapData}
              xAxisLabel={'Project to'}
              yAxisLabel={'Somas in'}
                phenotypes={phenotypes}
            />
          </Box>

          <PhenotypeLegend phenotypes={phenotypes} />
        </>
      )
      }


    </Box>
  )
}

export default Connections
