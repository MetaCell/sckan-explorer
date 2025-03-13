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
    () => getUniqueAllEntities(knowledgeStatements, hierarchicalNodes, organs),
    [knowledgeStatements, hierarchicalNodes, organs],
  );

  const handleEntitiesSelect = (
    selectedOptions: Option[],
    filterKey: FilterConfig['id'],
    organValues: Organ[],
  ) => {
    // we take EndOrgans from Entities Dropdown and add them to the EndOrgan filter
    const endOrganOptions = selectedOptions.filter((option) =>
      organValues.some((organ) => organ.id === option.id),
    );

    setFilters((prevFilters) => {
      const newEndOrgan = [
        ...prevFilters.EndOrgan,
        ...endOrganOptions.filter(
          (option) =>
            !prevFilters.EndOrgan.some(
              (existingOption) => existingOption.id === option.id,
            ),
        ),
      ].filter((option) =>
        selectedOptions.some(
          (selectedOption) => selectedOption.id === option.id,
        ),
      );

      return {
        ...prevFilters,
        [filterKey]: selectedOptions,
        EndOrgan: newEndOrgan,
      };
    });
  };

  const handleEndOrganSelect = (
    selectedOptions: Option[],
    filterKey: FilterConfig['id'],
  ) => {
    // We take the deselected options from EndOrgan and remove them from Entities too
    const deselectedOptions = filters.EndOrgan.filter(
      (option) =>
        !selectedOptions.some(
          (selectedOption) => selectedOption.id === option.id,
        ),
    );

    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterKey]: selectedOptions,
      Entities: prevFilters.Entities.filter(
        (option) =>
          !deselectedOptions.some(
            (deselectedOption) => deselectedOption.id === option.id,
          ),
      ),
    }));
  };

  const handleSelect = (
    filterKey: keyof typeof filters,
    selectedOptions: Option[],
  ) => {
    const organValues = Object.values(organs);

    if (filterKey === 'Entities') {
      handleEntitiesSelect(selectedOptions, filterKey, organValues);
    } else if (filterKey === 'EndOrgan') {
      handleEndOrganSelect(selectedOptions, filterKey);
    } else {
      setFilters((prevFilters) => ({
        ...prevFilters,
        [filterKey]: selectedOptions,
      }));
    }
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
