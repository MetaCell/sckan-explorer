import { useMemo } from 'react';
import CustomFilterDropdown from './common/CustomFilterDropdown';
import { Option } from './common/Types';
import { Box } from '@mui/material';
import {
  searchNerveFilter,
  searchPhenotypeFilter,
} from '../services/searchService';
import { OTHER_PHENOTYPE_LABEL } from '../settings';

type FilterKey = 'Phenotype' | 'Nerve';

interface FilterConfig {
  id: FilterKey;
  placeholder: string;
  searchPlaceholder: string;
}

const filterConfig: FilterConfig[] = [
  {
    id: 'Phenotype',
    placeholder: 'Phenotype',
    searchPlaceholder: 'Search phenotype',
  },
  {
    id: 'Nerve',
    placeholder: 'Nerve',
    searchPlaceholder: 'Search Nerve',
  },
];

const SummaryFiltersDropdown = ({
  nerves,
  phenotypes,
  nerveFilters,
  setNerveFilters,
  phenotypeFilters,
  setPhenotypeFilters,
}: {
  nerves: { [key: string]: string };
  phenotypes: string[];
  nerveFilters: Option[];
  setNerveFilters: React.Dispatch<React.SetStateAction<Option[]>>;
  phenotypeFilters: Option[];
  setPhenotypeFilters: React.Dispatch<React.SetStateAction<Option[]>>;
}) => {
  const convertNervesToOptions = (nerves: {
    [key: string]: string;
  }): Option[] => {
    return Object.keys(nerves).map((nerve) => ({
      id: nerve,
      label: nerves[nerve],
      group: 'Nerve',
      content: [],
    }));
  };

  const convertPhenotypesToOptions = (phenotypes: string[]): Option[] => {
    return phenotypes
      .map((phenotype) => ({
        id: phenotype,
        label: phenotype.toLowerCase(),
        group: 'Phenotype',
        content: [],
      }))
      .filter((phenotype) => phenotype.label !== OTHER_PHENOTYPE_LABEL);
  };

  const phenotypeOptions = useMemo(
    () => convertPhenotypesToOptions(phenotypes),
    [phenotypes],
  );

  const nerveOptions = useMemo(() => convertNervesToOptions(nerves), [nerves]);

  const filterStateMap: {
    [K in FilterKey]: {
      filters: Option[];
      setFilters: React.Dispatch<React.SetStateAction<Option[]>>;
      searchFunction: (value: string) => Option[];
    };
  } = {
    Phenotype: {
      filters: phenotypeFilters,
      setFilters: setPhenotypeFilters,
      searchFunction: (value: string) =>
        searchPhenotypeFilter(value, phenotypeOptions),
    },
    Nerve: {
      filters: nerveFilters,
      setFilters: setNerveFilters,
      searchFunction: (value: string) => searchNerveFilter(value, nerveOptions),
    },
  };

  const handleSelect = (filterKey: FilterKey, selectedOptions: Option[]) => {
    filterStateMap[filterKey].setFilters(selectedOptions);
  };

  return (
    <Box display="flex" gap={1} flexWrap="wrap">
      {filterConfig.map((filter) => (
        <CustomFilterDropdown
          key={filter.id}
          id={filter.id}
          placeholder={filter.placeholder}
          searchPlaceholder={filter.searchPlaceholder}
          selectedOptions={filterStateMap[filter.id].filters}
          onSearch={(searchValue: string) =>
            filterStateMap[filter.id].searchFunction(searchValue)
          }
          onSelect={(options: Option[]) => handleSelect(filter.id, options)}
        />
      ))}
    </Box>
  );
};

export default SummaryFiltersDropdown;
