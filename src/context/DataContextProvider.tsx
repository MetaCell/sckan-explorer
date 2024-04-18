import {PropsWithChildren, useEffect, useState} from 'react';
import {DataContext, Filters} from "./DataContext";
import {getHierarchicalNodes, getOrgans} from "../services/hierarchyService.ts";
import {JsonData} from "../models/json.ts";
import {HierarchicalNode, KnowledgeStatement, Organ} from "../models/explorer.ts";
import {fetchKnowledgeStatements} from "../services/fetchService.ts";

export const DataContextProvider = ({
                                        hierarchicalNodes,
                                        organs,
                                        majorNerves,
                                        knowledgeStatements,
                                        children
                                    }: PropsWithChildren<{
    hierarchicalNodes: Record<string, HierarchicalNode>;
    organs: Organ[];
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