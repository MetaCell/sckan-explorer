import React, {
  FC,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useState,
} from 'react';
import { Box, Button, Typography, Tooltip } from '@mui/material';
import { vars } from '../../theme/variables.ts';
import CollapsibleList from './CollapsibleList.tsx';
import HeatMap from 'react-heatmap-fork';
import HeatmapTooltip, { HeatmapTooltipRow } from './HeatmapTooltip.tsx';
import {
  HierarchicalItem,
  HierarchicalXItem,
  KsPerPhenotype,
  SynapticConnectionsData,
} from './Types.ts';
import { getNormalizedValueForMinMax } from '../../services/summaryHeatmapService.ts';
import {
  generateYLabelsAndIds,
  generateXLabelsAndIds,
  getPhenotypeColors,
  reorganizeHeatmapDataForHierarchy,
  reorganizeSecondaryHeatmapDataForHierarchy,
  createHierarchicalToOriginalMapping,
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
  xAxis: string[];
  yAxis: HierarchicalItem[];
  setYAxis: (yAxis: HierarchicalItem[]) => void;
  xAxisHierarchy?: HierarchicalXItem[];
  setXAxisHierarchy?: (xAxis: HierarchicalXItem[]) => void;
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

const HeatmapGrid: FC<HeatmapGridProps> = ({
  xAxis,
  yAxis,
  setYAxis,
  xAxisHierarchy,
  setXAxisHierarchy,
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
  const [horizontalParents, setHorizontalParents] = useState<
    Array<{
      label: string;
      left: number;
      width: number;
      categoryIndex: number;
    }>
  >([]);

  const secondary = !!secondaryHeatmapData;
  const yAxisData = generateYLabelsAndIds(yAxis);

  // X-axis hierarchy support
  const isXAxisHierarchical = !!xAxisHierarchy;
  const xAxisData = useMemo(() => {
    return isXAxisHierarchical
      ? generateXLabelsAndIds(xAxisHierarchy)
      : {
          labels: xAxis,
          ids: xAxis,
          expanded: [],
          parentLabels: [],
          isChild: [],
        };
  }, [isXAxisHierarchical, xAxisHierarchy, xAxis]);

  const displayXAxis = isXAxisHierarchical ? xAxisData.labels : xAxis;

  // Create mapping from hierarchical X position to original organ index
  const hierarchicalToOriginalMapping = useMemo(() => {
    return isXAxisHierarchical && xAxisHierarchy
      ? createHierarchicalToOriginalMapping(xAxis, xAxisHierarchy)
      : [];
  }, [isXAxisHierarchical, xAxisHierarchy, xAxis]);

  const heatmapMatrixData = useMemo(() => {
    if (secondary) {
      let secondaryData = prepareSecondaryHeatmapData(secondaryHeatmapData);
      // If using X-axis hierarchy, reorganize the secondary data to match the hierarchical structure
      if (isXAxisHierarchical && xAxisHierarchy && secondaryHeatmapData) {
        const reorganizedSecondaryData =
          reorganizeSecondaryHeatmapDataForHierarchy(
            secondaryHeatmapData,
            xAxis,
            xAxisHierarchy,
          );
        secondaryData = prepareSecondaryHeatmapData(reorganizedSecondaryData);
      }
      return secondaryData;
    } else {
      let baseData = heatmapData;
      // If using X-axis hierarchy, reorganize the data to match the hierarchical structure
      if (isXAxisHierarchical && xAxisHierarchy && baseData) {
        baseData = reorganizeHeatmapDataForHierarchy(
          baseData,
          xAxis,
          xAxisHierarchy,
        );
      }
      return baseData;
    }
  }, [
    secondary,
    secondaryHeatmapData,
    heatmapData,
    isXAxisHierarchical,
    xAxisHierarchy,
    xAxis,
  ]);

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

  // X-axis hierarchy handlers
  const handleXAxisLabelClick = useCallback(
    (labelIndex: number) => {
      if (!setXAxisHierarchy || !xAxisHierarchy || !isXAxisHierarchical) return;

      // Find which category this label belongs to
      let currentIndex = 0;
      for (let i = 0; i < xAxisHierarchy.length; i++) {
        const category = xAxisHierarchy[i];
        if (category.expanded) {
          // When expanded: only children are in the label array
          if (
            currentIndex <= labelIndex &&
            labelIndex < currentIndex + category.children.length
          ) {
            // This is a child label, don't do anything (children are not clickable)
            return;
          }

          // Move past all children
          currentIndex += category.children.length;
        } else {
          // When collapsed: category takes one slot
          if (currentIndex === labelIndex) {
            // Toggle this category to expanded
            const updatedList = xAxisHierarchy.map((item, idx) =>
              idx === i ? { ...item, expanded: true } : item,
            );
            setSelectedCell(null);
            setXAxisHierarchy(updatedList);
            return;
          }
          currentIndex += 1;
        }
      }
    },
    [xAxisHierarchy, setXAxisHierarchy, setSelectedCell, isXAxisHierarchical],
  );

  // Add click event listeners to X-axis labels when hierarchical
  useEffect(() => {
    if (!isXAxisHierarchical || !heatmapContainerRef.current) return;

    const handleXLabelClick = (event: Event) => {
      const target = event.target as HTMLElement;

      // Check if click is on horizontal parent overlay
      if (target.closest('[data-horizontal-parent]')) {
        return; // Let the overlay handle it
      }

      const xLabelContainer = heatmapContainerRef.current?.querySelector(
        '& > div:first-of-type > div:first-of-type',
      );

      if (!xLabelContainer || !xLabelContainer.contains(target)) return;

      // Find the index of the clicked label
      const labelElements = Array.from(
        xLabelContainer.children,
      ) as HTMLElement[];

      const clickedIndex = labelElements.findIndex((el) => el.contains(target));

      // Skip the first element (empty cell) and adjust index
      if (clickedIndex > 0) {
        handleXAxisLabelClick(clickedIndex - 1);
      }
    };

    const container = heatmapContainerRef.current;
    container.addEventListener('click', handleXLabelClick);

    return () => {
      container.removeEventListener('click', handleXLabelClick);
    };
  }, [isXAxisHierarchical, handleXAxisLabelClick]);

  // Update X-axis label attributes for styling
  useEffect(() => {
    if (!isXAxisHierarchical || !heatmapContainerRef.current || !xAxisData) {
      return;
    }

    // Small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      const xLabelContainer = heatmapContainerRef.current?.querySelector(
        '& > div:first-of-type > div:first-of-type',
      );

      if (!xLabelContainer) return;

      const labelElements = Array.from(
        xLabelContainer.children,
      ) as HTMLElement[];

      // Clear horizontal parents first
      setHorizontalParents([]);

      // Skip the first element (empty cell)
      labelElements.slice(1).forEach((element, index) => {
        if (!xAxisData.labels[index]) return;

        const isChild = xAxisData.isChild[index];

        // Determine if this label should be clickable (only collapsed parents)
        const isClickable =
          !isChild &&
          xAxisHierarchy?.some(
            (item) =>
              item.label === xAxisData.labels[index] &&
              item.children.length > 0 &&
              !item.expanded,
          );

        // Set data attributes for styling
        element.setAttribute('data-clickable', isClickable ? 'true' : 'false');
        element.setAttribute('data-is-child', isChild ? 'true' : 'false');
        element.setAttribute(
          'data-is-collapsed',
          isClickable ? 'true' : 'false',
        );
      });

      // Calculate horizontal parent positions for expanded categories
      if (xAxisHierarchy) {
        let currentIndex = 0;

        xAxisHierarchy.forEach((category, categoryIndex) => {
          if (category.expanded && category.children.length > 0) {
            // Find the range of child elements
            const firstChildIndex = currentIndex;
            const lastChildIndex = currentIndex + category.children.length - 1;

            // Get child elements (skip first element which is empty cell)
            const firstChildElement = labelElements[firstChildIndex + 1];
            const lastChildElement = labelElements[lastChildIndex + 1];

            if (firstChildElement && lastChildElement) {
              setTimeout(() => {
                const firstChildRect =
                  firstChildElement.getBoundingClientRect();
                const lastChildRect = lastChildElement.getBoundingClientRect();
                const containerRect = xLabelContainer.getBoundingClientRect();

                // Calculate position to center over all children relative to the x-label container
                const leftOffset = firstChildRect.left - containerRect.left;
                const rightOffset = lastChildRect.right - containerRect.left;
                const totalWidth = rightOffset - leftOffset;

                setHorizontalParents((prev) => [
                  ...prev,
                  {
                    label: category.label,
                    left: leftOffset, // Remove offset since positioning is already relative
                    width: totalWidth,
                    categoryIndex,
                  },
                ]);
              }, 50);
            }

            currentIndex += category.children.length;
          } else {
            currentIndex += 1;
          }
        });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isXAxisHierarchical, xAxisData, xAxisHierarchy, displayXAxis]);

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
    // Expand Y-axis hierarchy
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
    const expandedIds = getExpandedIds(updatedList);
    updateWidgetExpandedState(expandedIds);
    setSelectedCell(null);
    setYAxis(updatedList);

    // Expand X-axis hierarchy
    if (setXAxisHierarchy && xAxisHierarchy) {
      const updatedXList = xAxisHierarchy.map((item) => ({
        ...item,
        expanded: true,
      }));
      setXAxisHierarchy(updatedXList);
    }
  }, [
    yAxis,
    setYAxis,
    setSelectedCell,
    getExpandedIds,
    updateWidgetExpandedState,
    xAxisHierarchy,
    setXAxisHierarchy,
  ]);

  const handleCompressAll = useCallback(() => {
    // Compress Y-axis hierarchy
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
    const expandedIds = getExpandedIds(updatedList);
    updateWidgetExpandedState(expandedIds);
    setSelectedCell(null);
    setYAxis(updatedList);

    // Compress X-axis hierarchy
    if (setXAxisHierarchy && xAxisHierarchy) {
      const updatedXList = xAxisHierarchy.map((item) => ({
        ...item,
        expanded: false,
      }));
      setXAxisHierarchy(updatedXList);
    }
  }, [
    yAxis,
    setYAxis,
    getExpandedIds,
    updateWidgetExpandedState,
    setSelectedCell,
    xAxisHierarchy,
    setXAxisHierarchy,
  ]);

  const handleCellClick = (x: number, y: number) => {
    if (yAxisData.expanded[y]) {
      return;
    }
    const ids = yAxisData.ids;
    if (onCellClick) {
      // Convert hierarchical X position to original organ index if using hierarchy
      let originalX = x;
      if (isXAxisHierarchical && hierarchicalToOriginalMapping.length > 0) {
        originalX = hierarchicalToOriginalMapping[x];
        // If it's a collapsed category (mapped to -1), don't handle the click
        if (originalX === -1) {
          return;
        }
      }
      onCellClick(originalX, y, ids[y]);
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
                  // Default cursor for non-hierarchical or non-clickable labels
                  cursor: 'default',

                  // Dynamic styling based on hierarchy state
                  ...(isXAxisHierarchical && {
                    '&[data-clickable="true"]': {
                      cursor: 'pointer',
                      '&:hover': {
                        background: gray50,
                        '&:before': {
                          content: '""',
                          width: '100%',
                          height: '0.0625rem',
                          background: primaryPurple500,
                          position: 'absolute',
                          bottom: '-0.25rem',
                          left: 0,
                        },
                      },
                    },
                    // Child labels with reduced top padding to make room for horizontal parent
                    '&[data-is-child="true"]': {
                      paddingTop: '0.25rem',
                      marginTop: '1.5rem',
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
                  }),

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
            heatmapMatrixData &&
            heatmapMatrixData.length > 0 &&
            heatmapMatrixData[0].length > 0 && (
              <HeatMap
                xLabels={displayXAxis}
                yLabels={yAxisData.labels}
                xLabelsLocation={'top'}
                xLabelsVisibility={displayXAxis?.map(() => true)}
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
          {/* Horizontal parent labels overlay */}
          {isXAxisHierarchical && horizontalParents.length > 0 && (
            <Box
              position="absolute"
              top="-2rem"
              left="0"
              zIndex={15}
              sx={{
                pointerEvents: 'none',
              }}
            >
              {horizontalParents.map((parent) => (
                <Box
                  key={`${parent.categoryIndex}-${parent.label}`}
                  data-horizontal-parent="true"
                  onClick={() => {
                    // Directly collapse the category
                    if (setXAxisHierarchy && xAxisHierarchy) {
                      const updatedList = xAxisHierarchy.map((item, idx) =>
                        idx === parent.categoryIndex
                          ? { ...item, expanded: false }
                          : item,
                      );
                      setSelectedCell(null);
                      setXAxisHierarchy(updatedList);
                    }
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
                    },
                  }}
                >
                  {parent.label}
                </Box>
              ))}
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
