/* eslint-disable @typescript-eslint/no-unused-vars */
// TODO: Remove the eslint-disable line above after implementing the DataContextProvider component


import {PropsWithChildren, useEffect, useState} from 'react';
import {DataContext, Filters} from "./DataContext";
import {getHierarchicalNodes, getOrgans} from "../services/hierarchyService.ts";
import {JsonData} from "../models/json.ts";
import {HierarchicalNode, KnowledgeStatement, Organ} from "../models/explorer.ts";
import {fetchKnowledgeStatements} from "../services/fetchService.ts";

export const DataContextProvider = ({
                                        jsonData,
                                        majorNerves,
                                        children
                                    }: PropsWithChildren<{ jsonData: JsonData; majorNerves: Set<string> }>) => {
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
    const [knowledgeStatements, setKnowledgeStatements] = useState<Record<string, KnowledgeStatement>>({});

    useEffect(() => {
        if (jsonData) {
            const nodes = getHierarchicalNodes(jsonData);
            setHierarchicalNodes(nodes);
            const organs = getOrgans(jsonData)
            setOrgans(organs)
            fetchAndSetKnowledgeStatements(nodes);
        }
    }, [jsonData]);

    const fetchAndSetKnowledgeStatements = async (nodes: Record<string, HierarchicalNode>) => {
        // Collect all unique neuron IDs as before
        const neuronIDs = [...new Set(Object.values(nodes).flatMap(node =>
            Object.values(node.connectionDetails || {}).flat()))];

        // Fetch knowledge statements by these neuron IDs
        const fetchedKnowledgeStatements = await fetchKnowledgeStatements(neuronIDs);

        // Convert array to a map by ID for easy access
        const ksMap = fetchedKnowledgeStatements.reduce<Record<string, KnowledgeStatement>>((acc, ks) => {
            acc[ks.id] = ks;
            return acc;
        }, {});

        setKnowledgeStatements(ksMap);
    };

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