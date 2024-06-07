import React, { createContext, useContext } from 'react';
import {
  Organ,
  HierarchicalNode,
  KnowledgeStatement,
} from '../models/explorer';
import { Option, PhenotypeDetail } from '../components/common/Types.ts';
import { KsRecord } from '../components/common/Types';

export interface Filters {
  Origin: Option[];
  EndOrgan: Option[];
  Species: Option[];
  Phenotype: Option[];
  apiNATOMY: Option[];
  Via: Option[];
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

export interface DataContext {
  filters: Filters;
  majorNerves: Set<string>;
  organs: Record<string, Organ>;
  hierarchicalNodes: Record<string, HierarchicalNode>;
  knowledgeStatements: Record<string, KnowledgeStatement>;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  selectedConnectionSummary: ConnectionSummary | null;
  setSelectedConnectionSummary: (
    summary: Omit<ConnectionSummary, 'filteredKnowledgeStatements'>,
  ) => void;
  phenotypesColorMap: Record<string, PhenotypeDetail>;
}

export const DataContext = createContext<DataContext>({
  filters: {
    Origin: [],
    EndOrgan: [],
    Species: [],
    Phenotype: [],
    apiNATOMY: [],
    Via: [],
  },
  majorNerves: new Set<string>(),
  organs: {},
  hierarchicalNodes: {},
  knowledgeStatements: {},
  setFilters: () => {},
  selectedConnectionSummary: null,
  setSelectedConnectionSummary: () => {},
  phenotypesColorMap: {},
});

export const useDataContext = () => useContext(DataContext);
