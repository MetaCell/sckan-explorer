import {PropsWithChildren, useMemo, useState} from 'react';
import { DataContext, Filters, ConnectionSummary, SummaryFilters } from "./DataContext";
import {HierarchicalNode, KnowledgeStatement, Organ} from "../models/explorer.ts";
import {PhenotypeDetail} from "../components/common/Types.ts";
import {generatePhenotypeColors} from "../services/summaryHeatmapService.ts";
import {OTHER_PHENOTYPE_LABEL} from "../settings.ts";


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

    const [selectedConnectionSummary, setSelectedConnectionSummary] = useState<ConnectionSummary | null>(null);

    const phenotypes = useMemo(() => {
        const allPhenotypes = Object.values(knowledgeStatements).map(ks => ks.phenotype || OTHER_PHENOTYPE_LABEL);
        return Array.from(new Set(allPhenotypes)); // Get unique phenotypes
    }, [knowledgeStatements]);

    const phenotypesColorMap = useMemo(() => {
        const colors = generatePhenotypeColors(phenotypes.length);
        const colorMap: Record<string, PhenotypeDetail> = {};
        phenotypes.forEach((phenotype, index) => {
            colorMap[phenotype] = {
                label: phenotype,
                color: colors[index]
            };
        });
        return colorMap;
    }, [phenotypes]);


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
        setConnectionSummary: setSelectedConnectionSummary,
        phenotypesColorMap
    };

    return (
        <DataContext.Provider value={dataContextValue}>
            {children}
        </DataContext.Provider>
    );
};