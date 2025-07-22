import { URLState, WidgetState } from '../context/DataContext';
import { Filters, SummaryFilters } from '../context/DataContext';
import { Datasnapshot } from '../models/json';

// Utility to check if any filter is set
export function hasActiveFilters(filters: Filters | SummaryFilters): boolean {
  return Object.values(filters).some(
    (arr) => Array.isArray(arr) && arr.length > 0,
  );
}

export const encodeURLState = (state: URLState): string => {
  const params = new URLSearchParams();
  if (state.datasnapshot) {
    params.set('ds', state.datasnapshot);
  }

  if (state?.view) {
    params.set('v', state.view);
  }

  if (state?.leftWidgetConnectionId) {
    params.set('lwi', state.leftWidgetConnectionId);
  }
  if (state?.rightWidgetConnectionId) {
    params.set('rwi', state.rightWidgetConnectionId);
  }

  if (state?.connectionPage) {
    params.set('cp', state.connectionPage.toString());
  }

  if (state?.heatmapExpandedState) {
    params.set('he', btoa(JSON.stringify(state.heatmapExpandedState)));
  }
  if (state?.secondaryHeatmapExpandedState) {
    params.set(
      'she',
      btoa(JSON.stringify(state.secondaryHeatmapExpandedState)),
    );
  }

  if (state?.filters && hasActiveFilters(state.filters)) {
    const filtersStr = JSON.stringify(state.filters);
    params.set('f', btoa(filtersStr));
  }

  if (state?.summaryFilters && hasActiveFilters(state.summaryFilters)) {
    const summaryFiltersStr = JSON.stringify(state.summaryFilters);
    params.set('sf', btoa(summaryFiltersStr));
  }

  return params.toString();
};

export const decodeURLState = (searchParams: URLSearchParams): URLState => {
  const state: URLState = { datasnapshot: null, view: null };

  const datasnapshot = searchParams.get('ds');
  if (datasnapshot) {
    state.datasnapshot = datasnapshot;
  }

  const leftWidgetConnectionId = searchParams.get('lwi');
  if (leftWidgetConnectionId) {
    state.leftWidgetConnectionId = leftWidgetConnectionId;
  }
  const rightWidgetConnectionId = searchParams.get('rwi');
  if (rightWidgetConnectionId) {
    state.rightWidgetConnectionId = rightWidgetConnectionId;
  }

  const view = searchParams.get('v');
  if (view) {
    state.view = view as WidgetState['view'];
  }

  const connectionPage = searchParams.get('cp');
  if (connectionPage) {
    state.connectionPage = parseInt(connectionPage);
  }

  const heatmapExpandedState = searchParams.get('he');
  if (heatmapExpandedState) {
    state.heatmapExpandedState = JSON.parse(atob(heatmapExpandedState));
  }

  const secondaryHeatmapExpandedState = searchParams.get('she');
  if (secondaryHeatmapExpandedState) {
    state.secondaryHeatmapExpandedState = JSON.parse(
      atob(secondaryHeatmapExpandedState),
    );
  }

  const filtersParam = searchParams.get('f');
  if (filtersParam) {
    try {
      state.filters = JSON.parse(atob(filtersParam));
    } catch (error) {
      console.warn('Failed to parse filters from URL:', error);
    }
  }

  const summaryFiltersParam = searchParams.get('sf');
  if (summaryFiltersParam) {
    try {
      state.summaryFilters = JSON.parse(atob(summaryFiltersParam));
    } catch (error) {
      console.warn('Failed to parse summary filters from URL:', error);
    }
  }

  return state;
};

export const COORDINATE_SEPARATOR = ',';

export const getDatasnapshotFromURLStateOrDefault = (
  urlState: URLState,
  datasnapshots: Datasnapshot[],
): string => {
  return urlState.datasnapshot || datasnapshots[0].id.toString();
};
