import React, {FC, useMemo, useState} from "react";
import {Box, Typography} from "@mui/material";
import {vars} from "../../theme/variables";
import CollapsibleList from "./CollapsibleList";
import HeatMap from "react-heatmap-grid";
import HeatmapTooltip from "./HeatmapTooltip";
import {getHeatmapData} from "../../services/heatmapService.ts";
import {HierarchicalItem} from "../ConnectivityGrid.tsx";

const {gray50, primaryPurple500, gray25, gray100A, gray500} = vars;


const generateYLabels = (list: HierarchicalItem[], prefix = ''): string[] => {
    let labels: string[] = [];
    list.forEach(item => {
        const fullLabel = prefix ? `${prefix} - ${item.label}` : item.label;
        labels.push(fullLabel);
        if (item.expanded && item.children.length > 0) {
            labels = labels.concat(generateYLabels(item.children, fullLabel));
        }
    });
    return labels;
};

interface HeatmapGridProps {
    connectionsMap: Map<string, number[]>;
    xAxis: string[];
    initialYAxis: HierarchicalItem[];
    onCellClick?: (x: string, y: string) => void;
    xAxisLabel?: string;
    yAxisLabels?: string;
    secondary?: boolean;
}

const getCellBgColor = (value: number) => {
    if (value % 4) {
        return '#2C2CCE'; // Blue for multiples of 4
    } else if (value % 6) {
        return '#DC6803'; // Orange for multiples of 6
    } else if (value % 8) {
        return '#EAAA08'; // Yellow for multiples of 8
    } else if (value > 10) {
        return 'linear-gradient(to right, #2C2CCE 50%, #9B18D8 50%)'; // Gradient for values greater than 10
    } else {
        return gray25// Default color
    }
};

const HeatmapGrid: FC<HeatmapGridProps> = ({
                                               secondary, xAxis, initialYAxis,
                                               xAxisLabel, yAxisLabels,
                                               onCellClick,
                                               connectionsMap
                                           }) => {

    const [yAxis, setYAxis] = useState<HierarchicalItem[]>(initialYAxis);
    const data = useMemo(() => {
        return getHeatmapData(yAxis, connectionsMap);
    }, [yAxis, connectionsMap]);
    const [selectedCell, setSelectedCell] = useState<{ x: number, y: number } | null>(null);


    const handleItemClick = (item: HierarchicalItem) => {
        const updateList = (list: HierarchicalItem[], selectedItem: HierarchicalItem): HierarchicalItem[] => {
            return list.map(listItem => {
                if (listItem.label === selectedItem.label) {
                    return {...listItem, expanded: !listItem.expanded};
                } else if (listItem.children) {
                    return {...listItem, children: updateList(listItem.children, selectedItem)};
                }
                return listItem;
            });
        };

        const updatedList = updateList(yAxis, item);
        setYAxis(updatedList);
    };

    const handleClick = (x: number, y: number): void => {
        setSelectedCell({x, y});
        if(onCellClick){
            console.log("To be implemented")
        }
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
                {yAxisLabels && (
                    <Typography sx={{
                        textAlign: 'center',
                        fontSize: '0.875rem',
                        marginTop: '4.875rem',
                        paddingRight: '0.75rem',
                        fontWeight: 400,
                        writingMode: 'vertical-lr',
                        lineHeight: 1,
                        color: gray500

                    }}>{yAxisLabels}</Typography>

                )}

                <Box width={1} position='relative' sx={{
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
                    <HeatMap
                        xLabels={xAxis}
                        yLabels={generateYLabels(yAxis)}
                        xLabelsLocation={"top"}
                        xLabelsVisibility={xAxis.map(() => true)}
                        xLabelWidth={160}
                        yLabelWidth={250}
                        data={data}
                        // squares
                        height={43}
                        onClick={(x: number, y: number) => handleClick(x, y)}
                        cellStyle={(_background: string, value: number, min: number, max: number, _data: string, _x: number, _y: number) => {
                            const isSelectedCell = selectedCell?.x === _x && selectedCell?.y === _y
                            const normalizedValue = (value - min) / (max - min);

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
                                    background: getCellBgColor(value),
                                }
                            } else {
                                return {
                                    ...commonStyles,
                                    borderWidth: isSelectedCell ? '0.125rem' : '0.0625rem',
                                    borderColor: isSelectedCell ? '#8300BF' : 1 - (max - value) / (max - min) <= 0.1 ? gray100A : 'rgba(255, 255, 255, 0.2)',
                                    background: `rgba(131, 0, 191, ${normalizedValue})`,
                                }
                            }


                        }}
                        cellRender={(value: number, x: number, y: number) => <HeatmapTooltip value={value} x={x} y={y}
                                                                                             secondary={secondary}
                                                                                             getCellBgColor={getCellBgColor}/>
                        }
                    />

                    <CollapsibleList list={yAxis} onItemClick={handleItemClick}/>

                </Box>
            </Box>

        </Box>
    )
};

export default HeatmapGrid;