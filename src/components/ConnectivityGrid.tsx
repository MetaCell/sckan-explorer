import {Box, Button, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import CustomFilterDropdown from "./common/CustomFilterDropdown";
import {vars} from "../theme/variables";
import {Option} from "./common/Types";
import {mockEntities} from "./common/MockEntities";
import HeatmapGrid from "./common/Heatmap";
import {useDataContext} from "../context/DataContext.ts";
import {calculateConnections, getXAxis, getYAxis} from "../services/heatmapService.ts";

export interface HierarchicalItem {
    label: string;
    children: HierarchicalItem[];
    expanded: boolean;
}

const {gray500, white: white, gray25, gray100, primaryPurple600, gray400} = vars;

const getEntities = (searchValue: string /* unused */): Option[] => {

    console.log(`Received search value: ${searchValue}`);

    // Return mockEntities or perform other logic
    return mockEntities;
};

function ConnectivityGrid() {
    const {hierarchicalNodes, organs} = useDataContext();

    const [yAxis, setYAxis] = useState<HierarchicalItem[]>([]);
    const [xAxis, setXAxis] = useState<string[]>([]);
    const [connectionsMap, setConnectionsMap] = useState<Map<string, number[]>>(new Map());

    // Convert hierarchicalNodes to ListItems
    useEffect(() => {
        const connections = calculateConnections(hierarchicalNodes, organs);
        setConnectionsMap(connections)
    }, [hierarchicalNodes, organs]);

    useEffect(() => {
        const xAxis = getXAxis(organs);
        setXAxis(xAxis);
    }, [organs]);

    useEffect(() => {
        const yAxis = getYAxis(hierarchicalNodes);
        setYAxis(yAxis);
    }, [hierarchicalNodes]);

    const [selectedCell, setSelectedCell] = useState<{ x: number, y: number } | null>(null);

    const handleClick = (x: number, y: number): void => {
        setSelectedCell({x, y});
    };

    const canGenerateHeatmap = yAxis.length > 0

    return (
        <Box minHeight='100%' p={3} pb={0} fontSize={14} display='flex' flexDirection='column'>
            <Box pb={2.5}>
                <Typography variant="h6" sx={{fontWeight: 400}}>Connection Origin to End Organ</Typography>
            </Box>

            <Box display="flex" gap={1} flexWrap='wrap'>
                <CustomFilterDropdown
                    key={"Origin"}
                    placeholder="Origin"
                    options={{
                        value: "",
                        id: "origin",
                        searchPlaceholder: "Search origin",
                        onSearch: (searchValue: string): Option[] => getEntities(searchValue),
                    }}
                />
                <CustomFilterDropdown
                    key={"End Origin"}
                    placeholder="End organ"
                    options={{
                        value: "",
                        id: "endorgan",
                        searchPlaceholder: "Search End organ",
                        onSearch: (searchValue: string) => getEntities(searchValue),
                    }}
                />
                <CustomFilterDropdown
                    key={"Species"}
                    placeholder="Species"
                    options={{
                        value: "",
                        id: "species",
                        searchPlaceholder: "Search Species",
                        onSearch: (searchValue: string) => getEntities(searchValue),
                    }}
                />
                <CustomFilterDropdown
                    key={"Phenotype"}
                    placeholder="Phenotype"
                    options={{
                        value: "",
                        id: "phenotype",
                        searchPlaceholder: "Search Phenotype",
                        onSearch: (searchValue: string) => getEntities(searchValue),
                    }}
                />
                <CustomFilterDropdown
                    key={"ApiNATOMY"}
                    placeholder="ApiNATOMY"
                    options={{
                        value: "",
                        id: "ApiNATOMY",
                        searchPlaceholder: "Search ApiNATOMY",
                        onSearch: (searchValue: string) => getEntities(searchValue),
                    }}
                />
                <CustomFilterDropdown
                    key={"Via"}
                    placeholder="Via"
                    options={{
                        value: "",
                        id: "via",
                        searchPlaceholder: "Search Via",
                        onSearch: (searchValue: string) => getEntities(searchValue),
                    }}
                />
            </Box>

            {canGenerateHeatmap &&
              <HeatmapGrid initialYAxis={yAxis} xAxis={xAxis} connectionsMap={connectionsMap}
                           xAxisLabel={'End organ'} yAxisLabels={'Connection Origin'}
                           cellClick={handleClick}
                           selectedCell={selectedCell}/>}

            <Box
                py={1.5}
                borderTop={`0.0625rem solid ${gray100}`}
                width={1}
                display='flex'
                alignItems='center'
                justifyContent='space-between'
                position='sticky'
                bottom={0}
                sx={{background: white}}
            >
                <Button variant="text" sx={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    lineHeight: '1.25rem',
                    color: primaryPurple600,
                    padding: 0,

                    '&:hover': {
                        background: 'transparent'
                    }
                }}>Reset grid</Button>

                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    height: '1.875rem',
                    padding: '0 0.75rem',
                    borderRadius: '0.25rem',
                    background: gray25,
                    border: `0.0625rem solid ${gray100}`,
                    gap: '0.75rem'

                }}>
                    <Typography sx={{
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        lineHeight: '1.125rem',
                        color: gray500
                    }}>Connections</Typography>

                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                    }}>
                        <Typography sx={{
                            fontSize: '0.75rem',
                            fontWeight: 400,
                            lineHeight: '1.125rem',
                            color: gray400
                        }}>1</Typography>

                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                        }}>
                            {[1, 2, 3, 4, 5, 6].reverse().map((el: number) => <Box sx={{
                                width: '1.5rem',
                                height: '1rem',
                                background: `rgba(131, 0, 191, ${1 - (el / 6.5)})`,
                            }}/>)}
                        </Box>

                        <Typography sx={{
                            fontSize: '0.75rem',
                            fontWeight: 400,
                            lineHeight: '1.125rem',
                            color: gray400
                        }}>100+</Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default ConnectivityGrid
