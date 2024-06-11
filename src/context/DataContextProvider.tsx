import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { DataContext, Filters, ConnectionSummary } from './DataContext';
import {
  HierarchicalNode,
  KnowledgeStatement,
  Organ,
} from '../models/explorer.ts';
import { PhenotypeDetail } from '../components/common/Types.ts';
import { generatePhenotypeColors } from '../services/summaryHeatmapService.ts';
import { OTHER_PHENOTYPE_LABEL } from '../settings.ts';
import { filterKnowledgeStatements } from '../services/heatmapService.ts';

export const DataContextProvider = ({
  hierarchicalNodes,
  organs,
  majorNerves,
  knowledgeStatements,
  children,
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
    Via: [],
  });

  const [selectedConnectionSummary, setSelectedConnectionSummary] =
    useState<ConnectionSummary | null>(null);

  const phenotypes = useMemo(() => {
    const allPhenotypes = Object.values(knowledgeStatements).map(
      (ks) => ks.phenotype || OTHER_PHENOTYPE_LABEL,
    );
    return Array.from(new Set(allPhenotypes)); // Get unique phenotypes
  }, [knowledgeStatements]);

  const phenotypesColorMap = useMemo(() => {
    const colors = generatePhenotypeColors(phenotypes.length);
    const colorMap: Record<string, PhenotypeDetail> = {};
    phenotypes.forEach((phenotype, index) => {
      colorMap[phenotype] = {
        label: phenotype,
        color: colors[index],
      };
    });
    return colorMap;
  }, [phenotypes]);

  const handleSetSelectedConnectionSummary = (
    summary: Omit<ConnectionSummary, 'filteredKnowledgeStatements'>,
  ) => {
    const filteredKnowledgeStatements = filterKnowledgeStatements(
      summary.connections,
      hierarchicalNodes,
      filters,
    );
    setSelectedConnectionSummary({
      ...summary,
      filteredKnowledgeStatements,
    });
  };

  useEffect(() => {
    if (selectedConnectionSummary) {
      const filteredKnowledgeStatements = filterKnowledgeStatements(
        selectedConnectionSummary.connections,
        hierarchicalNodes,
        filters,
      );
      setSelectedConnectionSummary((prevSummary) =>
        prevSummary
          ? {
              ...prevSummary,
              filteredKnowledgeStatements,
            }
          : null,
      );
    }
  }, [filters, selectedConnectionSummary]);

  const dataContextValue = {
    filters,
    organs,
    majorNerves,
    hierarchicalNodes,
    knowledgeStatements,
    setFilters,
    selectedConnectionSummary,
    setSelectedConnectionSummary: handleSetSelectedConnectionSummary,
    phenotypesColorMap,
  };

  return (
    <DataContext.Provider value={dataContextValue}>
      {children}
    </DataContext.Provider>
  );
};
