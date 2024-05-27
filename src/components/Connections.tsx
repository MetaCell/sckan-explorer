import React, { useEffect, useMemo, useState } from "react";
import { Box, Chip, TextField, Typography } from "@mui/material";
import { ArrowRightIcon } from "./icons";
import { vars } from "../theme/variables";
import { HierarchicalItem, SubConnections, PhenotypeDetail, SummaryType, KsMapType, LabelIdPair } from "./common/Types";
import { useDataContext } from "../context/DataContext.ts";
import {
  calculateSecondaryConnections,
  convertViaToString, generatePhenotypeColors,
  getAllPhenotypes, getAllViasFromConnections, getNerveFilters,
  getSecondaryHeatmapData,
  getXAxisForHeatmap,
  getYAxisNode
} from "../services/summaryHeatmapService.ts";
import { getYAxis, getKnowledgeStatementMap, generateYLabelsAndIds } from "../services/heatmapService.ts";
import CustomFilterDropdown from "./common/CustomFilterDropdown";
import SummaryHeader from "./connections/SummaryHeader";
import SummaryInstructions from "./connections/SummaryInstructions.tsx";
import PhenotypeLegend from "./connections/PhenotypeLegend.tsx";
import HeatmapGrid from "./common/Heatmap.tsx";
import { BaseEntity, HierarchicalNode, Organ } from "../models/explorer.ts";
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
  const [connectionsMap, setConnectionsMap] = useState<Map<string, SubConnections[]>>(new Map());
  const [connectionPage, setConnectionPage] = useState(1);   // represents the page number / index of the connections - if (x,y) has 4 connections, then connectionPage will be 1, 2, 3, 4
  const [yAxis, setYAxis] = useState<HierarchicalItem[]>([]);
  const [selectedCell, setSelectedCell] = useState<{ x: number, y: number } | null>(null);

  const { selectedConnectionSummary, majorNerves, hierarchicalNodes, knowledgeStatements, summaryFilters } = useDataContext();

  useEffect(() => {
    if (selectedConnectionSummary) {
      setShowConnectionDetails(SummaryType.Summary);
    }
  }, [selectedConnectionSummary])

  const viasConnection = getAllViasFromConnections(selectedConnectionSummary?.connections || {} as KsMapType);
  const viasStatement = convertViaToString(Object.values(viasConnection))
  const totalConnectionCount = Object.keys(selectedConnectionSummary?.connections || {} as KsMapType).length;
  const phenotypeNamesArray = useMemo(() => getAllPhenotypes(selectedConnectionSummary?.connections || {} as KsMapType), [selectedConnectionSummary]);
  const [phenotypes, setPhenotypes] = useState<PhenotypeDetail[]>([]);


  useEffect(() => {
    if (selectedConnectionSummary && phenotypeNamesArray && phenotypeNamesArray.length > 0) {
      const phenotypeColors: string[] = generatePhenotypeColors(phenotypeNamesArray.length)
      setPhenotypes(phenotypeNamesArray.map((phenotype, index) => ({
        label: phenotype,
        color: phenotypeColors[index],
        ksId: ''
      })))
    }
  }, [phenotypeNamesArray, selectedConnectionSummary])

  const nerves = getNerveFilters(viasConnection, majorNerves);


  useEffect(() => {
    if (selectedConnectionSummary && phenotypes) {
      const destinations = Array.from(selectedConnectionSummary.endOrgan?.children?.values()).reduce((acc, organ, index) => {
        acc[organ.id] = { ...organ, children: new Map<string, BaseEntity>(), order: index };
        return acc;
      }, {} as Record<string, Organ>);

      const connections = calculateSecondaryConnections(
        hierarchicalNodes, destinations, knowledgeStatements, summaryFilters, phenotypes,
        selectedConnectionSummary.hierarchy
      );
      setConnectionsMap(connections);
    }
  }, [hierarchicalNodes, selectedConnectionSummary, summaryFilters, knowledgeStatements, phenotypes]);


  const [xAxis, setXAxis] = useState<string[]>([]);
  useEffect(() => {
    if (selectedConnectionSummary) {
      const xAxis = getXAxisForHeatmap(selectedConnectionSummary?.endOrgan || {} as Organ)
      setXAxis(xAxis);
    }
  }, [selectedConnectionSummary]);

  useEffect(() => {
    if (selectedConnectionSummary && hierarchicalNodes) {
      const hierarchyNode = {
        [selectedConnectionSummary.hierarchy.id]: selectedConnectionSummary.hierarchy
      }
      const yHierarchicalItem = getYAxis(hierarchicalNodes, hierarchyNode);
      setYAxis(yHierarchicalItem);
    }
  }, [selectedConnectionSummary, hierarchicalNodes]);


  const heatmapData = useMemo(() => {
    return getSecondaryHeatmapData(yAxis, connectionsMap);
  }, [yAxis, connectionsMap]);

  const [uniqueKS, setUniqueKS] = useState<KsMapType>({});

  const handleCellClick = (x: number, y: number, yId: string): void => {
    setSelectedCell({ x, y });
    setConnectionPage(1)
    const row = connectionsMap.get(yId);
    if (selectedConnectionSummary && Object.keys(selectedConnectionSummary.connections).length !== 0 && row) {
      setShowConnectionDetails(SummaryType.DetailedSummary)
      const ksMap = getKnowledgeStatementMap(row[x].ksIds, knowledgeStatements);
      setUniqueKS(ksMap);
    }
  }

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
