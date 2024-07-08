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
    const phenotypesList = [
      'sympathetic pre-ganglionic',
      'other',
      'parasympathetic',
      'parasympathetic post-ganglionic',
      'sympathetic post-ganglionic',
      'Post ganglionic phenotype',
      'parasympathetic pre-ganglionic',
      'enteric',
    ];
    const phenoColor: Record<string, string> = {};
    phenotypesList.forEach((phenotype, index) => {
      phenoColor[phenotype] = colors[index];
    });
    const colorMap: Record<string, PhenotypeDetail> = {};
    phenotypes.sort().forEach((phenotype, index) => {
      colorMap[phenotype] = {
        label: phenotype,
        color: phenoColor[phenotype] || colors[index],
      };
    });
    return colorMap;
  }, [phenotypes]);

  const updateSelectedConnectionSummary = (
    summary:
      | Omit<ConnectionSummary, 'filteredKnowledgeStatements'>
      | ConnectionSummary
      | null,
    filters: Filters,
    hierarchicalNodes: Record<string, HierarchicalNode>,
  ) => {
    if (summary) {
      const filteredKnowledgeStatements = filterKnowledgeStatements(
        summary.connections,
        hierarchicalNodes,
        filters,
      );
      return {
        ...summary,
        filteredKnowledgeStatements,
      };
    }
    return null;
  };

  const handleSetSelectedConnectionSummary = (
    summary: Omit<ConnectionSummary, 'filteredKnowledgeStatements'> | null,
  ) => {
    const updatedSummary = updateSelectedConnectionSummary(
      summary,
      filters,
      hierarchicalNodes,
    );
    setSelectedConnectionSummary(updatedSummary);
  };

  useEffect(() => {
    setSelectedConnectionSummary((prevSummary) =>
      updateSelectedConnectionSummary(prevSummary, filters, hierarchicalNodes),
    );
  }, [filters, hierarchicalNodes]);

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
