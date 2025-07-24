import { URLState, InitialFilterOptions } from '../context/DataContext';
import { Datasnapshot } from '../models/json';
import { validateFilters } from './urlStateManager';

export interface URLValidationResult {
  errors: string[];
  hasInvalidDatasnapshot: boolean;
  hasInvalidFilters: boolean;
  validatedState?: Partial<URLState>;
}

export const validateURLState = (
  urlState: URLState,
  datasnapshots: Datasnapshot[],
  initialFilterOptions?: InitialFilterOptions,
): URLValidationResult => {
  const errors: string[] = [];
  let hasInvalidDatasnapshot = false;
  let hasInvalidFilters = false;
  const validatedState: Partial<URLState> = { ...urlState };

  // Validate datasnapshot
  if (urlState.datasnapshot) {
    const snapshotExists = datasnapshots.some(
      (ds) => ds.id.toString() === urlState.datasnapshot,
    );
    
    if (!snapshotExists) {
      hasInvalidDatasnapshot = true;
      const availableIds = datasnapshots
        .map((ds) => ds.id.toString())
        .join(', ');
      errors.push(
        `Data snapshot "${urlState.datasnapshot}" is no longer available. Using default snapshot instead. Available snapshots: ${availableIds}`,
      );
      // Use the first available datasnapshot as default
      validatedState.datasnapshot = datasnapshots[0]?.id.toString() || null;
    }
  } else if (datasnapshots.length > 0) {
    // If no datasnapshot is specified in URL, use the first available one
    validatedState.datasnapshot = datasnapshots[0].id.toString();
  }

  // Validate filters if initialFilterOptions are provided
  if (urlState.filters && initialFilterOptions) {
    const { validFilters, invalidFilters } = validateFilters(
      urlState.filters,
      initialFilterOptions,
    );

    const invalidFilterCount = Object.keys(invalidFilters).length;
    if (invalidFilterCount > 0) {
      hasInvalidFilters = true;
      const invalidFilterDetails = Object.entries(invalidFilters)
        .map(([filterKey, options]) => {
          const labels = options.map((opt) => opt.label).join(', ');
          return `${filterKey}: ${labels}`;
        })
        .join('; ');

      errors.push(
        `Some filter options are no longer available and have been removed: ${invalidFilterDetails}`,
      );
    }

    validatedState.filters = validFilters;
  }

  return {
    errors,
    hasInvalidDatasnapshot,
    hasInvalidFilters,
    validatedState,
  };
};
