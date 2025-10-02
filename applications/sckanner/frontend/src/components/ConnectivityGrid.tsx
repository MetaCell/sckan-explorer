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
  getXAxisHierarchy,
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
  HierarchicalXItem,
  HeatmapMode,
  KsRecord,
} from './common/Types.ts';
import { Organ } from '../models/explorer.ts';
import LoaderSpinner from './common/LoaderSpinner.tsx';
import { extractEndOrganFiltersFromEntities } from '../services/summaryHeatmapService.ts';
import { COORDINATE_SEPARATOR } from '../utils/urlStateManager.ts';
import SynapticSVG from './assets/svg/synaptic.svg?url';
import SynapticWhiteSVG from './assets/svg/synapticWhite.svg?url';

const { gray500, white: white, gray25, gray100, gray400, gray600A } = vars;

function ConnectivityGrid() {
  const {
    hierarchicalNodes,
    organs,
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
  const [xAxisHierarchy, setXAxisHierarchy] = useState<HierarchicalXItem[]>([]);
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
    return getMinMaxKnowledgeStatements(connectionsMap);
  }, [connectionsMap]);

  useEffect(() => {
    const organList = getXAxisOrgans(organs);
    setXAxisOrgans(organList);

    // Initialize X-axis hierarchy
    const hierarchy = getXAxisHierarchy(organs);
    setXAxisHierarchy(hierarchy);
  }, [organs]);

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
    if (connectionsMap.size > 0 && yAxis.length > 0) {
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

      setFilteredYAxis(filteredYAxis);
      setFilteredXOrgans(filteredOrgans);
      setFilteredConnectionsMap(filteredConnectionsMap);
    }
  }, [yAxis, connectionsMap, xAxisOrgans]);

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
      
      // Check if this is a category click (collapsed X-axis hierarchy)
      const isCategoryClick = yId.includes(':category:');
      let actualYId = yId;
      let categoryLabel = '';
      
      console.log('handleClick debug:', {
        x,
        y,
        yId,
        isCategoryClick,
        heatmapMode,
        hasSynapticConnections: !!synapticConnections,
        synapticConnectionsLength: synapticConnections?.length || 0,
      });
      
      if (isCategoryClick) {
        const parts = yId.split(':category:');
        actualYId = parts[0];
        categoryLabel = parts[1];
        console.log('Category click detected:', {
          actualYId,
          categoryLabel,
          parts,
        });
      }
      
      if (heatmapMode === HeatmapMode.Default) {
        const row = filteredConnectionsMap.get(actualYId);
        if (row) {
          let endOrgan = filteredXOrgans[x];
          let ksMap: KsRecord;
          
          if (isCategoryClick) {
            // Handle category click - aggregate data from all organs in the category
            const category = xAxisHierarchy.find(
              (cat) => cat.label === categoryLabel,
            );
            if (category) {
              console.log('Category found, starting aggregation:', {
                categoryLabel,
                categoryChildrenCount: category.children.length,
                hasSynapticConnections: !!synapticConnections,
                yIndex: y,
              });
              // We need to find the original indices of organs in this category
              // The filteredConnectionsMap is organized by original organ order, not hierarchical order
              const categoryOrganIndices: number[] = [];
              
              // Find original organ indices for all children in this category
              category.children.forEach((child) => {
                // Find the index in the filtered organs array
                // The filteredConnectionsMap corresponds to filteredXOrgans, not xAxisOrgans
                const filteredIndex = filteredXOrgans.findIndex(
                  (organ) => organ.name === child.label,
                );
                if (filteredIndex !== -1) {
                  categoryOrganIndices.push(filteredIndex);
                }
              });
              
              // Aggregate knowledge statements from all organs in the category
              // Use the same approach as individual organ clicks to get complete data
              const allKsIds = new Set<string>();
              let totalBeforeDedup = 0;
              
              categoryOrganIndices.forEach((organIndex) => {
                if (synapticConnections && synapticConnections[y]) {
                  // Get all synaptic and direct connections for this organ
                  const synapticUris =
                    synapticConnections[y].synapticConnections[organIndex] ||
                    [];
                  const directUris =
                    synapticConnections[y].directConnections[organIndex] || [];
                  
                  // Add synaptic connection URIs
                  synapticUris.forEach((path) => {
                    path.forEach((uri) => {
                      allKsIds.add(uri);
                      totalBeforeDedup++;
                    });
                  });
                  
                  // Add direct connection URIs
                  directUris.forEach((uri) => {
                    allKsIds.add(uri);
                    totalBeforeDedup++;
                  });
                } else {
                  // Fallback to original method if synapticConnections not available
                  console.log(
                    'Fallback: using row[organIndex] method for organIndex:',
                    organIndex,
                  );
                  if (row && row[organIndex]) {
                    const organKsIds = row[organIndex];
                    totalBeforeDedup += organKsIds.length;
                    organKsIds.forEach((ksId) => allKsIds.add(ksId));
                  }
                }
              });
              
              console.log('Knowledge statement aggregation:', {
                totalBeforeDedup,
                totalAfterDedup: allKsIds.size,
                categoryLabel,
                organCount: categoryOrganIndices.length,
                aggregationMethod: synapticConnections
                  ? 'synapticConnections'
                  : 'row[organIndex]',
                categoryOrganIndices,
                hasSynapticConnections: !!synapticConnections,
              });
              
              // Only proceed if we have knowledge statements
              if (allKsIds.size === 0) {
                console.warn(
                  'No knowledge statements found for category:',
                  categoryLabel,
                );
                return;
              }
              
              // Create aggregated knowledge statement map
              ksMap = getKnowledgeStatementMap(
                Array.from(allKsIds),
                knowledgeStatements,
              );
              
              console.log('Final ksMap size:', Object.keys(ksMap).length);
              
              // Create a virtual end organ representing the category
              // Use the first organ in the category as the base to ensure filtering works correctly
              const firstOrganInCategory = category.children[0];
              const baseOrgan = filteredXOrgans.find(
                (organ) => organ.name === firstOrganInCategory.label,
              ) ||
                filteredXOrgans[0] || {
                  name: '',
                  id: '',
                  children: new Map(),
                  order: 0,
                };
              
              // Create children map with all organs in the category
              const categoryChildren = new Map();
              category.children.forEach((child) => {
                const organ = filteredXOrgans.find(
                  (organ) => organ.name === child.label,
                );
                if (organ) {
                  categoryChildren.set(organ.id, {
                    id: organ.id,
                    name: organ.name,
                  });
                }
              });
              
              endOrgan = {
                ...baseOrgan,
                name: categoryLabel,
                children: categoryChildren,
                // Mark this as a virtual category organ
                isVirtualCategory: true,
                // Keep the original organ's ID to ensure filtering works correctly
                // The name change will be visible in the UI
              };
              
              console.log('Created virtual category organ:', {
                categoryName: categoryLabel,
                childrenCount: categoryChildren.size,
                baseOrganId: baseOrgan.id,
                categoryChildrenIds: Array.from(categoryChildren.keys()),
                categoryChildrenSample: Array.from(
                  categoryChildren.entries(),
                ).slice(0, 3),
              });
            } else {
              ksMap = {};
              // Fallback virtual organ if category not found - use first organ to avoid filtering issues
              const fallbackOrgan = filteredXOrgans[0] || {
                name: '',
                id: '',
                children: new Map(),
                order: 0,
              };
              
              // Create empty children map for fallback
              const fallbackChildren = new Map();
              
              endOrgan = {
                ...fallbackOrgan,
                name: categoryLabel,
                children: fallbackChildren,
                isVirtualCategory: true,
              };
            }
          } else {
            // Normal single organ click
            ksMap = getKnowledgeStatementMap(row[x], knowledgeStatements);
          }
          
          const nodeData = detailedHeatmapData[y];
          const hierarchicalNode = hierarchicalNodes[nodeData.id];

          const leftSideHeatmapCoordinates = isCategoryClick
            ? `${x}${COORDINATE_SEPARATOR}${y}${COORDINATE_SEPARATOR}category${COORDINATE_SEPARATOR}${categoryLabel}`
            : `${x}${COORDINATE_SEPARATOR}${y}`;
          console.log('Setting coordinates and summary:', {
            x,
            y,
            leftSideHeatmapCoordinates,
            isCategoryClick,
            endOrganName: endOrgan.name,
            endOrganId: endOrgan.id,
            ksMapSize: Object.keys(ksMap).length,
          });
          
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
          
          console.log(
            'Summary set successfully - check filteredKnowledgeStatements in next update',
          );
        }
      } else {
        const endOrgan = filteredXOrgans[x];
        // synaptic connections might be developed over other destinations, so I will pass all the possible
        // destinations and then purge the empty columns in the connections component or the summaryheatmapservice
        const allChildren = new Map();
        filteredXOrgans.forEach((org) => {
          org.children.forEach((child) => {
            allChildren.set(child.id, child);
          });
        });
        const endOrganWithChildren = {
          ...endOrgan,
          children: allChildren,
        };
        const nodeData = detailedHeatmapData[y];
        const hierarchicalNode = hierarchicalNodes[nodeData.id];
        const allUris = new Set<string>();
        
        if (synapticConnections && synapticConnections[y]) {
          synapticConnections[y].synapticConnections[x].forEach((path) => {
            path.forEach((uri) => allUris.add(uri));
          });
          synapticConnections[y].directConnections[x].forEach((path) => {
            allUris.add(path);
          });
        } else {
          // Fallback: use filteredConnectionsMap data if synapticConnections not available
          console.log(
            'Individual organ fallback: using filteredConnectionsMap',
          );
          const row = filteredConnectionsMap.get(nodeData.id);
          if (row && row[x]) {
            row[x].forEach((ksId) => allUris.add(ksId));
            console.log('Individual organ fallback data:', {
              nodeDataId: nodeData.id,
              xIndex: x,
              rowExists: !!row,
              rowXExists: !!(row && row[x]),
              rowXLength: row && row[x] ? row[x].length : 0,
              allUrisSize: allUris.size,
            });
          } else {
            console.log('Individual organ fallback: no data found', {
              nodeDataId: nodeData.id,
              xIndex: x,
              rowExists: !!row,
              rowXExists: !!(row && row[x]),
            });
          }
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
    },
    [
      heatmapMode,
      filteredConnectionsMap,
      filteredXOrgans,
      detailedHeatmapData,
      hierarchicalNodes,
      knowledgeStatements,
      updateConnectivityGridCellClick,
      setSelectedConnectionSummary,
      synapticConnections,
      xAxisHierarchy,
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
      const parts =
        widgetState.leftWidgetConnectionId.split(COORDINATE_SEPARATOR);
      const [x, y] = parts.map(Number);
      
      // Check if this is a category coordinate
      const isCategoryCoordinate = parts.length > 2 && parts[2] === 'category';
      const categoryLabel = isCategoryCoordinate ? parts[3] : '';
      
      console.log('useEffect processing coordinates:', {
        parts,
        x,
        y,
        isCategoryCoordinate,
        categoryLabel,
      });
      
      if (
        validateIfCoordinatesAreInBounds(
          x,
          y,
          filteredXOrgans,
          detailedHeatmapData,
        )
      ) {
        const nodeData = detailedHeatmapData[y];
        const yId = isCategoryCoordinate
          ? `${nodeData.id}:category:${categoryLabel}`
          : nodeData.id;
          
        console.log('useEffect calling handleClick with:', {
          x,
          y,
          yId,
          isCategoryCoordinate,
        });
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
    const filteredStatements = filterKnowledgeStatements(
      knowledgeStatements,
      hierarchicalNodes,
      organizedFilters,
      organs,
    );
    return Object.keys(filteredStatements).length;
  }, [knowledgeStatements, hierarchicalNodes, organizedFilters, organs]);

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
        heatmapData={
          heatmapMode === HeatmapMode.Default ? heatmapData : synapticData
        }
        setSelectedCell={setSelectedCell}
        xAxis={filteredXOrgans.map((organ) => organ.name)}
        xAxisHierarchy={xAxisHierarchy}
        setXAxisHierarchy={setXAxisHierarchy}
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
