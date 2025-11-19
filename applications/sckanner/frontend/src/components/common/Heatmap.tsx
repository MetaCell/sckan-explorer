import React, {
  FC,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useState,
} from 'react';
import {
  Box,
  Button,
  Typography,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { vars } from '../../theme/variables.ts';
import CollapsibleList from './CollapsibleList.tsx';
import HeatMap from 'react-heatmap-fork';
import HeatmapTooltip, { HeatmapTooltipRow } from './HeatmapTooltip.tsx';
import {
  HierarchicalItem,
  KsPerPhenotype,
  SynapticConnectionsData,
} from './Types.ts';
import { getNormalizedValueForMinMax } from '../../services/summaryHeatmapService.ts';
import {
  generateYLabelsAndIds,
  getPhenotypeColors,
} from '../../services/heatmapService.ts';
import { OTHER_PHENOTYPE_LABEL } from '../../settings.ts';
import { useDataContext } from '../../context/DataContext.ts';
import { useWidgetStateActions } from '../../hooks/useWidgetStateActions.ts';
import SynapticSVG from '../assets/svg/synaptic.svg?url';
import SynapticWhiteSVG from '../assets/svg/synapticWhite.svg?url';
import CompressSVG from '../assets/svg/compress.svg?url';
import ExpandSVG from '../assets/svg/expand.svg?url';

const { gray50, primaryPurple500, gray100A, gray500, gray600 } = vars;

interface HeatmapGridProps {
  xAxis: HierarchicalItem[];
  yAxis: HierarchicalItem[];
  setYAxis: (yAxis: HierarchicalItem[]) => void;
  setXAxis: (xAxis: HierarchicalItem[]) => void;
  onCellClick?: (x: number, y: number, yId: string) => void;
  xAxisLabel?: string;
  yAxisLabel?: string;
  selectedCell?: { x: number; y: number } | null;
  setSelectedCell: (cell: { x: number; y: number } | null) => void;
  heatmapData?: number[][];
  secondaryHeatmapData?: KsPerPhenotype[][];
  synapticConnections?: SynapticConnectionsData;
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

// Helper to flatten hierarchical X-axis into display labels and IDs
const generateXLabelsAndIds = (
  xAxis: HierarchicalItem[],
): { labels: string[]; ids: string[]; isParent: boolean[] } => {
  const labels: string[] = [];
  const ids: string[] = [];
  const isParent: boolean[] = [];

  xAxis.forEach((item) => {
    if (item.children && item.children.length > 0) {
      // This is a target system (parent)
      if (item.expanded) {
        // When expanded, only show children (parent label will be rendered above via overlay)
        item.children.forEach((child) => {
          labels.push(child.label);
          ids.push(child.id);
          isParent.push(false);
        });
      } else {
        // When collapsed, show parent as a single column
        labels.push(item.label);
        ids.push(item.id);
        isParent.push(true);
      }
    } else {
      // Orphan organ (no children)
      labels.push(item.label);
      ids.push(item.id);
      isParent.push(false);
    }
  });

  return { labels, ids, isParent };
};

const HeatmapGrid: FC<HeatmapGridProps> = ({
  xAxis,
  yAxis,
  setYAxis,
  setXAxis,
  xAxisLabel,
  yAxisLabel,
  onCellClick,
  selectedCell,
  setSelectedCell,
  heatmapData,
  secondaryHeatmapData,
  synapticConnections,
}) => {
  const { phenotypesColorMap, heatmapMode } = useDataContext();
  const { updateHeatmapExpandedState, updateSecondaryHeatmapExpandedState } =
    useWidgetStateActions();

  const heatmapContainerRef = useRef<HTMLDivElement>(null);
  const [xAxisHeight, setXAxisHeight] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const secondary = !!secondaryHeatmapData;
  const yAxisData = generateYLabelsAndIds(yAxis);
  const xAxisData = generateXLabelsAndIds(xAxis);

  const heatmapMatrixData = useMemo(() => {
    return secondary
      ? prepareSecondaryHeatmapData(secondaryHeatmapData)
      : heatmapData;
  }, [secondary, secondaryHeatmapData, heatmapData]);

  const xLabelToIndex = useMemo(() => {
    const lookup: { [key: string]: number } = {};
    xAxisData.labels.forEach((label, index) => {
      lookup[label] = index;
    });
    return lookup;
  }, [xAxisData.labels]);

  const yLabelToIndex = useMemo(() => {
    const lookup: { [key: string]: number } = {};
    yAxisData.labels.forEach((label, index) => {
      lookup[label] = index;
    });
    return lookup;
  }, [yAxisData.labels]);

  // Calculate X-axis height dynamically
  useEffect(() => {
    if (heatmapContainerRef.current) {
      const heatmapElement = heatmapContainerRef.current.querySelector(
        '& > div:first-of-type > div:first-of-type',
      );
      if (heatmapElement) {
        const height = heatmapElement.getBoundingClientRect().height;
        setXAxisHeight(height);
      }
    }
  }, [xAxis, yAxisData, heatmapMatrixData]);

  const getExpandedIds = useCallback((list: HierarchicalItem[]): string[] => {
    return list.reduce((acc, item) => {
      if (item.expanded) {
        acc.push(item.id);
      }
      if (item.children) {
        acc.push(...getExpandedIds(item.children));
      }
      return acc;
    }, [] as string[]);
  }, []);

  const updateWidgetExpandedState = useCallback(
    (expandedIds: string[]) => {
      if (secondary) {
        updateSecondaryHeatmapExpandedState(expandedIds);
      } else {
        updateHeatmapExpandedState(expandedIds);
      }
    },
    [
      updateHeatmapExpandedState,
      updateSecondaryHeatmapExpandedState,
      secondary,
    ],
  );

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

      const updatedList = updateList(yAxis, item);
      const expandedIds = getExpandedIds(updatedList);
      updateWidgetExpandedState(expandedIds);
      setSelectedCell(null);
      setYAxis(updatedList);
    },
    [
      yAxis,
      setYAxis,
      getExpandedIds,
      updateWidgetExpandedState,
      setSelectedCell,
    ],
  );

  const handleExpandAll = useCallback(() => {
    // Show loading overlay
    setIsLoading(true);

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
    // Expand Y-axis
    const updatedYList = updateList(yAxis);
    const expandedIds = getExpandedIds(updatedYList);
    updateWidgetExpandedState(expandedIds);
    setSelectedCell(null);
    setYAxis(updatedYList);

    // Expand X-axis target systems
    const updatedXList = updateList(xAxis);
    setXAxis(updatedXList);

    // Hide loading overlay after layout is complete
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [
    yAxis,
    xAxis,
    setYAxis,
    setXAxis,
    setSelectedCell,
    getExpandedIds,
    updateWidgetExpandedState,
  ]);

  const handleCompressAll = useCallback(() => {
    // Show loading overlay
    setIsLoading(true);

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
    // Compress Y-axis
    const updatedYList = updateList(yAxis);
    const expandedIds = getExpandedIds(updatedYList);
    updateWidgetExpandedState(expandedIds);
    setSelectedCell(null);
    setYAxis(updatedYList);

    // Compress X-axis target systems
    const updatedXList = updateList(xAxis);
    setXAxis(updatedXList);

    // Hide loading overlay after layout is complete
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [
    yAxis,
    xAxis,
    setYAxis,
    setXAxis,
    getExpandedIds,
    updateWidgetExpandedState,
    setSelectedCell,
  ]);

  // State to store horizontal parent label positions for expanded categories
  const [horizontalParents, setHorizontalParents] = useState<
    Array<{ label: string; left: number; width: number; categoryIndex: number }>
  >([]);

  // Add data attributes to X-axis labels and calculate horizontal parent positions
  useEffect(() => {
    // Check if X-axis has hierarchical items
    const hasHierarchy = xAxis.some(
      (item) => item.children && item.children.length > 0,
    );

    if (!hasHierarchy || !heatmapContainerRef.current) {
      setHorizontalParents([]);
      
      // Clear any leftover data attributes from previous datasnapshot
      if (heatmapContainerRef.current) {
        const xLabelsContainer = heatmapContainerRef.current.querySelector(
          '& > div:first-of-type > div:first-of-type',
        );
        if (xLabelsContainer) {
          const labelElements = Array.from(
            xLabelsContainer.querySelectorAll('& > div'),
          ) as HTMLElement[];
          
          // Clear attributes from all X-axis labels
          labelElements.slice(1).forEach((element) => {
            element.removeAttribute('data-x-label-index');
            element.removeAttribute('data-is-child');
            element.removeAttribute('data-is-collapsed');
          });
        }
      }
      
      return;
    }

    // Wait for DOM to render
    setTimeout(() => {
      const container = heatmapContainerRef.current;
      if (!container) return;

      const xLabelsContainer = container.querySelector(
        '& > div:first-of-type > div:first-of-type',
      );
      if (!xLabelsContainer) return;

      const labelElements = Array.from(
        xLabelsContainer.querySelectorAll('& > div'),
      ) as HTMLElement[];

      // Skip first element (Y-axis label area)
      const xLabelElements = labelElements.slice(1);

      // Set data attributes for styling
      let currentIndex = 0;
      for (let i = 0; i < xAxis.length; i++) {
        const category = xAxis[i];
        const hasChildren = category.children && category.children.length > 0;

        if (category.expanded && hasChildren) {
          // Mark children
          for (let j = 0; j < category.children.length; j++) {
            const element = xLabelElements[currentIndex + j];
            if (element) {
              element.setAttribute(
                'data-x-label-index',
                String(currentIndex + j),
              );
              element.setAttribute('data-is-child', 'true');
              element.setAttribute('data-is-collapsed', 'false');
            }
          }
          currentIndex += category.children.length;
        } else if (hasChildren) {
          // Mark collapsed parent
          const element = xLabelElements[currentIndex];
          if (element) {
            element.setAttribute('data-x-label-index', String(currentIndex));
            element.setAttribute('data-is-child', 'false');
            element.setAttribute('data-is-collapsed', 'true');
          }
          currentIndex += 1;
        } else {
          // Mark orphan organ
          const element = xLabelElements[currentIndex];
          if (element) {
            element.setAttribute('data-x-label-index', String(currentIndex));
            element.setAttribute('data-is-child', 'false');
            element.setAttribute('data-is-collapsed', 'false');
          }
          currentIndex += 1;
        }
      }

      // Calculate horizontal parent positions for expanded categories
      const newHorizontalParents: Array<{
        label: string;
        left: number;
        width: number;
        categoryIndex: number;
      }> = [];

      currentIndex = 0;
      for (let i = 0; i < xAxis.length; i++) {
        const category = xAxis[i];
        const hasChildren = category.children && category.children.length > 0;

        if (category.expanded && hasChildren) {
          const firstChildElement = xLabelElements[currentIndex];
          const lastChildElement =
            xLabelElements[currentIndex + category.children.length - 1];

          if (firstChildElement && lastChildElement) {
            const containerRect = xLabelsContainer.getBoundingClientRect();
            const firstRect = firstChildElement.getBoundingClientRect();
            const lastRect = lastChildElement.getBoundingClientRect();

            const leftOffset = firstRect.left - containerRect.left;
            const totalWidth = lastRect.right - firstRect.left;

            newHorizontalParents.push({
              label: category.label,
              left: leftOffset,
              width: totalWidth,
              categoryIndex: i,
            });
          }

          currentIndex += category.children.length;
        } else {
          currentIndex += 1;
        }
      }

      setHorizontalParents(newHorizontalParents);
    }, 50);
  }, [xAxis]);

  // Add click handler for X-axis labels
  useEffect(() => {
    // Check if X-axis has hierarchical items
    const hasHierarchy = xAxis.some(
      (item) => item.children && item.children.length > 0,
    );

    if (!hasHierarchy || !heatmapContainerRef.current) return;

    const handleLabelClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Don't handle clicks on horizontal parent labels
      if (target.closest('[data-horizontal-parent]')) {
        return;
      }

      const labelElement = target.closest(
        '[data-x-label-index]',
      ) as HTMLElement;
      if (!labelElement) return;

      const labelIndex = parseInt(
        labelElement.getAttribute('data-x-label-index') || '-1',
        10,
      );
      if (labelIndex === -1) return;

      // Find which category this label belongs to
      let currentIndex = 0;
      for (let i = 0; i < xAxis.length; i++) {
        const category = xAxis[i];
        const hasChildren = category.children && category.children.length > 0;

        if (category.expanded && hasChildren) {
          // If expanded, check if clicking on children (which shouldn't do anything)
          if (
            currentIndex <= labelIndex &&
            labelIndex < currentIndex + category.children.length
          ) {
            return; // Child labels are not clickable for expand/collapse
          }
          currentIndex += category.children.length;
        } else if (hasChildren) {
          // If collapsed, this single label represents the parent
          if (currentIndex === labelIndex) {
            // Expand it
            const updatedList = xAxis.map((item, idx) =>
              idx === i ? { ...item, expanded: true } : item,
            );
            setSelectedCell(null);
            setXAxis(updatedList);
            return;
          }
          currentIndex += 1;
        } else {
          // Orphan organ
          currentIndex += 1;
        }
      }
    };

    const xLabelsContainer = heatmapContainerRef.current.querySelector(
      '& > div:first-of-type > div:first-of-type',
    );

    if (xLabelsContainer) {
      xLabelsContainer.addEventListener(
        'click',
        handleLabelClick as EventListener,
      );
    }

    return () => {
      if (xLabelsContainer) {
        xLabelsContainer.removeEventListener(
          'click',
          handleLabelClick as EventListener,
        );
      }
    };
  }, [xAxis, setXAxis, setSelectedCell]);

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
        {/* Tree hierarchy controls positioned in top-left empty cell */}
        <Box
          position="absolute"
          top={`${xAxisHeight - 50}px`}
          left="1.5rem"
          zIndex={10}
          width="15.625rem"
          height="2.6875rem"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            padding: '0.5rem',
          }}
        >
          <Typography
            variant="caption"
            color={gray600}
            sx={{
              fontSize: '0.975rem',
              fontWeight: 800,
            }}
          >
            Tree hierarchy
          </Typography>
          <Box display="flex" gap="0.25rem">
            <Tooltip
              title="Expand all"
              arrow
              slotProps={{
                tooltip: {
                  sx: {
                    backgroundColor: '#333',
                    color: '#fff',
                    fontSize: '0.75rem',
                  },
                },
              }}
            >
              <Button
                onClick={() => handleExpandAll()}
                sx={{
                  width: '2rem',
                  height: '2rem',
                  minWidth: '1.5rem',
                  padding: 0,
                  border: 'none',
                  background: 'transparent',
                  backgroundImage: `url(${ExpandSVG})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  backgroundSize: '1rem 1rem',
                  filter:
                    'brightness(0) saturate(100%) invert(47%) sepia(10%) saturate(373%) hue-rotate(202deg) brightness(97%) contrast(87%)',
                }}
              />
            </Tooltip>
            <Tooltip
              title="Compress all"
              arrow
              slotProps={{
                tooltip: {
                  sx: {
                    backgroundColor: '#333',
                    color: '#fff',
                    fontSize: '0.75rem',
                  },
                },
              }}
            >
              <Button
                onClick={() => handleCompressAll()}
                sx={{
                  width: '2rem',
                  height: '2rem',
                  minWidth: '1.5rem',
                  padding: 0,
                  border: 'none',
                  background: 'transparent',
                  backgroundImage: `url(${CompressSVG})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  backgroundSize: '1rem 1rem',
                  filter:
                    'brightness(0) saturate(100%) invert(47%) sepia(10%) saturate(373%) hue-rotate(202deg) brightness(97%) contrast(87%)',
                }}
              />
            </Tooltip>
          </Box>
        </Box>
        <Box
          width={1}
          position="relative"
          ref={heatmapContainerRef}
          sx={{
            '& > div:first-of-type': {
              position: 'relative',
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
                  cursor: 'pointer',

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

                  // Child labels with reduced top padding to make room for horizontal parent
                  '&[data-is-child="true"]': {
                    paddingTop: '0.25rem',
                    marginTop: '1.5rem',
                    cursor: 'default',
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
                  },

                  // Collapsed parent labels with plus icon
                  '&[data-is-collapsed="true"]': {
                    paddingTop: '2.5rem', // Make room for the plus icon at the top
                    '&:after': {
                      content: '"+"', // Plus sign for collapsed
                      position: 'absolute',
                      top: '0.75rem',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontWeight: 'bold',
                      color: primaryPurple500,
                      fontSize: '1rem',
                      writingMode: 'horizontal-tb',
                    },
                  },

                  '&:first-of-type': {
                    marginLeft: 0,
                    width: '15.625rem',
                    flex: 'none !important',
                    cursor: 'default',
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
            xAxisData &&
            heatmapMatrixData &&
            heatmapMatrixData.length > 0 &&
            heatmapMatrixData[0].length > 0 && (
              <HeatMap
                xLabels={xAxisData.labels}
                yLabels={yAxisData.labels}
                xLabelsLocation={'top'}
                xLabelsVisibility={xAxisData.labels?.map(() => true)}
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
                      backgroundSize: '100% 100% !important',
                      background: getCellBgColorFromPhenotype(
                        safeNormalizedValue,
                        _x,
                        _y,
                      ),
                    };
                  } else if (
                    heatmapMode === 'synaptic' &&
                    synapticConnections
                  ) {
                    const directConnections =
                      synapticConnections[_y].directConnections[_x];
                    const synapticValue =
                      synapticConnections[_y].synapticConnections[_x];
                    return {
                      ...commonStyles,
                      background:
                        directConnections.length > 0
                          ? '#8300BF'
                          : 'transparent',
                      backgroundImage:
                        synapticValue.length > 0 &&
                        directConnections.length === 0
                          ? `url(${SynapticSVG})`
                          : synapticValue.length > 0 &&
                              directConnections.length > 0
                            ? `url(${SynapticWhiteSVG})`
                            : undefined,
                      // backgroundSize: '60% 60%',
                      borderColor:
                        synapticValue.length > 0 || directConnections.length > 0
                          ? '#edeff2'
                          : 'transparent',
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
          {/* Horizontal parent labels overlay for expanded categories */}
          {horizontalParents.length > 0 && (
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              height={`${xAxisHeight}px`}
              zIndex={15}
              sx={{
                pointerEvents: 'none',
              }}
            >
              {horizontalParents.map((parent) => (
                <Tooltip
                  key={`${parent.categoryIndex}-${parent.label}`}
                  title={parent.label}
                  arrow
                  enterDelay={1500}
                  slotProps={{
                    tooltip: {
                      sx: {
                        backgroundColor: '#333',
                        color: '#fff',
                        fontSize: '0.75rem',
                      },
                    },
                  }}
                >
                  <Box
                    data-horizontal-parent="true"
                    onClick={() => {
                      // Collapse the category
                      const updatedList = xAxis.map((item, idx) =>
                        idx === parent.categoryIndex
                          ? { ...item, expanded: false }
                          : item,
                      );
                      setSelectedCell(null);
                      setXAxis(updatedList);
                    }}
                    sx={{
                      position: 'absolute',
                      left: `${parent.left}px`,
                      width: `${parent.width}px`,
                      backgroundColor: gray50,
                      borderBottom: `1px solid ${primaryPurple500}`,
                      borderRadius: '0.25rem 0.25rem 0 0',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      cursor: 'pointer',
                      pointerEvents: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '&:hover': {
                        backgroundColor: primaryPurple500,
                        color: 'white',
                      },
                      '&:after': {
                        content: '"−"',
                        marginLeft: '0.5rem',
                        fontWeight: 'bold',
                        color: 'currentColor',
                        flexShrink: 0,
                      },
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {parent.label}
                    </Box>
                  </Box>
                </Tooltip>
              ))}
            </Box>
          )}
          {/* Loading overlay for expand/compress all operations */}
          {isLoading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
              }}
            >
              <CircularProgress size={90} sx={{ color: primaryPurple500 }} />
            </Box>
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
