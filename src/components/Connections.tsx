import { Box, Chip, TextField, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { ArrowRightIcon } from "./icons";
import { vars } from "../theme/variables";
import SummaryHeader from "./connections/SummaryHeader";
import CustomFilterDropdown from "./common/CustomFilterDropdown";
import { Option, PhenotypeDetail, SummaryType, ksMapType } from "./common/Types";
import HeatmapGrid from "./common/Heatmap";
import Details from "./connections/Details.tsx";
import SummaryInstructions from "./connections/SummaryInstructions.tsx";
import { ConnectionSummary, useDataContext } from "../context/DataContext.ts";
import { SubConnections, calculateSecondaryHeatmapConnections, getSecondaryHeatmapData, getYAxis } from "../services/heatmapService.ts";
import { HierarchicalItem } from "./ConnectivityGrid.tsx";
import { Organ } from "../models/explorer.ts";

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

const generatePhenotypeColors = (num: number) => {
  // some fixed colors for phenotypes - 4 colors
  const colors = [
    'rgba(155, 24, 216, 1)',
    'rgba(44, 44, 206, 1)',
    'rgba(220, 104, 3, 1)',
    'rgba(234, 170, 8, 1)',
  ];
  for (let i = 4; i < num; i++) {
    colors.push(`rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`);
  }
  return colors;
}

// const check each property inside to check if it is empty or not
const checkIfConnectionSummaryIsEmpty = (connectionSummary: ConnectionSummary): boolean => {
  return Object.values(connectionSummary).every((value) => {
    if (Array.isArray(value)) {
      return value.length === 0;
    }
    if (typeof value === 'object') {
      return checkIfConnectionSummaryIsEmpty(value);
    }
    return value === "";
  });
}



function Connections() {
  const [showConnectionDetails, setShowConnectionDetails] = useState<SummaryType>('instruction');
  const { selectedConnectionSummary, majorNerves, hierarchicalNodes, knowledgeStatements } = useDataContext();

  useEffect(() => {
    if (checkIfConnectionSummaryIsEmpty(selectedConnectionSummary)) {
      setShowConnectionDetails('instruction');
    } else {
      setShowConnectionDetails('summary');
    }
  }, [selectedConnectionSummary])

  function convertViaToString(via: string[]): string {
    if (via.length === 0) return '-';
    if (via.length > 1) {
      return via.join(', ').replace(/,(?=[^,]*$)/, ' and');
    }
    return via[0];
  }

  function getAllViasFromConnections(connections: ksMapType): { [key: string]: string } {
    let vias: { [key: string]: string } = {};
    Object.values(connections).forEach(connection => {
      if (connection.ks.via && connection.ks.via.length > 0) {
        const flattenedVias = connection.ks.via.flatMap(via => via.anatomical_entities);
        flattenedVias.forEach(via => {
          vias[via.id] = via.name;
        });
      }
    });
    return vias;
  }

  const viasConnection = getAllViasFromConnections(selectedConnectionSummary.connections);
  const viasStatement = convertViaToString(Object.values(viasConnection))
  const totalConnectionCount = Object.keys(selectedConnectionSummary.connections).length;

  function getAllPhenotypes(connections: ksMapType): string[] {
    const phenotypeNames: Set<string> = new Set();
    Object.values(connections).forEach(connection => {
      if (connection.ks?.phenotype) {
        phenotypeNames.add(connection.ks.phenotype);
      } else {
        phenotypeNames.add('UNKNOWN');
      }
    });
    return Array.from(phenotypeNames)
  }
  const phenotypes = getAllPhenotypes(selectedConnectionSummary.connections);
  const phenotypeFilters: PhenotypeDetail[] = useMemo(() => {
    const phenotypeColors: string[] = generatePhenotypeColors(phenotypes.length)
    return phenotypes.map((phenotype, index) => ({
      label: phenotype,
      color: phenotypeColors[index]
    }))
  }, [phenotypes]);


  const searchPhenotypeFilter = (searchValue: string): Option[] => {
    let searchedPhenotype = phenotypes
    return searchedPhenotype.map((phenotype) => ({
      id: phenotype,
      label: phenotype,
      group: 'Phenotype',
      content: []
    }));
  }

  const getNerveFilters = (viasConnection: { [key: string]: string }, majorNerves: Set<string>) => {
    let nerves: { [key: string]: string } = {};
    Object.keys(viasConnection).forEach(via => {
      if (Array.from(majorNerves).includes(via)) {
        nerves[via] = viasConnection[via];
      }
    });
    return nerves;
  }

  const nerves = getNerveFilters(viasConnection, majorNerves);


  const searchNerveFilter = (searchValue: string): Option[] => {
    let searchedNerve = Object.keys(nerves)
    return searchedNerve.map((nerve) => ({
      id: nerve,
      label: nerves[nerve],
      group: 'Nerve',
      content: []
    }));
  }

  const [connectionsMap, setConnectionsMap] = useState<Map<string, SubConnections[]>>(new Map());

  // Convert hierarchicalNodes to hierarchicalItems
  useEffect(() => {
    if (!checkIfConnectionSummaryIsEmpty(selectedConnectionSummary) && phenotypeFilters) {
      const endorgan = Array.from(selectedConnectionSummary?.endOrgan.children)?.reduce((acc, organ) => {
        acc[organ.id] = { ...organ, children: new Set() };
        return acc;
      }, {} as Record<string, Organ>);

      const connections = calculateSecondaryHeatmapConnections(hierarchicalNodes, endorgan, knowledgeStatements, phenotypeFilters, true);
      setConnectionsMap(connections)
    }
  }, [hierarchicalNodes, selectedConnectionSummary?.endOrgan, knowledgeStatements]);

  function getXAxisForHeatmap() {
    if (selectedConnectionSummary.endOrgan?.children) {
      const uniqueEndOrgans = new Set(Array.from(selectedConnectionSummary.endOrgan.children).map((endOrgan) => endOrgan.name));
      return Array.from(uniqueEndOrgans);
    }
    return []
  }
  const xAxis = getXAxisForHeatmap()
  const yAxisCon = selectedConnectionSummary.hierarchy

  const [yAxis, setYAxis] = useState<HierarchicalItem[]>([]);

  useEffect(() => {
    if (!checkIfConnectionSummaryIsEmpty(selectedConnectionSummary)) {
      const yAxis = getYAxis(hierarchicalNodes);

      function yAxisNode(node: HierarchicalItem): HierarchicalItem {
        if (node?.id === yAxisCon?.id) {
          return node;
        }
        if (node.children) {
          let found = false;
          for (let child of node.children) {
            if (found) break;
            const nodeFound = yAxisNode(child);
            if (nodeFound?.id) {
              found = true;
              return nodeFound;
            }
          }
        }

        return {} as HierarchicalItem;
      }

      const yNode = yAxis.map(yAxisNode).filter(node => Object.keys(node).length > 0);
      setYAxis(yNode);
    }
  }, [selectedConnectionSummary]);

  const heatmapData = useMemo(() => {
    const data = getSecondaryHeatmapData(yAxis, connectionsMap);
    return data;
  }, [yAxis, connectionsMap]);

  const [uniqueKS, setUniqueKS] = useState<ksMapType>({});


  const handleClickCell = (x: number, y: number): void => {
    if (Object.keys(selectedConnectionSummary.connections).length !== 0) {
      setShowConnectionDetails('detailedSummary');
      setUniqueKS(selectedConnectionSummary.connections)
    }
  }

  const [connectionCount, setConnectionCount] = useState(1);


    return (
        <Box display='flex' flexDirection='column' minHeight={1}>
        {
          showConnectionDetails !== 'instruction' &&
          <SummaryHeader
            showDetails={showConnectionDetails}
            setShowDetails={setShowConnectionDetails}
            uniqueKS={uniqueKS}
            connectionCount={connectionCount}
            setConnectionCount={setConnectionCount}
          />
        }
          
        {showConnectionDetails === 'detailedSummary' ?
            <>
            <Details
              uniqueKS={uniqueKS}
              connectionCount={connectionCount}
            />
          </>
          :
          showConnectionDetails === 'instruction' ?
            <>
              <SummaryInstructions />
            </>
            :
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
                    placeholder="Phenotype"
                    options={{
                      value: "",
                      id: "Phenotype",
                      searchPlaceholder: "Search Phenotype",
                      onSearch: (searchValue: string) => searchPhenotypeFilter(searchValue),
                    }}
                  />
                  <CustomFilterDropdown
                    key={"Nerve"}
                    placeholder="Nerve"
                    options={{
                      value: "",
                      id: "nerve",
                      searchPlaceholder: "Search Nerve",
                      onSearch: (searchValue: string) => searchNerveFilter(searchValue),
                    }}
                  />
                </Box>
                <HeatmapGrid
                  yAxis={yAxis}
                  setYAxis={setYAxis}
                  xAxis={xAxis}
                  onCellClick={handleClickCell}
                  selectedCell={{ x: -1, y: -1 }}
                  secondaryHeatmapData={heatmapData}
                  xAxisLabel={'Project to'}
                  yAxisLabel={'Somas in'}
                />
              </Box>
              <PhenotypeLegend phenotypes={phenotypeFilters} />
            </>
        }


      </Box>
  )
}

const PhenotypeLegend = (
  { phenotypes }: { phenotypes: PhenotypeDetail[] }
) => {
  return (
    <Box sx={{
      position: 'sticky',
      bottom: 0,
      padding: '0 1.5rem',
      background: '#fff'
    }}>
      <Box sx={{
        borderTop: `0.0625rem solid ${gray100}`,
        padding: '0.9375rem 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography sx={{
          fontSize: '0.75rem',
          fontWeight: 500,
          lineHeight: '1.125rem',
          color: '#818898'
        }}>Phenotype</Typography>

        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          {phenotypes?.map((type: PhenotypeDetail) => (
            <Box sx={{
              p: '0.1875rem 0.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem'
            }}
              key={type.label}
            >
              <Box sx={{
                width: '1.4794rem',
                height: '1rem',
                borderRadius: '0.125rem',
                background: `${type.color}`
              }} />
              <Typography sx={{
                fontSize: '0.75rem',
                fontWeight: 400,
                lineHeight: '1.125rem',
                color: '#4A4C4F'
              }}>{type.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
    )

}

export default Connections
