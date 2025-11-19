import {
  Box,
  Button,
  Divider,
  Typography,
  // Switch,
  // FormControlLabel,
} from '@mui/material';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import { vars } from '../theme/variables.ts';
import HeatmapGrid from './common/Heatmap.tsx';
import { useDataContext } from '../context/DataContext.ts';
import { useWidgetStateActions } from '../hooks/useWidgetStateActions.ts';
import {
  calculateConnections,
  getXAxisOrgans,
  getHierarchicalXAxis,
  getYAxis,
  getHeatmapData,
  getKnowledgeStatementMap,
  filterConnectionsMap,
  getNonEmptyColumns,
  filterYAxis,
  filterKnowledgeStatements,
  assignExpandedState,
  getMinMaxKnowledgeStatements,
} from '../services/heatmapService.ts';
import FiltersDropdowns from './FiltersDropdowns.tsx';
import {
  DetailedHeatmapData,
  HierarchicalItem,
  HeatmapMode,
} from './common/Types.ts';
import { Organ, BaseEntity } from '../models/explorer.ts';
import LoaderSpinner from './common/LoaderSpinner.tsx';
import { extractEndOrganFiltersFromEntities } from '../services/summaryHeatmapService.ts';
import { COORDINATE_SEPARATOR } from '../utils/urlStateManager.ts';
import SynapticSVG from './assets/svg/synaptic.svg?url';
import SynapticWhiteSVG from './assets/svg/synapticWhite.svg?url';
import endorgansOrder from '../data/endorgansOrder.json';

const { gray500, white: white, gray25, gray100, gray400, gray600A } = vars;

function ConnectivityGrid() {
  const {
    hierarchicalNodes,
    organs,
    targetSystems,
    targetSystemNames,
    knowledgeStatements,
    filters,
    setFilters,
    setSelectedConnectionSummary,
    widgetState,
    heatmapMode,
    // switchHeatmapMode,
  } = useDataContext();

  const { updateConnectivityGridCellClick, resetAllWidgetState } =
    useWidgetStateActions();

  const organizedFilters = useMemo(
    () => extractEndOrganFiltersFromEntities(filters, organs),
    [filters, organs],
  );
  const [xAxisOrgans, setXAxisOrgans] = useState<Organ[]>([]);
  const [filteredXOrgans, setFilteredXOrgans] = useState<Organ[]>([]);
  const [xAxis, setXAxis] = useState<HierarchicalItem[]>([]);
  const [filteredXAxis, setFilteredXAxis] = useState<HierarchicalItem[]>([]);
  const [initialYAxis, setInitialYAxis] = useState<HierarchicalItem[]>([]);

  const [yAxis, setYAxis] = useState<HierarchicalItem[]>([]);
  const [filteredYAxis, setFilteredYAxis] = useState<HierarchicalItem[]>([]);
  // Maps YaxisId -> KnowledgeStatementIds for each Organ
  const [connectionsMap, setConnectionsMap] = useState<
    Map<string, Array<string>[]>
  >(new Map());

  const [filteredConnectionsMap, setFilteredConnectionsMap] = useState<
    Map<string, Array<string>[]>
  >(new Map());

  const [selectedCell, setSelectedCell] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const prevHeatmapModeRef = useRef<HeatmapMode>(heatmapMode);

  useEffect(() => {
    const connections = calculateConnections(
      hierarchicalNodes,
      organs,
      knowledgeStatements,
      organizedFilters,
    );
    setConnectionsMap(connections);
  }, [hierarchicalNodes, organs, knowledgeStatements, organizedFilters]);

  const { min, max } = useMemo(() => {
    return getMinMaxKnowledgeStatements(filteredConnectionsMap);
  }, [filteredConnectionsMap]);

  useEffect(() => {
    const organList = getXAxisOrgans(organs);
    setXAxisOrgans(organList);

    // Build hierarchical X-axis
    const hierarchicalX = getHierarchicalXAxis(
      targetSystems,
      organs,
      endorgansOrder,
      targetSystemNames,
    );
    setXAxis(hierarchicalX);
  }, [organs, targetSystems, targetSystemNames]);

  // Helper function to apply expand/collapse state to fresh yAxis
  const applyExpandedState = (
    freshYAxis: HierarchicalItem[],
    existingYAxis: HierarchicalItem[],
  ): HierarchicalItem[] => {
    const expandedStateMap = new Map<string, boolean>();

    const collectExpandedState = (items: HierarchicalItem[]) => {
      items.forEach((item) => {
        expandedStateMap.set(item.id, item.expanded);
        if (item.children) {
          collectExpandedState(item.children);
        }
      });
    };

    const applyExpandedStateRecursive = (
      items: HierarchicalItem[],
    ): HierarchicalItem[] => {
      return items.map((item) => ({
        ...item,
        expanded: expandedStateMap.has(item.id)
          ? expandedStateMap.get(item.id)!
          : item.expanded,
        children: item.children
          ? applyExpandedStateRecursive(item.children)
          : item.children,
      }));
    };

    // Collect the expanded state from existing yAxis
    collectExpandedState(existingYAxis);
    // Apply the expanded state to fresh yAxis
    return applyExpandedStateRecursive(freshYAxis);
  };

  useEffect(() => {
    const freshYAxis = getYAxis(hierarchicalNodes);

    // If yAxis already exists (meaning this is a filter change, not initial load)
    // preserve the expand/collapse state
    if (yAxis.length > 0) {
      const yAxisWithPreservedState = applyExpandedState(freshYAxis, yAxis);
      setYAxis(yAxisWithPreservedState);
    } else {
      // Initial load
      setYAxis(freshYAxis);
      setInitialYAxis(freshYAxis);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hierarchicalNodes, organizedFilters]); // Add organizedFilters as dependency

  useEffect(() => {
    const freshYAxis = getYAxis(hierarchicalNodes);
    if (
      widgetState.heatmapExpandedState &&
      widgetState.heatmapExpandedState.length > 0 &&
      yAxis.length === 0
    ) {
      const yAxisWithExpandedState = assignExpandedState(
        freshYAxis,
        widgetState.heatmapExpandedState,
      );
      const yAxisWithExpandedStateApplied = applyExpandedState(
        freshYAxis,
        yAxisWithExpandedState,
      );
      setYAxis(yAxisWithExpandedStateApplied);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetState.heatmapExpandedState, hierarchicalNodes]);

  useEffect(() => {
    if (connectionsMap.size > 0 && yAxis.length > 0 && xAxis.length > 0) {
      // Apply filtering logic
      const filteredYAxis = filterYAxis<Array<string>>(yAxis, connectionsMap);
      const columnsWithData = getNonEmptyColumns(filteredYAxis, connectionsMap);
      const filteredConnectionsMap = filterConnectionsMap(
        filteredYAxis,
        connectionsMap,
        columnsWithData,
      );
      const filteredOrgans = xAxisOrgans.filter((_, index) =>
        columnsWithData.has(index),
      );

      // Check if end organ filter is active
      const hasEndOrganFilter = filters.EndOrgan.length > 0;

      let filteredHierarchicalX: HierarchicalItem[];

      if (hasEndOrganFilter) {
        // When end organ filter is set, use flat list of organs (no target systems)
        filteredHierarchicalX = filteredOrgans.map((organ) => ({
          id: organ.id,
          label: organ.name,
          children: [],
          expanded: false,
        }));
      } else {
        // Normal hierarchical behavior with target systems
        const filteredOrganIds = new Set(filteredOrgans.map((o) => o.id));
        filteredHierarchicalX = xAxis
          .map((item) => {
            if (item.children && item.children.length > 0) {
              // Filter children to only include those with data
              const filteredChildren = item.children.filter((child) =>
                filteredOrganIds.has(child.id),
              );
              // Only include parent if it has children with data
              if (filteredChildren.length > 0) {
                return {
                  ...item,
                  children: filteredChildren,
                };
              }
              return null;
            } else {
              // Orphan organ - include if it has data
              return filteredOrganIds.has(item.id) ? item : null;
            }
          })
          .filter((item) => item !== null) as HierarchicalItem[];
      }

      setFilteredYAxis(filteredYAxis);
      setFilteredXOrgans(filteredOrgans);
      setFilteredXAxis(filteredHierarchicalX);
      setFilteredConnectionsMap(filteredConnectionsMap);
    }
  }, [yAxis, connectionsMap, xAxisOrgans, xAxis, filters.EndOrgan]);

  // Reset summary widget when heatmap mode changes
  useEffect(() => {
    if (prevHeatmapModeRef.current !== heatmapMode) {
      setSelectedCell(null);
      setSelectedConnectionSummary(null);
      // Also reset the widget state to ensure complete reset
      resetAllWidgetState();
      prevHeatmapModeRef.current = heatmapMode;
    }
  }, [heatmapMode, setSelectedConnectionSummary, resetAllWidgetState]);

  const {
    heatmapData,
    detailedHeatmapData,
    synapticConnections,
    synapticData,
  } = useMemo(() => {
    const filteredKSs = filterKnowledgeStatements(
      knowledgeStatements,
      hierarchicalNodes,
      organizedFilters,
      organs,
    );

    const heatmapData = getHeatmapData(
      filteredYAxis,
      filteredConnectionsMap,
      filteredKSs,
      filteredXOrgans,
      heatmapMode,
      filteredXAxis,
    );

    // TODO change the return based on the type of heatmapMode
    return {
      heatmapData: heatmapData.heatmapMatrix,
      detailedHeatmapData: heatmapData.detailedHeatmap,
      synapticConnections: heatmapData.synapticConnections,
      synapticData: heatmapData.synapticData,
    };
  }, [
    knowledgeStatements,
    hierarchicalNodes,
    organizedFilters,
    organs,
    filteredYAxis,
    filteredConnectionsMap,
    filteredXOrgans,
    heatmapMode,
    filteredXAxis,
  ]);

  const handleClick = useCallback(
    (
      x: number,
      y: number,
      yId: string,
      isConnectionView?: boolean,
      removeSummaryFilters: boolean = false,
    ): void => {
      // When the primary heatmap cell is clicked - this sets the react-context state for Connections in SummaryType.summary
      setSelectedCell({ x, y });
      if (heatmapMode === HeatmapMode.Default) {
        const row = filteredConnectionsMap.get(yId);
        if (row) {
          // Map visual X coordinate to actual organ index in filteredXOrgans
          // This accounts for collapsed target systems
          let actualOrganIndex = 0;
          let visualIndex = 0;

          for (let i = 0; i < filteredXAxis.length; i++) {
            const item = filteredXAxis[i];
            const hasChildren = item.children && item.children.length > 0;

            // Advance indices
            if (hasChildren) {
              if (item.expanded) {
                // Expanded: each child is a separate column
                if (visualIndex + item.children.length > x) {
                  // Click is within this target system's children
                  const childOffset = x - visualIndex;
                  actualOrganIndex = actualOrganIndex + childOffset;
                  break;
                }
                actualOrganIndex += item.children.length;
                visualIndex += item.children.length;
              } else {
                // Collapsed: single column for all children
                if (visualIndex === x) {
                  // Clicked on a collapsed target system
                  // Merge all knowledge statements from children organs
                  const allKsIds = new Set<string>();
                  const childOrgans: Organ[] = [];

                  item.children.forEach((child) => {
                    const childOrganIndex = filteredXOrgans.findIndex(
                      (o) => o.id === child.id,
                    );
                    if (childOrganIndex !== -1 && row[childOrganIndex]) {
                      row[childOrganIndex].forEach((ksId) =>
                        allKsIds.add(ksId),
                      );
                      childOrgans.push(filteredXOrgans[childOrganIndex]);
                    }
                  });

                  const ksMap = getKnowledgeStatementMap(
                    Array.from(allKsIds),
                    knowledgeStatements,
                  );
                  const nodeData = detailedHeatmapData[y];
                  const hierarchicalNode = hierarchicalNodes[nodeData.id];

                  const leftSideHeatmapCoordinates = `${x}${COORDINATE_SEPARATOR}${y}`;
                  updateConnectivityGridCellClick(
                    removeSummaryFilters,
                    isConnectionView ?? false,
                    leftSideHeatmapCoordinates,
                  );

                  // Create a target system representation with all children
                  const allChildren = new Map();
                  childOrgans.forEach((organ) => {
                    allChildren.set(organ.id, organ);
                    if (organ.children instanceof Map) {
                      organ.children.forEach((child) => {
                        allChildren.set(child.id, child);
                      });
                    }
                  });

                  setSelectedConnectionSummary({
                    connections: ksMap,
                    endOrgan: {
                      id: item.id,
                      name: item.label,
                      children: allChildren,
                      order: 0,
                    },
                    hierarchicalNode: hierarchicalNode,
                  });
                  return;
                }
                actualOrganIndex += item.children.length;
                visualIndex += 1;
              }
            } else {
              // Orphan organ
              if (visualIndex === x) {
                break;
              }
              actualOrganIndex += 1;
              visualIndex += 1;
            }
          }

          // Handle regular organ click
          const endOrgan = filteredXOrgans[actualOrganIndex];
          const nodeData = detailedHeatmapData[y];
          const hierarchicalNode = hierarchicalNodes[nodeData.id];
          const ksMap = getKnowledgeStatementMap(
            row[actualOrganIndex],
            knowledgeStatements,
          );

          const leftSideHeatmapCoordinates = `${x}${COORDINATE_SEPARATOR}${y}`;
          updateConnectivityGridCellClick(
            removeSummaryFilters,
            isConnectionView ?? false,
            leftSideHeatmapCoordinates,
          );

          setSelectedConnectionSummary({
            connections: ksMap,
            endOrgan: endOrgan,
            hierarchicalNode: hierarchicalNode,
          });
        }
      } else {
        // Synaptic mode - handle collapsed target systems similarly
        let actualOrganIndex = 0;
        let visualIndex = 0;
        let clickedItem: HierarchicalItem | null = null;

        for (let i = 0; i < filteredXAxis.length; i++) {
          const item = filteredXAxis[i];
          const hasChildren = item.children && item.children.length > 0;

          // Advance indices
          if (hasChildren) {
            if (item.expanded) {
              if (visualIndex + item.children.length > x) {
                const childOffset = x - visualIndex;
                actualOrganIndex = actualOrganIndex + childOffset;
                clickedItem = item.children[childOffset];
                break;
              }
              actualOrganIndex += item.children.length;
              visualIndex += item.children.length;
            } else {
              if (visualIndex === x) {
                clickedItem = item;
                break;
              }
              actualOrganIndex += item.children.length;
              visualIndex += 1;
            }
          } else {
            if (visualIndex === x) {
              clickedItem = item;
              break;
            }
            actualOrganIndex += 1;
            visualIndex += 1;
          }
        }

        const nodeData = detailedHeatmapData[y];
        const hierarchicalNode = hierarchicalNodes[nodeData.id];

        if (
          clickedItem &&
          clickedItem.children &&
          clickedItem.children.length > 0 &&
          !clickedItem.expanded
        ) {
          // Clicked on a collapsed target system in synaptic mode
          const allUris = new Set<string>();
          const childOrgans: Organ[] = [];

          clickedItem.children.forEach((child) => {
            const childOrganIndex = filteredXOrgans.findIndex(
              (o) => o.id === child.id,
            );
            if (childOrganIndex !== -1 && synapticConnections) {
              synapticConnections[y].synapticConnections[
                childOrganIndex
              ].forEach((path) => {
                path.forEach((uri) => allUris.add(uri));
              });
              synapticConnections[y].directConnections[childOrganIndex].forEach(
                (path) => {
                  allUris.add(path);
                },
              );
              childOrgans.push(filteredXOrgans[childOrganIndex]);
            }
          });

          const ksMap = getKnowledgeStatementMap(
            Array.from(allUris),
            knowledgeStatements,
          );

          const leftSideHeatmapCoordinates = `${x}${COORDINATE_SEPARATOR}${y}`;
          updateConnectivityGridCellClick(
            removeSummaryFilters,
            isConnectionView ?? false,
            leftSideHeatmapCoordinates,
          );

          // Create target system with all children
          const allChildren = new Map();
          childOrgans.forEach((organ) => {
            allChildren.set(organ.id, organ);
            if (organ.children instanceof Map) {
              organ.children.forEach((child: BaseEntity) => {
                allChildren.set(child.id, child);
              });
            }
          });

          setSelectedConnectionSummary({
            connections: ksMap,
            endOrgan: {
              id: clickedItem.id,
              name: clickedItem.label,
              children: allChildren,
              order: 0,
            },
            hierarchicalNode: hierarchicalNode,
          });
        } else {
          // Regular organ click in synaptic mode
          const endOrgan = filteredXOrgans[actualOrganIndex];
          const allChildren = new Map();
          filteredXOrgans.forEach((org) => {
            org.children.forEach((child: BaseEntity) => {
              allChildren.set(child.id, child);
            });
          });
          const endOrganWithChildren = {
            ...endOrgan,
            children: allChildren,
          };

          const allUris = new Set<string>();
          if (synapticConnections) {
            synapticConnections[y].synapticConnections[x].forEach((path) => {
              path.forEach((uri) => allUris.add(uri));
            });
            synapticConnections[y].directConnections[x].forEach((path) => {
              allUris.add(path);
            });
          }

          const ksMap = getKnowledgeStatementMap(
            Array.from(allUris),
            knowledgeStatements,
          );

          const leftSideHeatmapCoordinates = `${x}${COORDINATE_SEPARATOR}${y}`;
          updateConnectivityGridCellClick(
            removeSummaryFilters,
            isConnectionView ?? false,
            leftSideHeatmapCoordinates,
          );

          setSelectedConnectionSummary({
            connections: ksMap,
            endOrgan: endOrganWithChildren,
            hierarchicalNode: hierarchicalNode,
          });
        }
      }
    },
    [
      heatmapMode,
      filteredConnectionsMap,
      filteredXOrgans,
      filteredXAxis,
      detailedHeatmapData,
      hierarchicalNodes,
      knowledgeStatements,
      updateConnectivityGridCellClick,
      setSelectedConnectionSummary,
      synapticConnections,
    ],
  );

  const validateIfCoordinatesAreInBounds = (
    x: number,
    y: number,
    filteredXOrgans: Organ[],
    detailedHeatmapData: DetailedHeatmapData,
  ): boolean => {
    if (
      x >= 0 &&
      x < filteredXOrgans.length &&
      y >= 0 &&
      y < detailedHeatmapData.length
    ) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (
      widgetState.leftWidgetConnectionId &&
      filteredConnectionsMap.size > 0 &&
      detailedHeatmapData.length > 0 &&
      yAxis.length > 0
    ) {
      const [x, y] = widgetState.leftWidgetConnectionId
        .split(COORDINATE_SEPARATOR)
        .map(Number);

      if (
        validateIfCoordinatesAreInBounds(
          x,
          y,
          filteredXOrgans,
          detailedHeatmapData,
        )
      ) {
        const nodeData = detailedHeatmapData[y];
        const yId = nodeData.id;
        handleClick(x, y, yId, widgetState.view === 'connectionView');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    widgetState.leftWidgetConnectionId,
    filteredConnectionsMap,
    filteredXOrgans,
    detailedHeatmapData,
    yAxis,
  ]);

  // Custom handler for updating yAxis from the heatmap collapsible list
  const handleYAxisUpdate = (updatedFilteredYAxis: HierarchicalItem[]) => {
    // Apply the expand/collapse changes from the filtered yAxis back to the original yAxis
    setYAxis((currentYAxis) =>
      applyExpandedState(currentYAxis, updatedFilteredYAxis),
    );
  };

  // Custom handler for updating xAxis from the heatmap
  const handleXAxisUpdate = (updatedFilteredXAxis: HierarchicalItem[]) => {
    // Apply the expand/collapse changes from the filtered xAxis back to the original xAxis
    setXAxis((currentXAxis) =>
      applyExpandedState(currentXAxis, updatedFilteredXAxis),
    );
  };

  const handleReset = () => {
    setYAxis(initialYAxis);
    setFilters({
      Origin: [],
      EndOrgan: [],
      Species: [],
      Phenotype: [],
      apiNATOMY: [],
      Via: [],
      Entities: [],
    });
    setSelectedCell(null);
    setSelectedConnectionSummary(null);
    resetAllWidgetState();
  };

  const isLoading = yAxis.length == 0;

  const totalPopulationCount = useMemo(() => {
    // Count unique knowledge statements in the filtered connections map
    const uniqueKnowledgeStatements = new Set<string>();
    filteredConnectionsMap.forEach((connectionArray) => {
      connectionArray.forEach((column) => {
        column.forEach((ksId) => uniqueKnowledgeStatements.add(ksId));
      });
    });
    return uniqueKnowledgeStatements.size;
  }, [filteredConnectionsMap]);

  const checkIfAllFiltersAreEmpty = () => {
    return Object.values(organizedFilters).every((arr) => arr.length === 0);
  };

  // const handleHeatmapModeToggle = () => {
  //   // Reset summary widget before switching mode
  //   setSelectedCell(null);
  //   setSelectedConnectionSummary(null);
  //   resetAllWidgetState();

  //   // Switch the heatmap mode
  //   switchHeatmapMode();
  // };

  return isLoading ? (
    <LoaderSpinner />
  ) : (
    <Box
      minHeight="100%"
      // p={3}
      pb={0}
      fontSize={14}
      display="flex"
      flexDirection="column"
      width="fit-content"
      position="relative"
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        px={3}
        pt={3}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 400 }}>
            Connection Origin to End Organ
          </Typography>
          <Divider flexItem sx={{ borderWidth: '1px' }} />
          <Typography
            sx={{
              fontSize: '0.875rem',
              fontWeight: 500,
              lineHeight: '1.25rem',
              color: gray600A,
            }}
          >
            {checkIfAllFiltersAreEmpty()
              ? `${totalPopulationCount} populations`
              : `Filtered ${totalPopulationCount} populations`}
          </Typography>
        </Box>

        <Button
          sx={{
            position: 'sticky',
            right: '2rem',
            top: 0,
          }}
          variant="contained"
          onClick={handleReset}
        >
          Reset All
        </Button>
      </Box>

      <FiltersDropdowns
        filteredYAxis={filteredYAxis}
        filteredXOrgans={filteredXOrgans}
      />

      {/* Heatmap Mode Toggle */}
      {/* <Box
        px={3}
        py={2}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        borderBottom={`0.0625rem solid ${gray100}`}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 400,
              color: heatmapMode === HeatmapMode.Default ? gray600A : gray400,
            }}
          >
            Heatmap
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={heatmapMode === HeatmapMode.Synaptic}
                onChange={() => handleHeatmapModeToggle()}
                size="small"
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#8300BF',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#8300BF',
                  },
                }}
              />
            }
            label=""
            sx={{ margin: 0 }}
          />
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 400,
              color: heatmapMode === HeatmapMode.Synaptic ? gray600A : gray400,
            }}
          >
            Synaptic connections
          </Typography>
        </Box>
      </Box> */}

      <HeatmapGrid
        yAxis={filteredYAxis}
        setYAxis={handleYAxisUpdate}
        xAxis={filteredXAxis}
        setXAxis={handleXAxisUpdate}
        heatmapData={
          heatmapMode === HeatmapMode.Default ? heatmapData : synapticData
        }
        setSelectedCell={setSelectedCell}
        xAxisLabel={'End organ'}
        yAxisLabel={'Connection Origin'}
        onCellClick={(x, y, yId) => handleClick(x, y, yId, true, true)}
        selectedCell={selectedCell}
        synapticConnections={synapticConnections}
      />

      <Box
        p={1.5}
        borderTop={`0.0625rem solid ${gray100}`}
        width={1}
        display="flex"
        alignItems="center"
        justifyContent="start"
        sx={{
          background: white,
          position: 'sticky',
          bottom: 0,
          zIndex: 10,
        }}
      >
        {heatmapMode === HeatmapMode.Default ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              height: '1.875rem',
              padding: '0 0.75rem',
              borderRadius: '0.25rem',
              background: gray25,
              border: `0.0625rem solid ${gray100}`,
              gap: '0.75rem',
            }}
          >
            <Typography
              sx={{
                fontSize: '0.75rem',
                fontWeight: 500,
                lineHeight: '1.125rem',
                color: gray500,
              }}
            >
              Populations
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 400,
                  lineHeight: '1.125rem',
                  color: gray400,
                }}
              >
                {min}
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {[1, 2, 3, 4, 5, 6].reverse().map((el: number) => (
                  <Box
                    key={el}
                    sx={{
                      width: '1.5rem',
                      height: '1rem',
                      background: `rgba(131, 0, 191, ${1 - el / 6.5})`,
                    }}
                  />
                ))}
              </Box>

              <Typography
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 400,
                  lineHeight: '1.125rem',
                  color: gray400,
                }}
              >
                {max}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              height: '1.875rem',
              padding: '0 0.75rem',
              borderRadius: '0.25rem',
              background: gray25,
              border: `0.0625rem solid ${gray100}`,
              gap: '1rem',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 400,
                  lineHeight: '1.125rem',
                  color: gray500,
                }}
              >
                Populations
              </Typography>
            </Box>
            {/* Direct connections */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Box
                sx={{
                  width: '1rem',
                  height: '1rem',
                  background: '#8300BF',
                  borderRadius: '0.125rem',
                }}
              />
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 400,
                  lineHeight: '1.125rem',
                  color: gray500,
                }}
              >
                Direct
              </Typography>
            </Box>

            {/* Synaptic connections */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Box
                sx={{
                  width: '1rem',
                  height: '1rem',
                  background: 'white',
                  border: `0.0625rem solid ${gray100}`,
                  borderRadius: '0.125rem',
                  backgroundImage: `url(${SynapticSVG})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  backgroundSize: '90% 90%',
                }}
              />
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 400,
                  lineHeight: '1.125rem',
                  color: gray500,
                }}
              >
                Synaptic
              </Typography>
            </Box>

            {/* Synaptic + Direct connections */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Box
                sx={{
                  width: '1rem',
                  height: '1rem',
                  background: '#8300BF',
                  borderRadius: '0.125rem',
                  backgroundImage: `url(${SynapticWhiteSVG})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  backgroundSize: '90% 90%',
                }}
              />
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 400,
                  lineHeight: '1.125rem',
                  color: gray500,
                }}
              >
                Synaptic + Direct
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default ConnectivityGrid;
