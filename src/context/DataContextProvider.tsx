/* eslint-disable @typescript-eslint/no-unused-vars */

import {PropsWithChildren, useState} from 'react';
import { DataContext } from "./DataContext";

export const DataContextProvider = ({
    // composerData,
    // jsonData,
    children
}: PropsWithChildren<{
    composerData: unknown;
    jsonData: unknown;
}>) => {
    const [vias, setVias] = useState([]);
    const [filters, setFilters] = useState({
        Origin: [],
        EndOrgan: [],
        Species: [],
        Phenotype: [],
        apiNATOMY: [],
        Via: []
    });
    const [knowledgeStatements, setKnowledgeStatements] = useState([]);
    const [organs, setOrgans] = useState([]);
    const [hierarchicalNodes, setHierarchicalNodes] = useState([]);
    const [heatMapData, setHeatMapData] = useState([]);
    const [summaryMapData, setSummaryMapData] = useState([]);
    const [summaryData, setSummaryData] = useState([]);

    const datacontextValue = {
        vias,
        filters,
        knowledgeStatements,
        organs,
        hierarchicalNodes,
        heatMapData,
        summaryMapData,
        summaryData,
        setFilters: () => {},
        setHeatMap: () => {},
        setHeatMapData: () => {},
        setSummaryMap: () => {},
        setSummaryData: () => {}
    };

    return (
        <DataContext.Provider value={datacontextValue}>
            {children}
        </DataContext.Provider>
    );
};
