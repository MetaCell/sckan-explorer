import { URLState, WidgetState } from '../context/DataContext';
import {
  Filters,
  SummaryFilters,
  InitialFilterOptions,
} from '../context/DataContext';
import { Datasnapshot } from '../models/json';
import { Option, HeatmapMode } from '../components/common/Types';

// Utility to check if any filter is set
export function hasActiveFilters(filters: Filters | SummaryFilters): boolean {
  return Object.values(filters).some(
    (arr) => Array.isArray(arr) && arr.length > 0,
  );
}

// Utility to validate and filter options against available options
export function validateFilterOptions(
  filterValue: Option[],
  availableOptions: Option[],
): { validOptions: Option[]; invalidOptions: Option[] } {
  const validOptions: Option[] = [];
  const invalidOptions: Option[] = [];

  filterValue.forEach((option) => {
    const isValid = availableOptions.some(
      (available) =>
        available.id === option.id && available.label === option.label,
    );

    if (isValid) {
      validOptions.push(option);
    } else {
      invalidOptions.push(option);
    }
  });

  return { validOptions, invalidOptions };
}

// Utility to validate filters against available filter options
export function validateFilters(
  filters: Filters,
  initialFilterOptions: InitialFilterOptions,
): { validFilters: Filters; invalidFilters: Record<string, Option[]> } {
  const validFilters: Filters = {
    Origin: [],
    EndOrgan: [],
    Species: [],
    Phenotype: [],
    apiNATOMY: [],
    Via: [],
    Entities: [],
  };

  const invalidFilters: Record<string, Option[]> = {};

  Object.keys(filters).forEach((filterKey) => {
    const key = filterKey as keyof Filters;
    if (filters[key] && initialFilterOptions[key]) {
      const { validOptions, invalidOptions } = validateFilterOptions(
        filters[key],
        initialFilterOptions[key],
      );

      validFilters[key] = validOptions;

      if (invalidOptions.length > 0) {
        invalidFilters[key] = invalidOptions;
      }
    }
  });

  return { validFilters, invalidFilters };
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

  if (state?.heatmapMode) {
    params.set('hm', state.heatmapMode);
  }

  return params.toString();
};

export interface URLParsingResult {
  state: URLState;
  errors: string[];
  hasInvalidDatasnapshot?: boolean;
}

export const decodeURLState = (
  searchParams: URLSearchParams,
): URLParsingResult => {
  const state: URLState = { datasnapshot: null, view: null };
  const errors: string[] = [];

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
    const validViews = ['connectionView', 'connectionDetailsView'];
    if (validViews.includes(view)) {
      state.view = view as WidgetState['view'];
    } else {
      errors.push(
        `Invalid view parameter: "${view}". Valid values: ${validViews.join(', ')}`,
      );
    }
  }

  const connectionPage = searchParams.get('cp');
  if (connectionPage) {
    const parsedPage = parseInt(connectionPage);
    if (isNaN(parsedPage)) {
      errors.push(`Invalid connection page number: "${connectionPage}"`);
    } else {
      state.connectionPage = parsedPage;
    }
  }

  const heatmapExpandedState = searchParams.get('he');
  if (heatmapExpandedState) {
    try {
      state.heatmapExpandedState = JSON.parse(atob(heatmapExpandedState));
    } catch (error) {
      console.warn('Failed to parse heatmap expanded state from URL:', error);
      errors.push('Invalid heatmap expanded state in URL');
    }
  }

  const secondaryHeatmapExpandedState = searchParams.get('she');
  if (secondaryHeatmapExpandedState) {
    try {
      state.secondaryHeatmapExpandedState = JSON.parse(
        atob(secondaryHeatmapExpandedState),
      );
    } catch (error) {
      console.warn(
        'Failed to parse secondary heatmap expanded state from URL:',
        error,
      );
      errors.push('Invalid secondary heatmap expanded state in URL');
    }
  }

  const filtersParam = searchParams.get('f');
  if (filtersParam) {
    try {
      state.filters = JSON.parse(atob(filtersParam));
    } catch (error) {
      console.warn('Failed to parse filters from URL:', error);
      errors.push('Invalid filters in URL');
    }
  }

  const summaryFiltersParam = searchParams.get('sf');
  if (summaryFiltersParam) {
    try {
      state.summaryFilters = JSON.parse(atob(summaryFiltersParam));
    } catch (error) {
      console.warn('Failed to parse summary filters from URL:', error);
      errors.push('Invalid summary filters in URL');
    }
  }
  const heatmapMode = searchParams.get('hm');
  if (heatmapMode) {
    // Match the enum value directly since it stores the string values
    if (
      heatmapMode === HeatmapMode.Default ||
      heatmapMode === HeatmapMode.Synaptic
    ) {
      state.heatmapMode = heatmapMode as HeatmapMode;
    }
  }

  return { state, errors };
};

export const COORDINATE_SEPARATOR = ',';

export const getDatasnapshotFromURLStateOrDefault = (
  urlState: URLState,
  datasnapshots: Datasnapshot[],
): string => {
  // Validate if the datasnapshot from URL exists in available datasnapshots
  if (urlState.datasnapshot) {
    const snapshotExists = datasnapshots.some(
      (ds) => ds.id.toString() === urlState.datasnapshot,
    );
    if (snapshotExists) {
      return urlState.datasnapshot;
    }
  }

  // Return default if URL datasnapshot is invalid or not found
  // iterate all the datasnapshots and return the one marked as default true, otherwise if they are all false do the same as now
  const defaultSnapshot = datasnapshots.find((ds) => ds.default);
  return defaultSnapshot
    ? defaultSnapshot.id.toString()
    : datasnapshots[0]?.id.toString() || '';
};
