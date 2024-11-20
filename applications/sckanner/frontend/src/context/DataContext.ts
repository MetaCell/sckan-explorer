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
});

export const useDataContext = () => useContext(DataContext);
