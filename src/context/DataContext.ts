import React, {createContext, useContext} from "react";
import {Organ, HierarchicalNode, KnowledgeStatement} from "../models/explorer";
import {Option} from "../components/common/Types.ts";

export interface Filters {
    Origin: Option[];
    EndOrgan: Option[];
    Species: Option[];
    Phenotype: Option[];
    apiNATOMY: Option[];
    Via: Option[];
}

export interface DataContext {
    filters: Filters;
    majorNerves: Set<string>;
    organs: Record<string, Organ>;
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
    majorNerves: new Set<string>(),
    organs: {},
    hierarchicalNodes: {},
    knowledgeStatements: {},
    setFilters: () => {
    },
});

export const useDataContext = () => useContext(DataContext);
