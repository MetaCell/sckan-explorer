import {Box, Button, CircularProgress, Typography} from "@mui/material";
import React, {useEffect, useMemo, useState} from "react";
import {vars} from "../theme/variables";
import HeatmapGrid from "./common/Heatmap";
import {useDataContext} from "../context/DataContext.ts";
import {calculateConnections, getMinMaxConnections, getXAxis, getYAxis} from "../services/heatmapService.ts";
import Filters from "./Filters.tsx";

export interface HierarchicalItem {
    label: string;
    children: HierarchicalItem[];
    expanded: boolean;
}

const {gray500, white: white, gray25, gray100, primaryPurple600, gray400} = vars;



function ConnectivityGrid() {
    const {hierarchicalNodes, organs, knowledgeStatements} = useDataContext();

    const [yAxis, setYAxis] = useState<HierarchicalItem[]>([]);
    const [xAxis, setXAxis] = useState<string[]>([]);
    const [connectionsMap, setConnectionsMap] = useState<Map<string, number[]>>(new Map());

    // Convert hierarchicalNodes to hierarchicalItems
    useEffect(() => {
        const connections = calculateConnections(hierarchicalNodes, organs, knowledgeStatements);
        setConnectionsMap(connections)
    }, [hierarchicalNodes, organs, knowledgeStatements]);

    const {min, max} = useMemo(() => {
        return getMinMaxConnections(connectionsMap);
    }, [connectionsMap]);

    useEffect(() => {
        const xAxis = getXAxis(organs);
        setXAxis(xAxis);
    }, [organs]);

    useEffect(() => {
        const yAxis = getYAxis(hierarchicalNodes);
        setYAxis(yAxis);
    }, [hierarchicalNodes]);

    const handleClick = (x: string, y: string): void => {
        console.log(x)
        console.log(y)
    };

    const isLoading = yAxis.length == 0

    return (isLoading ? <CircularProgress/> : (
        <Box minHeight='100%' p={3} pb={0} fontSize={14} display='flex' flexDirection='column'>
            <Box pb={2.5}>
                <Typography variant="h6" sx={{fontWeight: 400}}>Connection Origin to End Organ</Typography>
            </Box>

            <Filters/>

            <HeatmapGrid initialYAxis={yAxis} xAxis={xAxis} connectionsMap={connectionsMap}
                         xAxisLabel={'End organ'} yAxisLabels={'Connection Origin'}
                         onCellClick={handleClick}
            />

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
                        }}>{min}</Typography>

                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                        }}>
                            {[1, 2, 3, 4, 5, 6].reverse().map((el: number) => <Box
                                key={el}
                                sx={{
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
                        }}>{max}</Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    ))
}

export default ConnectivityGrid
