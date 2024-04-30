import {PropsWithChildren, useState} from 'react';
import {DataContext, Filters} from "./DataContext";
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


    const dataContextValue = {
        filters,
        organs,
        majorNerves,
        hierarchicalNodes,
        knowledgeStatements,
        setFilters,
    };

    return (
        <DataContext.Provider value={dataContextValue}>
            {children}
        </DataContext.Provider>
    );
};