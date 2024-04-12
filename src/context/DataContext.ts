import React, {createContext, useContext} from "react";
import {Organ, HierarchicalNode} from "../models/explorer";

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
    hierarchicalNodes: Record<string, HierarchicalNode>;
    heatMapData: unknown;
    summaryMapData: unknown;
    summaryData: unknown;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
    setHeatMapData: React.Dispatch<React.SetStateAction<unknown>>;
    setSummaryMapData: React.Dispatch<React.SetStateAction<unknown>>;
    setSummaryData: React.Dispatch<React.SetStateAction<unknown>>;
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
    hierarchicalNodes: {},
    heatMapData: undefined,
    summaryMapData: undefined,
    summaryData: undefined,
    setFilters: () => {
    },
    setHeatMapData: () => {
    },
    setSummaryMapData: () => {
    },
    setSummaryData: () => {
    }
});

export const useDataContext = () => useContext(DataContext);
