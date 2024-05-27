import React, { FC, useCallback, useMemo, } from "react";
import { Box, Typography } from "@mui/material";
import { vars } from "../../theme/variables";
import CollapsibleList from "./CollapsibleList";
import HeatMap from "react-heatmap-grid";
import HeatmapTooltip from "./HeatmapTooltip";
import { HierarchicalItem, SubConnections } from "./Types.ts";
import { getNormalizedValueForMinMax } from "../../services/summaryHeatmapService.ts";
import { generateYLabelsAndIds, getPhenotypeColors } from "../../services/heatmapService.ts";


const { gray50, primaryPurple500, gray100A, gray500 } = vars;

interface HeatmapGridProps {
    xAxis: string[];
    yAxis: HierarchicalItem[];
    setYAxis: (yAxis: HierarchicalItem[]) => void;
    onCellClick?: (x: number, y: number, yId: string) => void;
    xAxisLabel?: string;
    yAxisLabel?: string;
    selectedCell?: { x: number, y: number } | null;
    heatmapData?: number[][];
    secondaryHeatmapData?: SubConnections[][];
}

const prepareSecondaryHeatmapData = (data?: SubConnections[][]): number[][] => {
    if (!data) return [];
    return data.map(row => row.map(cell => cell.ksIds.size));
}


const HeatmapGrid: FC<HeatmapGridProps> = ({
    xAxis, yAxis, setYAxis,
    xAxisLabel, yAxisLabel,
    onCellClick, selectedCell, heatmapData, secondaryHeatmapData
}) => {
    const secondary = secondaryHeatmapData ? true : false;

    const heatmapMatrixData = useMemo(() => {
        return secondary ? prepareSecondaryHeatmapData(secondaryHeatmapData) : heatmapData;
    }, [secondary, secondaryHeatmapData, heatmapData]);

    const handleCollapseClick = useCallback((item: HierarchicalItem) => {
        const updateList = (list: HierarchicalItem[], selectedItem: HierarchicalItem): HierarchicalItem[] => {
            return list?.map(listItem => {
                if (listItem.label === selectedItem.label) {
                    return { ...listItem, expanded: !listItem.expanded };
                } else if (listItem.children) {
                    return { ...listItem, children: updateList(listItem.children, selectedItem) };
                }
                return listItem;
            });
        };
        const updatedList = updateList(yAxis, item);
        setYAxis(updatedList);
    }, [yAxis, setYAxis]);

    const yAxisData = generateYLabelsAndIds(yAxis);



    const handleCellClick = (x: number, y: number) => {
        const ids = yAxisData.ids
        if (onCellClick) {
            onCellClick(x, y, ids[y]);
        }
    }

    const getCellBgColorFromPhenotype = (
        normalizedValue: number,
        _x: number,
        _y: number
    ) => {
        if (secondary && secondaryHeatmapData && secondaryHeatmapData[_y] && secondaryHeatmapData[_y][_x]) {
            const phenotypeColors = secondaryHeatmapData[_y][_x]?.colors;
            const phenotypeColor = getPhenotypeColors(normalizedValue, phenotypeColors);

            return phenotypeColor ? phenotypeColor : `rgba(131, 0, 191, ${normalizedValue})`;
        }
        return `rgba(0, 0, 0, ${normalizedValue})`
    };

    return (
        <Box flex={1} my={3} display='inline-flex' flexDirection='column'>
            <Box mb={1.5} pl="17.375rem">
                <Typography sx={{
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 400,
                    lineHeight: '1.25rem',
                    minWidth: '4.0625rem',
                    color: gray500

                }}>{xAxisLabel}</Typography>
            </Box>
            <Box width='calc(100% - 1.625rem)' minWidth={0} display='flex' alignItems='center'>
                {yAxisLabel && (
                    <Typography sx={{
                        textAlign: 'center',
                        fontSize: '0.875rem',
                        marginTop: '4.875rem',
                        paddingRight: '0.75rem',
                        fontWeight: 400,
                        writingMode: 'vertical-lr',
                        lineHeight: 1,
                        color: gray500

                    }}>{yAxisLabel}</Typography>
                )}

                <Box width={1} position='relative'
                    sx={{
                        '& > div:first-of-type': {
                            '& > div:last-of-type': {
                                '& > div': {
                                    '& > div': {
                                        '&:not(:first-of-type)': {
                                            '&:hover': {
                                                boxShadow: '0rem 0.0625rem 0.125rem 0rem #1018280F, 0rem 0.0625rem 0.1875rem 0rem #1018281A'
                                            },
                                            '& > div': {
                                                paddingTop: '0 !important',
                                                height: '100%',

                                                '& > div': {
                                                    height: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }
                                            }
                                        },
                                        '&:first-of-type': {
                                            width: '15.625rem',
                                            flex: 'none !important',
                                            '& > div': {
                                                opacity: 0
                                            }
                                        }
                                    }
                                }
                            },
                            '& > div:first-of-type': {
                                '& > div': {
                                    writingMode: 'vertical-lr',
                                    lineHeight: 1,
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    alignItems: 'center',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    marginLeft: '0.125rem',
                                    padding: '0.875rem 0',
                                    position: 'relative',
                                    borderRadius: '0.25rem',
                                    minWidth: '2rem !important',

                                    '&:hover': {
                                        background: gray50,
                                        '&:before': {
                                            content: '""',
                                            width: '100%',
                                            height: '0.0625rem',
                                            background: primaryPurple500,
                                            position: 'absolute',
                                            top: '-0.25rem',
                                            left: 0
                                        },
                                    },

                                    '&:first-of-type': {
                                        marginLeft: 0,
                                        width: '15.625rem',
                                        flex: 'none !important',
                                        '&:hover': {
                                            background: 'none',
                                            '&:before': {
                                                display: 'none'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }}>
                    {
                        yAxisData && heatmapMatrixData && heatmapMatrixData.length > 0 && heatmapMatrixData[0].length > 0 && (
                            <HeatMap
                                xLabels={xAxis}
                                yLabels={yAxisData.labels}
                                xLabelsLocation={"top"}
                                xLabelsVisibility={xAxis?.map(() => true)}
                                xLabelWidth={160}
                                yLabelWidth={250}
                                data={heatmapMatrixData}
                                // squares
                                height={43}
                                onClick={(x: number, y: number) => handleCellClick(x, y)}
                                cellStyle={(_background: string, value: number, min: number, max: number, _data: string, _x: number, _y: number) => {
                                    const isSelectedCell = selectedCell?.x === _x && selectedCell?.y === _y
                                    const normalizedValue = getNormalizedValueForMinMax(value, min, max);
                                    const safeNormalizedValue = Math.min(Math.max(normalizedValue, 0), 1);

                                    const commonStyles = {
                                        fontSize: "0.6875rem",
                                        minWidth: '2rem',
                                        height: '2rem',
                                        borderRadius: '0.25rem',
                                        margin: '0.125rem',
                                        borderStyle: 'solid',
                                        borderWidth: '0.0625rem',
                                        borderColor: 1 - (max - value) / (max - min) <= 0.1 ? gray100A : 'rgba(255, 255, 255, 0.2)',
                                    }
                                    if (secondary) { // to show another heatmap, can be changed when data is added
                                        return {
                                            ...commonStyles,
                                            borderColor: gray100A,
                                            background: getCellBgColorFromPhenotype(
                                                safeNormalizedValue,
                                                _x,
                                                _y
                                            )
                                        }
                                    } else {
                                        return {
                                            ...commonStyles,
                                            borderWidth: isSelectedCell ? '0.125rem' : '0.0625rem',
                                            borderColor: isSelectedCell ? '#8300BF' : 1 - (max - value) / (max - min) <= 0.1 ? gray100A : 'rgba(255, 255, 255, 0.2)',
                                            background: `rgba(131, 0, 191, ${safeNormalizedValue})`,
                                        }
                                    }


                                }}
                                cellRender={(value: number, x: number, y: number) => (
                                    <>
                                        <HeatmapTooltip
                                            value={value} x={x} y={y}
                                            secondary={secondary} getCellBgColor={() => 'rgba(0,0,0,0)'}
                                        />
                                    </>
                                )}
                            />
                        )}
                    <CollapsibleList list={yAxis} onItemClick={handleCollapseClick} />

                </Box>
            </Box>

        </Box>
    )
};

export default HeatmapGrid;