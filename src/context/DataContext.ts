import React, {createContext, useContext} from "react";
import {Organ, HierarchicalNode, KnowledgeStatement} from "../models/explorer";

export interface Filter {
    name: string;
    value: string;
}

export interface Filters {
    Origin: Filter[];
    EndOrgan: Filter[];
    Species: Filter[];
    Phenotype: Filter[];
    apiNATOMY: Filter[];
    Via: Filter[];
}

export interface DataContext {
    filters: Filters;
    organs: Organ[];
    majorNerves: Set<string>;
    hierarchicalNodes: Record<string, HierarchicalNode>;
    knowledgeStatements: Record<string, KnowledgeStatement>;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

export const DataContext = createContext<DataContext>({
    filters: {
        Origin: [],
        EndOrgan: [],
        Species: [],
        Phenotype: [],
        apiNATOMY: [],
        Via: []
    },
    organs: [],
    majorNerves: new Set<string>(),
    hierarchicalNodes: {},
    knowledgeStatements: {},
    setFilters: () => {
    },
});

export const useDataContext = () => useContext(DataContext);
