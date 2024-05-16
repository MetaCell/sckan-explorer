import React, {createContext, useContext} from "react";
import {Organ, HierarchicalNode, KnowledgeStatement} from "../models/explorer";
import {Option} from "../components/common/Types.ts";
import { ksMapType } from "../components/common/Types";

export interface Filters {
    Origin: Option[];
    EndOrgan: Option[];
    Species: Option[];
    Phenotype: Option[];
    apiNATOMY: Option[];
    Via: Option[];
}


export interface ConnectionSummary {
    connections: ksMapType;  // displaying connection 1 of 5
    origin: string;
    endOrgan: Organ;
    hierarchy: HierarchicalNode;
}

export interface DataContext {
    filters: Filters;
    majorNerves: Set<string>;
    organs: Record<string, Organ>;
    hierarchicalNodes: Record<string, HierarchicalNode>;
    knowledgeStatements: Record<string, KnowledgeStatement>;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
    selectedConnectionSummary: ConnectionSummary;
    setConnectionSummary: React.Dispatch<React.SetStateAction<ConnectionSummary>>;
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
    selectedConnectionSummary: {
        connections: {},
        origin: "",
        endOrgan: {} as Organ,
        hierarchy: {} as HierarchicalNode,
    },
    setConnectionSummary: () => {
    }
});

export const useDataContext = () => useContext(DataContext);
