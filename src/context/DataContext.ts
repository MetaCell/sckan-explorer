import {createContext, useContext} from "react";
import { Organ, Via, KnowledgeStatement, HierarchicalNode } from "../models/explorer";

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
    vias: Via[];
    filters: Filters;
    knowledgeStatements: KnowledgeStatement[];
    organs: Organ[];
    hierarchicalNodes: HierarchicalNode[];
    heatMapData: unknown;
    summaryMapData: unknown;
    summaryData: unknown;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
    setHeatMap: React.Dispatch<React.SetStateAction<unknown>>;
    setSummaryMap: React.Dispatch<React.SetStateAction<unknown>>;
}

export const DataContext = createContext<DataContext>({
    vias: [],
    filters: {
        Origin: [],
        EndOrgan: [],
        Species: [],
        Phenotype: [],
        apiNATOMY: [],
        Via: []
    },
    knowledgeStatements: [],
    organs: [],
    hierarchicalNodes: [],
    heatMapData: [],
    summaryMapData: [],
    summaryData: [],
    setFilters: () => {},
    setHeatMap: () => {},
    setSummaryMap: () => {},
});

export const useDataContext = () => useContext(DataContext);
