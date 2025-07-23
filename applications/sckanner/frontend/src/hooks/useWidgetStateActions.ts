import { useCallback } from 'react';
import { useDataContext } from '../context/DataContext';
import { WidgetState, Filters, SummaryFilters } from '../context/DataContext';
import { COORDINATE_SEPARATOR } from '../utils/urlStateManager';

interface UseWidgetStateActionsReturn {
  // Navigation actions
  goToConnectionView: (overrides?: Partial<WidgetState>) => void;
  goToDetailsView: (
    coords: string,
    page?: number,
    overrides?: Partial<WidgetState>,
  ) => void;
  goToConnectionDetailsView: (
    x: number,
    y: number,
    page?: number,
    overrides?: Partial<WidgetState>,
  ) => void;
  clearView: () => void;

  updateConnectionPageInWidgetState: (page: number) => void;

  // Filter management
  updateSummaryFilters: (filters: SummaryFilters | null) => void;
  clearAllFilters: () => void;

  updateFilterDropdownSelect: (newFilter: Filters) => void;
  updateConnectivityGridCellClick: (
    removeSummaryFilters: boolean,
    isConnectionView: boolean,
    leftSideHeatmapCoordinates: string,
  ) => void;

  // Heatmap state management
  updateHeatmapExpandedState: (expandedIds: string[] | null) => void;
  updateSecondaryHeatmapExpandedState: (expandedIds: string[] | null) => void;
  clearHeatmapStates: () => void;

  // Complete reset
  resetAllWidgetState: () => void;

  // Generic update for custom cases
  updateWidgetState: (updates: Partial<WidgetState>) => void;
}

export const useWidgetStateActions = (): UseWidgetStateActionsReturn => {
  const { widgetState, setWidgetState } = useDataContext();

  // Generic update function
  const updateWidgetState = useCallback(
    (updates: Partial<WidgetState>) => {
      setWidgetState({
        ...widgetState,
        ...updates,
      });
    },
    [widgetState, setWidgetState],
  );

  // Navigation actions
  const goToConnectionView = useCallback(
    (overrides: Partial<WidgetState> = {}) => {
      updateWidgetState({
        view: 'connectionView',
        ...overrides,
      });
    },
    [updateWidgetState],
  );

  const goToDetailsView = useCallback(
    (
      coords: string,
      page: number = 1,
      overrides: Partial<WidgetState> = {},
    ) => {
      updateWidgetState({
        view: 'connectionDetailsView',
        rightWidgetConnectionId: coords,
        connectionPage: page,
        ...overrides,
      });
    },
    [updateWidgetState],
  );

  const goToConnectionDetailsView = useCallback(
    (
      x: number,
      y: number,
      page: number = 1,
      overrides: Partial<WidgetState> = {},
    ) => {
      const coords = `${x}${COORDINATE_SEPARATOR}${y}`;
      goToDetailsView(coords, page, overrides);
    },
    [goToDetailsView],
  );

  const clearView = useCallback(() => {
    updateWidgetState({
      view: null,
      leftWidgetConnectionId: null,
      rightWidgetConnectionId: null,
    });
  }, [updateWidgetState]);

  const updateConnectionPageInWidgetState = useCallback(
    (page: number) => {
      updateWidgetState({
        connectionPage: page,
      });
    },
    [updateWidgetState],
  );

  const updateSummaryFilters = useCallback(
    (filters: SummaryFilters | null) => {
      if (widgetState.view === 'connectionDetailsView') {
        updateWidgetState({
          summaryFilters: filters,
        });
      } else {
        updateWidgetState({
          summaryFilters: filters,
          connectionPage: null,
          rightWidgetConnectionId: null,
        });
      }
    },
    [updateWidgetState, widgetState.view],
  );

  const updateConnectivityGridCellClick = useCallback(
    (
      removeSummaryFilters: boolean,
      isConnectionView: boolean,
      leftSideHeatmapCoordinates: string,
    ) => {
      updateWidgetState({
        summaryFilters: removeSummaryFilters
          ? null
          : widgetState.summaryFilters,
        leftWidgetConnectionId: leftSideHeatmapCoordinates,
        rightWidgetConnectionId: isConnectionView
          ? null
          : widgetState.rightWidgetConnectionId,
        connectionPage: isConnectionView ? null : widgetState.connectionPage,
        view:
          widgetState.view === 'connectionView' || isConnectionView
            ? 'connectionView'
            : 'connectionDetailsView',
      });
    },
    [updateWidgetState, widgetState],
  );

  const clearAllFilters = useCallback(() => {
    updateWidgetState({
      filters: null,
      summaryFilters: null,
    });
  }, [updateWidgetState]);

  // Heatmap state management
  const updateHeatmapExpandedState = useCallback(
    (expandedIds: string[] | null) => {
      updateWidgetState({
        heatmapExpandedState: expandedIds,
      });
    },
    [updateWidgetState],
  );

  const updateSecondaryHeatmapExpandedState = useCallback(
    (expandedIds: string[] | null) => {
      updateWidgetState({
        secondaryHeatmapExpandedState: expandedIds,
      });
    },
    [updateWidgetState],
  );

  const clearHeatmapStates = useCallback(() => {
    updateWidgetState({
      heatmapExpandedState: null,
      secondaryHeatmapExpandedState: null,
    });
  }, [updateWidgetState]);

  const updateFilterDropdownSelect = useCallback(
    (newFilter: Filters) => {
      updateWidgetState({
        filters: newFilter,
        summaryFilters: null,
        leftWidgetConnectionId: null,
        rightWidgetConnectionId: null,
        connectionPage: null,
        view: null,
        secondaryHeatmapExpandedState: null,
      });
    },
    [updateWidgetState],
  );

  // Complete reset
  const resetAllWidgetState = useCallback(() => {
    updateWidgetState({
      view: null,
      filters: null,
      summaryFilters: null,
      leftWidgetConnectionId: null,
      rightWidgetConnectionId: null,
      connectionPage: null,
      heatmapExpandedState: null,
      secondaryHeatmapExpandedState: null,
    });
  }, [updateWidgetState]);

  return {
    // Navigation
    goToConnectionView,
    goToDetailsView,
    goToConnectionDetailsView,
    clearView,

    // Connection managemen
    updateConnectionPageInWidgetState,

    updateFilterDropdownSelect,
    updateConnectivityGridCellClick,

    updateSummaryFilters,
    clearAllFilters,

    // Heatmap state management
    updateHeatmapExpandedState,
    updateSecondaryHeatmapExpandedState,
    clearHeatmapStates,

    // Complete reset
    resetAllWidgetState,

    // Generic update
    updateWidgetState,
  };
};
