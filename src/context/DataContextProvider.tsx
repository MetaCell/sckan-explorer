/* eslint-disable @typescript-eslint/no-unused-vars */
// TODO: Remove the eslint-disable line above after implementing the DataContextProvider component


import {PropsWithChildren, useEffect, useState} from 'react';
import {DataContext, Filters} from "./DataContext";
import {getHierarchicalNodes, getOrgans} from "../services/hierarchyService.ts";
import {JsonData} from "../models/json.ts";
import {HierarchicalNode, Organ} from "../models/explorer.ts";

export const DataContextProvider = ({
                                        jsonData,
                                        children
                                    }: PropsWithChildren<{ composerData: unknown; jsonData: JsonData; }>) => {
    const [filters, setFilters] = useState<Filters>({
        Origin: [],
        EndOrgan: [],
        Species: [],
        Phenotype: [],
        apiNATOMY: [],
        Via: []
    });
    const [organs, setOrgans] = useState<Organ[]>([]);
    const [hierarchicalNodes, setHierarchicalNodes] = useState<Record<string, HierarchicalNode>>({});

    useEffect(() => {
        if (jsonData) {
            const nodes = getHierarchicalNodes(jsonData);
            setHierarchicalNodes(nodes);
            const organs = getOrgans(jsonData)
            setOrgans(organs)
        }
    }, [jsonData]);

    const dataContextValue = {
        filters,
        organs,
        hierarchicalNodes,
        setFilters,
    };

    return (
        <DataContext.Provider value={dataContextValue}>
            {children}
        </DataContext.Provider>
    );
};