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

export interface RightWidgetState {
  type: 'summary' | 'connection' | null;
  clusterId?: string;
  connectionId?: string;
  populationId?: string;
  filters?: SummaryFilters;
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
  selectedCluster: string | null;
  setSelectedCluster: (clusterId: string | null) => void;
  rightWidgetState: RightWidgetState;
  setRightWidgetState: (state: RightWidgetState) => void;
  updateUrlState: () => void;
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
  selectedCluster: null,
  setSelectedCluster: () => {},
  rightWidgetState: { type: null },
  setRightWidgetState: () => {},
  updateUrlState: () => {},
});

export const useDataContext = () => useContext(DataContext);
