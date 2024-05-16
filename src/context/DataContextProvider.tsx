import {PropsWithChildren, useState} from 'react';
import { DataContext, Filters, ConnectionSummary, SummaryFilters } from "./DataContext";
import {HierarchicalNode, KnowledgeStatement, Organ} from "../models/explorer.ts";


export const DataContextProvider = ({
    hierarchicalNodes,
    organs,
    majorNerves,
    knowledgeStatements,
    children
}: PropsWithChildren<{
    hierarchicalNodes: Record<string, HierarchicalNode>;
    organs: Record<string, Organ>;
    majorNerves: Set<string>;
    knowledgeStatements: Record<string, KnowledgeStatement>;
}>) => {
    const [filters, setFilters] = useState<Filters>({
        Origin: [],
        EndOrgan: [],
        Species: [],
        Phenotype: [],
        apiNATOMY: [],
        Via: []
    });
    const [summaryFilters, setSummaryFilters] = useState<SummaryFilters>({
        Phenotype: [],
        Nerve: []
    });

    const [selectedConnectionSummary, setSelectedConnectionSummary] = useState<ConnectionSummary>({
        connections: {},
        origin: "",
        endOrgan: {} as Organ,
        hierarchy: {} as HierarchicalNode,
    });


    const dataContextValue = {
        filters,
        summaryFilters,
        setSummaryFilters,
        organs,
        majorNerves,
        hierarchicalNodes,
        knowledgeStatements,
        setFilters,
        selectedConnectionSummary,
        setConnectionSummary: setSelectedConnectionSummary
    };

    return (
        <DataContext.Provider value={dataContextValue}>
            {children}
        </DataContext.Provider>
    );
};