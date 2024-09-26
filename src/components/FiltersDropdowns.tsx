import { Box } from '@mui/material';
import CustomFilterDropdown from './common/CustomFilterDropdown.tsx';
import React, { useMemo } from 'react';
import { Filters, useDataContext } from '../context/DataContext.ts';
import { Option } from './common/Types.ts';
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

interface FilterConfig {
  id: keyof Filters;
  placeholder: string;
  searchPlaceholder: string;
}

const filterConfig: FilterConfig[] = [
  {
    id: 'Origin',
    placeholder: 'Origin',
    searchPlaceholder: 'Search origin',
  },
  {
    id: 'EndOrgan',
    placeholder: 'End organ',
    searchPlaceholder: 'Search end organ',
  },
  {
    id: 'Species',
    placeholder: 'Species',
    searchPlaceholder: 'Search species',
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
  },
  {
    id: 'Via',
    placeholder: 'Via',
    searchPlaceholder: 'Search via',
  },
  {
    id: 'Entities',
    placeholder: 'Anatomical structures',
    searchPlaceholder: 'Search by entity',
  },
];

const FiltersDropdowns: React.FC = () => {
  const {
    filters,
    setFilters,
    knowledgeStatements,
    hierarchicalNodes,
    organs,
  } = useDataContext();

  const originsOptions = useMemo(
    () => getUniqueOrigins(knowledgeStatements, hierarchicalNodes),
    [knowledgeStatements, hierarchicalNodes],
  );
  const speciesOptions = useMemo(
    () => getUniqueSpecies(knowledgeStatements),
    [knowledgeStatements],
  );
  const phenotypesOptions = useMemo(
    () => getUniquePhenotypes(knowledgeStatements),
    [knowledgeStatements],
  );
  const apinatomiesOptions = useMemo(
    () => getUniqueApinatomies(knowledgeStatements),
    [knowledgeStatements],
  );
  const viasOptions = useMemo(
    () => getUniqueVias(knowledgeStatements, hierarchicalNodes),
    [knowledgeStatements, hierarchicalNodes],
  );
  const organsOptions = useMemo(() => getUniqueOrgans(organs), [organs]);

  const entitiesOptions = useMemo(
    () => getUniqueAllEntities(knowledgeStatements, hierarchicalNodes),
    [knowledgeStatements, hierarchicalNodes],
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
    <Box display="flex" gap={1} flexWrap="wrap">
      {filterConfig.map((filter) => (
        <CustomFilterDropdown
          key={filter.id}
          id={filter.id}
          placeholder={filter.placeholder}
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
