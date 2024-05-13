import React, { createContext, useContext } from "react";
import { Organ, HierarchicalNode, KnowledgeStatement } from "../models/explorer";
import { ksMapType } from "../components/common/Types";

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

export interface SummaryFilters {
    Phenotype: string[];
    Nerve: string[];
}


export interface ConnectionDetails {
    status: string;
    species: string;
    label: string;
    provenances: string[]; // array of provenance strings
}
export interface ConnectionSummaryDetails {
    connections: string[];  // displaying connection 1 of 5
    sparcPortalLink: string;
    downloadLink: string;
    knowledgeStatement: string;
    connectionDetails: ConnectionDetails;
    populationDisplay: any // TODO: define type
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
