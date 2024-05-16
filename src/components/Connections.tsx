import React, { useEffect, useMemo, useState } from "react";
import { Box, Chip, TextField, Typography } from "@mui/material";
import { ArrowRightIcon } from "./icons";
import { vars } from "../theme/variables";
import { HierarchicalItem, ISubConnections, Option, SummaryType, ksMapType } from "./common/Types";
import { mockEntities } from "./common/MockEntities";
import { Filters, useDataContext } from "../context/DataContext.ts";
import {
  calculateSecondaryConnections,
  checkIfConnectionSummaryIsEmpty, convertViaToString, generatePhenotypeColors,
  getAllPhenotypes, getAllViasFromConnections, getNerveFilters,
  getSecondaryHeatmapData,
  getYAxisNode
} from "../services/summaryHeatmapService.ts";
import { getYAxis, calculateConnections, getKnowledgeStatementAndCount } from "../services/heatmapService.ts";
import CustomFilterDropdown from "./common/CustomFilterDropdown";
import SummaryHeader from "./connections/SummaryHeader";
import Details from "./connections/Details.tsx";
import SummaryInstructions from "./connections/SummaryInstructions.tsx";
import PhenotypeLegend from "./connections/PhenotypeLegend.tsx";
import HeatmapGrid from "./common/Heatmap.tsx";
import { HierarchicalNode, Organ } from "../models/explorer.ts";

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

type PhenotypeDetail = {
    label: string;
    color: string;
};
const phenotype: PhenotypeDetail[] = [
    {
        label: 'Sympathetic',
        color: '#9B18D8'
    },
    {
        label: 'Parasympathetic',
        color: '#2C2CCE'
    },
    {
        label: 'Sensory',
        color: '#DC6803'
    },
    {
        label: 'Motor',
        color: '#EAAA08'
    }
]


function Connections() {
  const [showConnectionDetails, setShowConnectionDetails] = useState<SummaryType>('instruction');
  const [connectionsMap, setConnectionsMap] = useState<Map<string, ISubConnections[]>>(new Map());
  const [connectionCount, setConnectionCount] = useState(1);
  const [yAxis, setYAxis] = useState<HierarchicalItem[]>([]);
  const [selectedCell, setSelectedCell] = useState<{ x: number, y: number } | null>(null);

  const { selectedConnectionSummary, majorNerves, hierarchicalNodes, knowledgeStatements, summaryFilters } = useDataContext();
  useEffect(() => {
    if (checkIfConnectionSummaryIsEmpty(selectedConnectionSummary)) {
      setShowConnectionDetails('instruction');
    } else {
      setShowConnectionDetails('summary');
    }
  }, [selectedConnectionSummary])

  const viasConnection = getAllViasFromConnections(selectedConnectionSummary.connections);
  const viasStatement = convertViaToString(Object.values(viasConnection))
  const totalConnectionCount = Object.keys(selectedConnectionSummary.connections).length;
  const phenotypes = getAllPhenotypes(selectedConnectionSummary.connections);
  const [phenotypeFilters, setPhenotypeFilters] = useState<PhenotypeDetail[]>(phenotype);
  // const phenotypeFilters: PhenotypeDetail[] = useMemo(() => {
  //   const phenotypeColors: string[] = generatePhenotypeColors(phenotypes.length)
  //   return phenotypes.map((phenotype, index) => ({
  //     label: phenotype,
  //     color: phenotypeColors[index]
  //   }))
  // }, [phenotypes]);

  useEffect(() => {
    if (!checkIfConnectionSummaryIsEmpty(selectedConnectionSummary)) {
      const phenotypes = getAllPhenotypes(selectedConnectionSummary.connections);
      const phenotypeColors: string[] = generatePhenotypeColors(phenotypes.length)
      setPhenotypeFilters(phenotypes.map((phenotype, index) => ({
        label: phenotype,
        color: phenotypeColors[index]
      })))
    }

  }, [])

  const nerves = getNerveFilters(viasConnection, majorNerves);

  const searchPhenotypeFilter = (searchValue: string): Option[] => {
    let searchedPhenotype = phenotypes
    return searchedPhenotype.map((phenotype) => ({
      id: phenotype,
      label: phenotype,
      group: 'Phenotype',
      content: []
    }));
  }
  const searchNerveFilter = (searchValue: string): Option[] => {
    let searchedNerve = Object.keys(nerves)
    return searchedNerve.map((nerve) => ({
      id: nerve,
      label: nerves[nerve],
      group: 'Nerve',
      content: []
    }));
  }

  useEffect(() => {
    if (!checkIfConnectionSummaryIsEmpty(selectedConnectionSummary) && phenotypeFilters) {
      const endorgans = Array.from(selectedConnectionSummary?.endOrgan.children)?.reduce((acc, organ) => {
        acc[organ.id] = { ...organ, children: new Set(), order: 0 };  // FIXME: order 0???
        return acc;
      }, {} as Record<string, Organ>);

      const connections = calculateSecondaryConnections(hierarchicalNodes, endorgans, knowledgeStatements, summaryFilters, phenotypeFilters);
      setConnectionsMap(connections);
    }
  }, [hierarchicalNodes, selectedConnectionSummary?.endOrgan, knowledgeStatements, phenotypeFilters]);

  function getXAxisForHeatmap() {
    if (selectedConnectionSummary.endOrgan?.children) {
      const uniqueEndOrgans = new Set(Array.from(selectedConnectionSummary.endOrgan.children).map((endOrgan) => endOrgan.name));
      return Array.from(uniqueEndOrgans);
    }
    return []
  }
  const xAxis = getXAxisForHeatmap()
  const yAxisCon = selectedConnectionSummary.hierarchy

  useEffect(() => {
    if (!checkIfConnectionSummaryIsEmpty(selectedConnectionSummary)) {
      const yAxis = getYAxis(hierarchicalNodes);
      const yNode = yAxis.map((node: HierarchicalItem) => getYAxisNode(node, yAxisCon))
        .filter((node: HierarchicalItem) => Object.keys(node).length > 0);
      setYAxis(yNode);
    }
  }, [selectedConnectionSummary]);

  const heatmapData = useMemo(() => {
    const data = getSecondaryHeatmapData(yAxis, connectionsMap);
    return data;
  }, [yAxis, xAxis, connectionsMap, selectedConnectionSummary.connections]);

  const [uniqueKS, setUniqueKS] = useState<ksMapType>({});

  const handleCellClick = (x: number, y: number, yId: string): void => {
    setSelectedCell({ x, y });
    setConnectionCount(1)
    const row = connectionsMap.get(yId);
    if (Object.keys(selectedConnectionSummary.connections).length !== 0 && row) {
      setShowConnectionDetails('detailedSummary');
      const ksMap = getKnowledgeStatementAndCount(row[x].ksIds, knowledgeStatements);
      setUniqueKS(ksMap)
    }
  }
    return (
        <Box display='flex' flexDirection='column' minHeight={1}>
        {
          // don't show header - for instructions
          showConnectionDetails !== 'instruction' && (
            <SummaryHeader
              showDetails={showConnectionDetails}
              setShowDetails={setShowConnectionDetails}
              uniqueKS={uniqueKS}
              connectionCount={connectionCount}
              setConnectionCount={setConnectionCount}
              totalConnectionCount={totalConnectionCount}
            />
          )
        }
          
        {showConnectionDetails === 'detailedSummary' ? (
            <>
            <Details
              uniqueKS={uniqueKS}
              connectionCount={connectionCount}
            />
          </>
        ) : showConnectionDetails === 'instruction' ? (
          <>
            <SummaryInstructions />
          </>
        ) : (
            <>
              <Box p={3} display='flex' flexDirection='column' gap={3}>
                <Box display='flex' alignItems='flex-end' gap={1.5}>
                  <Box flex={1}>
                    <Typography sx={{...styles.heading, marginBottom: '0.75rem'}}>Connection origin</Typography>
                      <TextField value={selectedConnectionSummary?.origin || ''} fullWidth />
                  </Box>
                  <ArrowRightIcon />
                  <Box flex={1}>
                    <Typography sx={{...styles.heading, marginBottom: '0.75rem'}}>End Organ</Typography>
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
                  <Typography sx={{...styles.heading, fontSize: '1rem', lineHeight: '1.5rem'}}>Summary map</Typography>
                  <Typography sx={styles.text}>
                    Summary map shows the connections of the selected connection origin and end organ with phenotypes. Select individual squares to view the details of each connections.
                  </Typography>
                </Box>
                <Box display="flex" gap={1} flexWrap='wrap'>
                    <CustomFilterDropdown
                        key={"Phenotype"}
                        id={"Phenotype"}
                        placeholder="Phenotype"
                        searchPlaceholder="Search Phenotype"
                        selectedOptions={[]}
                      onSearch={(searchValue: string) => searchPhenotypeFilter(searchValue)}
                        onSelect={() => {}}
                    />
                    <CustomFilterDropdown
                        key={"Nerve"}
                        id={"Nerve"}
                        placeholder="Nerve"
                        searchPlaceholder="Search Nerve"
                        selectedOptions={[]}
                      onSearch={(searchValue: string) => searchNerveFilter(searchValue)}
                        onSelect={() => {}}
                    />
                </Box>
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

                <PhenotypeLegend phenotypes={phenotypeFilters} />
            </>
            )
        }
         
          
        </Box>
    )
}

export default Connections
