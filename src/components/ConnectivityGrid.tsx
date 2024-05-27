import { Box, Button, Typography } from "@mui/material";
import React, {useEffect, useMemo, useState} from "react";
import {vars} from "../theme/variables";
import HeatmapGrid from "./common/Heatmap";
import { useDataContext } from "../context/DataContext.ts";
import {
    calculateConnections, getMinMaxConnections, getHierarchyFromId,
    getXAxisOrgans, getYAxis, getHeatmapData,
    getKnowledgeStatementMap,
} from "../services/heatmapService.ts";
import FiltersDropdowns from "./FiltersDropdowns.tsx";
import { HierarchicalItem } from "./common/Types.ts";
import { Organ } from "../models/explorer.ts";
import Loader from "./common/Loader.tsx";


const {gray500, white: white, gray25, gray100, primaryPurple600, gray400} = vars;


function ConnectivityGrid() {
    const { hierarchicalNodes, organs, knowledgeStatements, filters, setConnectionSummary } = useDataContext();

    const [yAxis, setYAxis] = useState<HierarchicalItem[]>([]);
    const [xAxisOrgans, setXAxisOrgans] = useState<Organ[]>([]);
    const [connectionsMap, setConnectionsMap] = useState<Map<string, Set<string>[]>>(new Map());
    const [selectedCell, setSelectedCell] = useState<{ x: number, y: number } | null>(null);

    useEffect(() => {
        const connections = calculateConnections(hierarchicalNodes, organs, knowledgeStatements, filters);
        setConnectionsMap(connections)
    }, [hierarchicalNodes, organs, knowledgeStatements, filters]);

    const {min, max} = useMemo(() => {
        return getMinMaxConnections(connectionsMap);
    }, [connectionsMap]);

    useEffect(() => {
        const organList = getXAxisOrgans(organs);
        setXAxisOrgans(organList);
    }, [organs]);

    const xAxis = useMemo(() => {
        return xAxisOrgans.map(organ => organ.name);
    }, [xAxisOrgans]);

    useEffect(() => {
        const yAxis = getYAxis(hierarchicalNodes);
        setYAxis(yAxis);
    }, [hierarchicalNodes]);

    const { heatmapData, detailedHeatmapData } = useMemo(() => {
        const heatmapdata = getHeatmapData(yAxis, connectionsMap);
        return {
            heatmapData: heatmapdata.heatmapMatrix,
            detailedHeatmapData: heatmapdata.detailedHeatmap,
        };
    }, [yAxis, connectionsMap]);

    const handleClick = (x: number, y: number, yId: string): void => {
        setSelectedCell({ x, y });
        const row = connectionsMap.get(yId);
        if (row) {
            const endOrgan = xAxisOrgans[x];
            const origin = detailedHeatmapData[y];
            const hierarchy = getHierarchyFromId(origin.id, hierarchicalNodes);
            const ksMap = getKnowledgeStatementMap(row[x], knowledgeStatements);

            setConnectionSummary({
                origin: origin.label,
                endOrgan: endOrgan,
                connections: ksMap,
                hierarchy: hierarchy
            });
        }
    };
    const isLoading = yAxis.length == 0

    return (isLoading ? <Loader /> : (
        <Box minHeight='100%' p={3} pb={0} fontSize={14} display='flex' flexDirection='column'>
            <Box pb={2.5}>
                <Typography variant="h6" sx={{ fontWeight: 400 }}>Connection Origin to End Organ</Typography>
            </Box>

            <FiltersDropdowns/>

            <HeatmapGrid
                yAxis={yAxis}
                setYAxis={setYAxis}
                heatmapData={heatmapData}
                xAxis={xAxis}
                xAxisLabel={'End organ'} yAxisLabel={'Connection Origin'}
                onCellClick={handleClick}
                selectedCell={selectedCell}
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
                sx={{ background: white }}
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
