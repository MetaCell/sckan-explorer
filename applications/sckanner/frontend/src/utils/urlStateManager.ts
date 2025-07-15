import { Filters, RightWidgetState } from '../context/DataContext';

export interface URLState {
  datasnapshot?: string;
  filters?: Filters;
  selectedCluster?: string;
  rightWidget?: RightWidgetState;
}

export const encodeURLState = (state: URLState): string => {
  const params = new URLSearchParams();

  if (state.datasnapshot) {
    params.set('ds', state.datasnapshot);
  }

  if (state.filters) {
    const filtersStr = JSON.stringify(state.filters);
    params.set('f', btoa(filtersStr));
  }

  if (state.selectedCluster) {
    params.set('c', state.selectedCluster);
  }

  if (state.rightWidget && state.rightWidget.type) {
    const rightWidgetStr = JSON.stringify(state.rightWidget);
    params.set('rw', btoa(rightWidgetStr));
  }

  return params.toString();
};

export const decodeURLState = (searchParams: URLSearchParams): URLState => {
  const state: URLState = {};

  const datasnapshot = searchParams.get('ds');
  if (datasnapshot) {
    state.datasnapshot = datasnapshot;
  }

  const filtersParam = searchParams.get('f');
  if (filtersParam) {
    try {
      state.filters = JSON.parse(atob(filtersParam));
    } catch (error) {
      console.warn('Failed to parse filters from URL:', error);
    }
  }

  const selectedCluster = searchParams.get('c');
  if (selectedCluster) {
    state.selectedCluster = selectedCluster;
  }

  const rightWidgetParam = searchParams.get('rw');
  if (rightWidgetParam) {
    try {
      state.rightWidget = JSON.parse(atob(rightWidgetParam));
    } catch (error) {
      console.warn('Failed to parse right widget state from URL:', error);
    }
  }

  return state;
};
