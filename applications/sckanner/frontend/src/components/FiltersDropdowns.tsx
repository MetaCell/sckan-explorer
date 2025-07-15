import { Box } from '@mui/material';
import CustomFilterDropdown from './common/CustomFilterDropdown.tsx';
import React, { useMemo } from 'react';
import { Filters, useDataContext } from '../context/DataContext.ts';
import { HierarchicalItem, Option } from './common/Types.ts';
import {
  getUniqueApinatomies,
  getUniqueOrgans,
  getUniqueOrigins,
  getUniquePhenotypes,
  getUniqueSpecies,
  getUniqueVias,
  getUniqueAllEntities,
} from '../services/filterValuesService.ts';
import {
  searchApiNATOMY,
  searchEndOrgans,
  searchOrigins,
  searchPhenotypes,
  searchSpecies,
  searchVias,
  searchEntities,
} from '../services/searchService.ts';
import { filterKnowledgeStatements } from '../services/heatmapService.ts';
import { Organ } from '../models/explorer.ts';

interface FilterConfig {
  id: keyof Filters;
  placeholder: string;
  searchPlaceholder: string;
  tooltip?: string;
}

const filterConfig: FilterConfig[] = [
  {
    id: 'Origin',
    placeholder: 'Origin',
    searchPlaceholder: 'Search origin',
    tooltip: 'Location of the cell body',
  },
  {
    id: 'EndOrgan',
    placeholder: 'End organ',
    searchPlaceholder: 'Search end organ',
    tooltip: 'Where axons terminate',
  },
  {
    id: 'Species',
    placeholder: 'Species',
    searchPlaceholder: 'Search species',
    tooltip: 'Species specificity as identified in literature',
  },
  {
    id: 'Phenotype',
    placeholder: 'Phenotype',
    searchPlaceholder: 'Search phenotype',
  },
  {
    id: 'apiNATOMY',
    placeholder: 'Connectivity Model',
    searchPlaceholder: 'Search connectivity models',
    tooltip: 'Expert contributed circuitry models',
  },
  {
    id: 'Via',
    placeholder: 'Via',
    searchPlaceholder: 'Search via',
    tooltip:
      "Nerves or regions through which axons travel, but don't terminate",
  },
  {
    id: 'Entities',
    placeholder: 'Anatomical structures',
    searchPlaceholder: 'Search by entity',
    tooltip: 'Includes origins, end organs, and vias',
  },
];

const FiltersDropdowns: React.FC<{
  filteredYAxis: HierarchicalItem[];
  filteredXOrgans: Organ[];
}> = ({ filteredYAxis, filteredXOrgans }) => {
  const {
    filters,
    setFilters,
    knowledgeStatements,
    hierarchicalNodes,
    organs,
  } = useDataContext();

  const filteredKnowledgeStatements = useMemo(() => {
    return filterKnowledgeStatements(
      knowledgeStatements,
      hierarchicalNodes,
      filters,
      organs,
    );
  }, [knowledgeStatements, hierarchicalNodes, filters, organs]);

  const originsOptions = useMemo(
    () => getUniqueOrigins(filteredKnowledgeStatements, filteredYAxis),
    [filteredKnowledgeStatements, filteredYAxis],
  );
  const speciesOptions = useMemo(
    () => getUniqueSpecies(filteredKnowledgeStatements),
    [filteredKnowledgeStatements],
  );
  const phenotypesOptions = useMemo(
    () => getUniquePhenotypes(filteredKnowledgeStatements),
    [filteredKnowledgeStatements],
  );
  const apinatomiesOptions = useMemo(
    () => getUniqueApinatomies(filteredKnowledgeStatements),
    [filteredKnowledgeStatements],
  );
  const viasOptions = useMemo(
    () => getUniqueVias(filteredKnowledgeStatements),
    [filteredKnowledgeStatements],
  );
  const organsOptions = useMemo(
    () => getUniqueOrgans(filteredXOrgans),
    [filteredXOrgans],
  );

  const entitiesOptions = useMemo(
    () =>
      getUniqueAllEntities(
        filteredKnowledgeStatements,
        filteredYAxis,
        filteredXOrgans,
      ),
    [filteredKnowledgeStatements, filteredYAxis, filteredXOrgans],
  );

  const handleSelect = (
    filterKey: keyof typeof filters,
    selectedOptions: Option[],
  ) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterKey]: selectedOptions,
    }));
  };

  const searchFunctions = useMemo(() => {
    return {
      Origin: (value: string) => searchOrigins(value, originsOptions),
      EndOrgan: (value: string) => searchEndOrgans(value, organsOptions),
      Species: (value: string) => searchSpecies(value, speciesOptions),
      Phenotype: (value: string) => searchPhenotypes(value, phenotypesOptions),
      apiNATOMY: (value: string) => searchApiNATOMY(value, apinatomiesOptions),
      Via: (value: string) => searchVias(value, viasOptions),
      Entities: (value: string) => searchEntities(value, entitiesOptions),
    };
  }, [
    apinatomiesOptions,
    organsOptions,
    originsOptions,
    phenotypesOptions,
    speciesOptions,
    viasOptions,
    entitiesOptions,
  ]);

  return (
    <Box display="flex" gap={1} flexWrap="wrap" p={3}>
      {filterConfig.map((filter) => (
        <CustomFilterDropdown
          key={filter.id}
          id={filter.id}
          placeholder={filter.placeholder}
          tooltip={filter.tooltip}
          searchPlaceholder={filter.searchPlaceholder}
          selectedOptions={filters[filter.id]}
          onSearch={(searchValue: string) =>
            searchFunctions[filter.id](searchValue)
          }
          onSelect={(options: Option[]) =>
            handleSelect(filter.id as keyof Filters, options)
          }
        />
      ))}
    </Box>
  );
};

export default FiltersDropdowns;
