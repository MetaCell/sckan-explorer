import React, { FC, useCallback, useMemo } from 'react';
import { Box, Button, ButtonGroup, Typography } from '@mui/material';
import { vars } from '../../theme/variables.ts';
import CollapsibleList from './CollapsibleList.tsx';
import HeatMap from 'react-heatmap-fork';
import HeatmapTooltip, { HeatmapTooltipRow } from './HeatmapTooltip.tsx';
import { HierarchicalItem, KsPerPhenotype } from './Types.ts';
import { getNormalizedValueForMinMax } from '../../services/summaryHeatmapService.ts';
import {
  generateYLabelsAndIds,
  getPhenotypeColors,
} from '../../services/heatmapService.ts';
import { OTHER_PHENOTYPE_LABEL } from '../../settings.ts';
import { useDataContext } from '../../context/DataContext.ts';

const { gray50, primaryPurple500, gray100A, gray500, primaryPurple600 } = vars;

interface HeatmapGridProps {
  xAxis: string[];
  yAxis: HierarchicalItem[];
  setYAxis: (yAxis: HierarchicalItem[]) => void;
  onCellClick?: (x: number, y: number, yId: string) => void;
  xAxisLabel?: string;
  yAxisLabel?: string;
  selectedCell?: { x: number; y: number } | null;
  heatmapData?: number[][];
  secondaryHeatmapData?: KsPerPhenotype[][];
}

const prepareSecondaryHeatmapData = (data?: KsPerPhenotype[][]): number[][] => {
  if (!data) return [];
  return data.map((row) =>
    row.map((cell) => {
      return Object.values(cell).reduce(
        (acc, phenotype) => acc + phenotype.ksIds.length,
        0,
      );
    }),
  );
};

const HeatmapGrid: FC<HeatmapGridProps> = ({
  xAxis,
  yAxis,
  setYAxis,
  xAxisLabel,
  yAxisLabel,
  onCellClick,
  selectedCell,
  setSelectedCell,
  heatmapData,
  secondaryHeatmapData,
}) => {
  const { phenotypesColorMap, widgetState, setWidgetState } = useDataContext();

  const secondary = !!secondaryHeatmapData;
  const yAxisData = generateYLabelsAndIds(yAxis);

  const heatmapMatrixData = useMemo(() => {
    return secondary
      ? prepareSecondaryHeatmapData(secondaryHeatmapData)
      : heatmapData;
  }, [secondary, secondaryHeatmapData, heatmapData]);

  const xLabelToIndex = useMemo(() => {
    const lookup: { [key: string]: number } = {};
    xAxis.forEach((label, index) => {
      lookup[label] = index;
    });
    return lookup;
  }, [xAxis]);

  const yLabelToIndex = useMemo(() => {
    const lookup: { [key: string]: number } = {};
    yAxisData.labels.forEach((label, index) => {
      lookup[label] = index;
    });
    return lookup;
  }, [yAxisData.labels]);


  const getExpandedIds = (list: HierarchicalItem[]): string[] => {
    return list.reduce((acc, item) => {
      if (item.expanded) {
        acc.push(item.id);
      }
      if (item.children) {
        acc.push(...getExpandedIds(item.children));
      }
      return acc;
    }, [] as string[]);
  };

  const handleCollapseClick = useCallback(
    (item: HierarchicalItem) => {
      const updateList = (
        list: HierarchicalItem[],
        selectedItem: HierarchicalItem,
      ): HierarchicalItem[] => {
        return list?.map((listItem) => {
          if (
            listItem.label === selectedItem.label &&
            listItem.children.length > 0
          ) {
            return { ...listItem, expanded: !listItem.expanded };
          } else if (listItem.children) {
            return {
              ...listItem,
              children: updateList(listItem.children, selectedItem),
            };
          }
          return listItem;
        });
      };

      const expandedIds = getExpandedIds(updateList(yAxis, item));
      if (secondary) {
        setWidgetState({
          ...widgetState,
          secondaryHeatmapExpandedState: expandedIds,
        });
      } else {
        setWidgetState({
          ...widgetState,
          heatmapExpandedState: expandedIds,
        });
      }
      setSelectedCell(null);
      const updatedList = updateList(yAxis, item);
      setYAxis(updatedList);
    },
    [yAxis, setYAxis],
  );

  const handleExpandAll = useCallback(() => {
    const updateList = (list: HierarchicalItem[]): HierarchicalItem[] => {
      return list?.map((listItem) => {
        if (listItem.children && listItem.children.length > 0) {
          return {
            ...listItem,
            expanded: true,
            children: updateList(listItem.children),
          };
        }
        return listItem;
      });
    };
    const updatedList = updateList(yAxis);
    setSelectedCell(null);
    const expandedIds = getExpandedIds(updateList(yAxis));
    if (secondary) {
      setWidgetState({
        ...widgetState,
        secondaryHeatmapExpandedState: expandedIds,
      });
    } else {
      setWidgetState({
        ...widgetState,
        heatmapExpandedState: expandedIds,
      });
    }

    setYAxis(updatedList);
  }, [yAxis, setYAxis]);

  const handleCompressAll = useCallback(() => {
    const updateList = (list: HierarchicalItem[]): HierarchicalItem[] => {
      return list?.map((listItem) => {
        if (listItem.children) {
          return {
            ...listItem,
            expanded: false,
            children: updateList(listItem.children),
          };
        } else if (listItem.expanded === false || listItem.expanded === true) {
          return { ...listItem, expanded: true };
        }
        return listItem;
      });
    };
    const updatedList = updateList(yAxis);
    setYAxis(updatedList);
  }, [yAxis, setYAxis]);

  const handleCellClick = (x: number, y: number) => {
    if (yAxisData.expanded[y]) {
      return;
    }
    const ids = yAxisData.ids;
    if (onCellClick) {
      onCellClick(x, y, ids[y]);
    }
  };

  const getCellBgColorFromPhenotype = (
    normalizedValue: number,
    _x: number,
    _y: number,
  ) => {
    // Gets the color for secondary heatmap cell based on the phenotypes
    if (
      secondary &&
      secondaryHeatmapData &&
      secondaryHeatmapData[_y] &&
      secondaryHeatmapData[_y][_x]
    ) {
      const heatmapCellPhenotypes = secondaryHeatmapData[_y][_x];
      const phenotypeColorsSet = new Set<string>();

      Object.keys(heatmapCellPhenotypes).forEach((phenotype) => {
        const phnColor = phenotypesColorMap[phenotype]?.color;
        if (phnColor) {
          phenotypeColorsSet.add(phnColor);
        } else {
          phenotypeColorsSet.add(
            phenotypesColorMap[OTHER_PHENOTYPE_LABEL].color,
          );
        }
      });

      const phenotypeColors = Array.from(phenotypeColorsSet);
      const phenotypeColor = getPhenotypeColors(
        normalizedValue,
        phenotypeColors,
      );
      return phenotypeColor
        ? phenotypeColor
        : `rgba(131, 0, 191, ${normalizedValue})`;
    }
    return `rgba(0, 0, 0, ${normalizedValue})`;
  };

  const getTooltipRows = (
    xIndex: number,
    yIndex: number,
  ): HeatmapTooltipRow[] => {
    if (
      secondary &&
      secondaryHeatmapData &&
      secondaryHeatmapData[yIndex] &&
      secondaryHeatmapData[yIndex][xIndex]
    ) {
      const heatmapCellPhenotypes = secondaryHeatmapData[yIndex][xIndex];

      return Object.keys(heatmapCellPhenotypes).map((phenotype) => ({
        color:
          phenotypesColorMap[phenotype]?.color ||
          phenotypesColorMap[OTHER_PHENOTYPE_LABEL].color,
        name: phenotype,
        count: heatmapCellPhenotypes[phenotype].ksIds.length,
      }));
    }
    return [];
  };

  return (
    <Box flex={1} my={3} display="inline-flex" flexDirection="column" px={3}>
      <Box display="flex" alignItems="center" gap={2}>
        <Typography variant="subtitle1" color={gray500}>
          Tree hierarchy:
        </Typography>
        <ButtonGroup
          variant="outlined"
          sx={{
            display: 'flex',
            '& .MuiButtonBase-root': {
              width: '4.5rem',
              height: '2rem',
              marginRight: '0.5rem',
              borderRadius: '0.25rem',
              border: `0.0625rem solid ${primaryPurple600}`,
              color: primaryPurple600,
            },
          }}
        >
          <Button onClick={() => handleExpandAll()}>Open All</Button>
          <Button onClick={() => handleCompressAll()}>Close All</Button>
        </ButtonGroup>
      </Box>

      <Box mb={1.5} pl="17.375rem">
        <Typography
          sx={{
            textAlign: 'center',
            fontSize: '0.875rem',
            fontWeight: 400,
            lineHeight: '1.25rem',
            minWidth: '4.0625rem',
            color: gray500,
          }}
        >
          {xAxisLabel}
        </Typography>
      </Box>
      <Box
        minWidth="fit-content"
        width="100%"
        display="flex"
        alignItems="center"
        position="relative"
        flexDirection="row-reverse"
      >
        <Box
          width={1}
          position="relative"
          sx={{
            '& > div:first-of-type': {
              '& > div:last-of-type': {
                '& > div': {
                  '& > div': {
                    '&:not(:first-of-type)': {
                      '&:hover': {
                        boxShadow:
                          '0rem 0.0625rem 0.125rem 0rem #1018280F, 0rem 0.0625rem 0.1875rem 0rem #1018281A',
                      },
                      '& > div': {
                        paddingTop: '0 !important',
                        height: '100%',

                        '& > div': {
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        },
                      },
                    },
                    '&:first-of-type': {
                      width: '15.625rem',
                      flex: 'none !important',
                      '& > div': {
                        opacity: 0,
                      },
                    },
                  },
                },
              },
              '& > div:first-of-type': {
                '& > div': {
                  writingMode: 'vertical-lr',
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginLeft: '0.125rem',
                  marginRight: '0.125rem',
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
                      left: 0,
                    },
                  },

                  '&:first-of-type': {
                    marginLeft: 0,
                    width: '15.625rem',
                    flex: 'none !important',
                    '&:hover': {
                      background: 'none',
                      '&:before': {
                        display: 'none',
                      },
                    },
                  },
                },
              },
            },
          }}
        >
          {yAxisData &&
            heatmapMatrixData &&
            heatmapMatrixData.length > 0 &&
            heatmapMatrixData[0].length > 0 && (
              <HeatMap
                xLabels={xAxis}
                yLabels={yAxisData.labels}
                xLabelsLocation={'top'}
                xLabelsVisibility={xAxis?.map(() => true)}
                xLabelWidth={100}
                yLabelWidth={100}
                data={heatmapMatrixData}
                // squares
                height={43}
                onClick={(x: number, y: number) => handleCellClick(x, y)}
                cellStyle={(
                  _background: string,
                  value: number,
                  min: number,
                  max: number,
                  _data: string,
                  _x: number,
                  _y: number,
                ) => {
                  const isSelectedCell =
                    selectedCell?.x === _x && selectedCell?.y === _y;
                  const normalizedValue = getNormalizedValueForMinMax(
                    value,
                    min,
                    max,
                  );
                  let safeNormalizedValue = Math.min(
                    Math.max(normalizedValue, 0),
                    1,
                  );

                  const commonStyles = {
                    fontSize: '0.6875rem',
                    minWidth: '2rem',
                    height: '2rem',
                    borderRadius: '0.25rem',
                    margin: '0.125rem',
                    borderStyle: 'solid',
                    borderWidth: '0.0625rem',
                    borderColor:
                      value > 0
                        ? 1 - (max - value) / (max - min) <= 0.1
                          ? gray100A
                          : 'rgba(255, 255, 255, 0.5)' // More visible border for cells with results
                        : 'rgba(255, 255, 255, 0.1)', // Very light border for empty cells
                  };
                  if (yAxisData.expanded[_y]) {
                    return {
                      ...commonStyles,
                      cursor: 'not-allowed',
                      opacity: 0,
                    };
                  } else if (secondary) {
                    // to show another heatmap, can be changed when data is added
                    return {
                      ...commonStyles,
                      borderColor: gray100A,
                      background: getCellBgColorFromPhenotype(
                        safeNormalizedValue,
                        _x,
                        _y,
                      ),
                    };
                  } else {
                    safeNormalizedValue =
                      safeNormalizedValue < 0.076 && safeNormalizedValue > 0
                        ? 0.076
                        : safeNormalizedValue;
                    return {
                      ...commonStyles,
                      borderWidth: isSelectedCell ? '0.125rem' : '0.0625rem',
                      borderColor: isSelectedCell
                        ? '#8300BF'
                        : value > 0
                          ? 1 - (max - value) / (max - min) <= 0.1
                            ? 'rgba(0, 0, 0, 0.2)'
                            : 'rgba(0, 0, 0, 0.2)' // More visible border for cells with results
                          : 'rgba(255, 255, 255, 0.8)', // Very light border for empty cells
                      background: `rgba(131, 0, 191, ${safeNormalizedValue})`,
                    };
                  }
                }}
                cellRender={(value: number, xLabel: string, yLabel: string) => {
                  const xIndex = xLabelToIndex[xLabel];
                  const yIndex = yLabelToIndex[yLabel];
                  return (
                    <HeatmapTooltip
                      x={xLabel}
                      y={yLabel}
                      connections={value}
                      rows={
                        secondary ? getTooltipRows(xIndex, yIndex) : undefined
                      }
                      yExpanded={yAxisData.expanded[yIndex]}
                    />
                  );
                }}
              />
            )}
        </Box>

        <CollapsibleList list={yAxis} onItemClick={handleCollapseClick} />
        {yAxisLabel && (
          <Typography
            sx={{
              textAlign: 'center',
              fontSize: '0.875rem',
              marginTop: '4.875rem',
              paddingRight: '0.75rem',
              fontWeight: 400,
              writingMode: 'vertical-lr',
              lineHeight: 1,
              color: gray500,
            }}
          >
            {yAxisLabel}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default HeatmapGrid;
