import React, { createContext, useContext } from 'react';
import {
  Organ,
  HierarchicalNode,
  KnowledgeStatement,
} from '../models/explorer.ts';
import { Option, PhenotypeDetail } from '../components/common/Types.ts';
import { KsRecord } from '../components/common/Types.ts';

export interface Filters {
  Origin: Option[];
  EndOrgan: Option[];
  Species: Option[];
  Phenotype: Option[];
  apiNATOMY: Option[];
  Via: Option[];
  Entities: Option[];
}

export interface SummaryFilters extends Filters {
  Nerve: Option[];
}

export interface ConnectionSummary {
  connections: KsRecord;
  filteredKnowledgeStatements: KsRecord;
  hierarchicalNode: HierarchicalNode;
  endOrgan: Organ;
}

export interface InitialFilterOptions {
  Origin: Option[];
  EndOrgan: Option[];
  Species: Option[];
  Phenotype: Option[];
  apiNATOMY: Option[];
  Via: Option[];
  Entities: Option[];
}

export interface WidgetState {
  datasnapshot: string | null;
  view: 'connectionView' | 'connectionDetailsView' | null;
  leftWidgetConnectionId?: string | null;
  rightWidgetConnectionId?: string | null;
  filters?: Filters | null;
  summaryFilters?: SummaryFilters | null;
  connectionPage?: number | null;
  heatmapExpandedState?: string[] | null;
  secondaryHeatmapExpandedState?: string[] | null;
}

export interface URLState extends WidgetState {
  fullUrlState?: URLState | null;
}

export interface DataContext {
  filters: Filters;
  majorNerves: Set<string>;
  organs: Record<string, Organ>;
  hierarchicalNodes: Record<string, HierarchicalNode>;
  knowledgeStatements: Record<string, KnowledgeStatement>;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  selectedConnectionSummary: ConnectionSummary | null;
  setSelectedConnectionSummary: (
    summary: Omit<ConnectionSummary, 'filteredKnowledgeStatements'> | null,
  ) => void;
  phenotypesColorMap: Record<string, PhenotypeDetail>;
  resetApplicationState: () => void;
  isDataLoading: boolean;
  setIsDataLoading: (loading: boolean) => void;
  initialFilterOptions: InitialFilterOptions;
  widgetState: WidgetState;
  setWidgetState: (state: WidgetState) => void;
  resetWidgetState: (datasnapshot: string) => void;
}

export const DataContext = createContext<DataContext>({
  filters: {
    Origin: [],
    EndOrgan: [],
    Species: [],
    Phenotype: [],
    apiNATOMY: [],
    Via: [],
    Entities: [],
  },
  majorNerves: new Set<string>(),
  organs: {},
  hierarchicalNodes: {},
  knowledgeStatements: {},
  setFilters: () => {},
  selectedConnectionSummary: null,
  setSelectedConnectionSummary: () => {},
  phenotypesColorMap: {},
  resetApplicationState: () => {},
  isDataLoading: false,
  setIsDataLoading: () => {},
  initialFilterOptions: {
    Origin: [],
    EndOrgan: [],
    Species: [],
    Phenotype: [],
    apiNATOMY: [],
    Via: [],
    Entities: [],
  },
  widgetState: {
    datasnapshot: null,
    view: null,
    filters: null,
    leftWidgetConnectionId: null,
    rightWidgetConnectionId: null,
    summaryFilters: null,
    connectionPage: null,
    heatmapExpandedState: null,
    secondaryHeatmapExpandedState: null,
  },
  setWidgetState: () => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  resetWidgetState: (_datasnapshot: string) => { },
});

export const useDataContext = () => useContext(DataContext);
