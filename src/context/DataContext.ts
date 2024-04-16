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
    hierarchicalNodes: {},
    setFilters: () => {},
});

export const useDataContext = () => useContext(DataContext);
