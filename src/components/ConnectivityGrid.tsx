import { Box, Button, CircularProgress, Typography } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import CustomFilterDropdown from "./common/CustomFilterDropdown";
import { vars } from "../theme/variables";
import { KSIDAndOriginType, Option, ksMapType } from "./common/Types";
import HeatmapGrid from "./common/Heatmap";
import { useDataContext } from "../context/DataContext.ts";
import { calculateConnections, getHeatmapData, getDetailedHeatmapData, getHierarchyFromId, getMinMaxConnections, getXAxisOrgans, getYAxis } from "../services/heatmapService.ts";
import { searchPlaceholder } from "../services/searchService.ts";
import { HierarchicalNode, KnowledgeStatement, Organ } from "../models/explorer.ts";

export interface HierarchicalItem {
    label: string;
    children: HierarchicalItem[];
    expanded: boolean;
    id?: string;
}

const { gray500, white: white, gray25, gray100, primaryPurple600, gray400 } = vars;

function ConnectivityGrid() {
    const { hierarchicalNodes, organs, knowledgeStatements, setConnectionSummary } = useDataContext();

    const [yAxis, setYAxis] = useState<HierarchicalItem[]>([]);
    const [xAxisOrgans, setXAxisOrgans] = useState<Organ[]>([]);
    const [connectionsMap, setConnectionsMap] = useState<Map<string, number[]>>(new Map());

    // Convert hierarchicalNodes to hierarchicalItems
    useEffect(() => {
        const connections = calculateConnections(hierarchicalNodes, organs, knowledgeStatements);
        setConnectionsMap(connections)
    }, [hierarchicalNodes, organs, knowledgeStatements]);


    const { min, max } = useMemo(() => {
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

    const [selectedCell, setSelectedCell] = useState<{ x: number, y: number } | null>(null);

    const handleClick = (x: number, y: number): void => {
        setSelectedCell({ x, y });
        const endOrgan = xAxisOrgans[x];

        const detailedHeatmap = getDetailedHeatmapData(yAxis, connectionsMap);
        const origin = detailedHeatmap[y];

        const hierarchy = getHierarchyFromId(origin.id, hierarchicalNodes);

        function getLeafHierarchyList(hierarchy_id: string, hierarchicalNodes: Record<string, HierarchicalNode>): string[] {
            const hierarchy = hierarchicalNodes[hierarchy_id];
            if (hierarchy.children.size === 0) {
                return [hierarchy_id];
            }
            return Array.from(hierarchy.children).flatMap(child => getLeafHierarchyList(child, hierarchicalNodes));
        }

        function getKSIdsAndOriginsFromHierarchy(hierarchy_id: string, hierarchicalNodes: Record<string, HierarchicalNode>) {
            const hierarchy = hierarchicalNodes[hierarchy_id];
            const KSIDAndOrigin: KSIDAndOriginType = [];
            if (hierarchy?.connectionDetails && hierarchy.connectionDetails[endOrgan.id]) {
                const ids = Object.values(hierarchy.connectionDetails[endOrgan.id]).flat();    // only connectionDetails/KS for the endOrgan selected
                const origin_name = hierarchy.name;
                KSIDAndOrigin.push({ origin_name: origin_name, ksIds: ids });
            }
            return KSIDAndOrigin;
        }

        function getKSForOriginAndEndOrgan(ksIdsAndOrigins: KSIDAndOriginType, knowledgeStatements: Record<string, KnowledgeStatement>): ksMapType {
            let ksMap: ksMapType = {};
            ksIdsAndOrigins.forEach(({ origin_name, ksIds }) => {
                ksIds.forEach(id => {
                    const ks = knowledgeStatements[id];
                    if (ks && ks.origins.some(o => o.name.includes(origin_name))) {
                        ksMap[id] = {
                            'ks': ks,
                            'count': ksMap[id] ? ksMap[id].count + 1 : 1
                        }
                    }
                });
            });
            return ksMap;
        }

        const leafHierarchyList = getLeafHierarchyList(hierarchy.id, hierarchicalNodes);
        const ksIdsAndOrigins = leafHierarchyList.flatMap(hierarchy_id => getKSIdsAndOriginsFromHierarchy(hierarchy_id, hierarchicalNodes));
        const ksMap = getKSForOriginAndEndOrgan(ksIdsAndOrigins, knowledgeStatements);
        setConnectionSummary({
            origin: origin.label,
            endOrgan: endOrgan,
            connections: ksMap,
            hierarchy: hierarchy
        });
    };

    const onSearchPlaceholder = (queryString: string, filterType: string): Option[] => {
        return searchPlaceholder(queryString, filterType, knowledgeStatements, organs)
    }

    const heatmapData = useMemo(() => {
        return getHeatmapData(yAxis, connectionsMap);
    }, [yAxis, connectionsMap]);

    const isLoading = yAxis.length == 0



    return (isLoading ? <CircularProgress /> : (
        <Box minHeight='100%' p={3} pb={0} fontSize={14} display='flex' flexDirection='column'>
            <Box pb={2.5}>
                <Typography variant="h6" sx={{ fontWeight: 400 }}>Connection Origin to End Organ</Typography>
            </Box>

            <Box display="flex" gap={1} flexWrap='wrap'>
                <CustomFilterDropdown
                    key={"Origin"}
                    placeholder="Origin"
                    options={{
                        value: "",
                        id: "origin",
                        searchPlaceholder: "Search origin",
                        onSearch: (searchValue: string): Option[] => onSearchPlaceholder(searchValue, "Origin"),
                    }}
                />
                <CustomFilterDropdown
                    key={"End Organ"}
                    placeholder="End organ"
                    options={{
                        value: "",
                        id: "endorgan",
                        searchPlaceholder: "Search End organ",
                        onSearch: (searchValue: string): Option[] => onSearchPlaceholder(searchValue, "End Organ"),
                    }}
                />
                <CustomFilterDropdown
                    key={"Species"}
                    placeholder="Species"
                    options={{
                        value: "",
                        id: "species",
                        searchPlaceholder: "Search Species",
                        onSearch: (searchValue: string): Option[] => onSearchPlaceholder(searchValue, "Species"),
                    }}
                />
                <CustomFilterDropdown
                    key={"Phenotype"}
                    placeholder="Phenotype"
                    options={{
                        value: "",
                        id: "phenotype",
                        searchPlaceholder: "Search Phenotype",
                        onSearch: (searchValue: string): Option[] => onSearchPlaceholder(searchValue, "Phenotype"),
                    }}
                />
                <CustomFilterDropdown
                    key={"ApiNATOMY"}
                    placeholder="ApiNATOMY"
                    options={{
                        value: "",
                        id: "ApiNATOMY",
                        searchPlaceholder: "Search ApiNATOMY",
                        onSearch: (searchValue: string): Option[] => onSearchPlaceholder(searchValue, "ApiNATOMY"),
                    }}
                />
                <CustomFilterDropdown
                    key={"Via"}
                    placeholder="Via"
                    options={{
                        value: "",
                        id: "via",
                        searchPlaceholder: "Search Via",
                        onSearch: (searchValue: string): Option[] => onSearchPlaceholder(searchValue, "Via"),
                    }}
                />
            </Box>

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
                                }} />)}
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
