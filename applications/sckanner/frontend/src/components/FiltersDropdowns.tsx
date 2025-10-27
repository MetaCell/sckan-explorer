import { Box } from '@mui/material';
import CustomFilterDropdown from './common/CustomFilterDropdown.tsx';
import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Filters, useDataContext } from '../context/DataContext.ts';
import { useWidgetStateActions } from '../hooks/useWidgetStateActions.ts';
import { HierarchicalItem, Option } from './common/Types.ts';
import {
  getUniqueApinatomies,
  getUniqueOrgans,
  getUniqueOrigins,
  getUniqueSpecies,
  getUniqueVias,
  getUniqueAllEntities,
  getUniquePhenotypes,
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

  const { updateFilterDropdownSelect } = useWidgetStateActions();

  const containerRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState<number>(0);

  // Calculate how to arrange filters in rows based on available width
  const filterRows = useMemo(() => {
    if (!availableWidth || availableWidth === 0) {
      // If no width detected yet, show all in one row (fallback)
      return [filterConfig];
    }

    const rows: FilterConfig[][] = [];
    let currentRow: FilterConfig[] = [];
    let currentRowWidth = 48; // Account for padding (24px * 2)
    const gapSize = 8; // MUI gap={1} = 8px
    // Use a more aggressive estimate based on the debug data
    // With 635px available and 3 filters fitting at 544px, that's ~181px per filter+gap
    // But let's try 150px to see if we can fit 4 filters per row
    const estimatedFilterWidth = 120;

    filterConfig.forEach((filter) => {
      const filterWidthWithGap =
        estimatedFilterWidth + (currentRow.length > 0 ? gapSize : 0);

      if (currentRowWidth + filterWidthWithGap <= availableWidth) {
        // Filter fits in current row
        currentRow.push(filter);
        currentRowWidth += filterWidthWithGap;
      } else {
        // Start new row
        if (currentRow.length > 0) {
          rows.push(currentRow);
        }
        currentRow = [filter];
        currentRowWidth = 48 + estimatedFilterWidth; // padding + filter width
      }
    });

    // Add the last row if it has filters
    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    return rows;
  }, [availableWidth]);

  // Find the flexlayout__tab container and measure its width
  useEffect(() => {
    const findFlexLayoutTab = () => {
      const container = containerRef.current;
      if (!container) return null;
      // Traverse up the DOM to find the flexlayout__tab element
      let element = container.parentElement;
      while (element) {
        if (element.classList.contains('flexlayout__tab')) {
          return element;
        }
        element = element.parentElement;
      }
      return null;
    };

    const updateWidth = () => {
      const tabContainer = findFlexLayoutTab();
      if (tabContainer) {
        const width = tabContainer.getBoundingClientRect().width;
        setAvailableWidth(width);
      }
    };

    // Initial width measurement
    updateWidth();

    // Set up ResizeObserver to track width changes
    const tabContainer = findFlexLayoutTab();
    if (tabContainer) {
      const resizeObserver = new ResizeObserver(() => {
        updateWidth();
      });
      resizeObserver.observe(tabContainer);
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);

  const { initialFilterOptions } = useDataContext();

  const filteredKnowledgeStatements = useMemo(() => {
    return filterKnowledgeStatements(
      knowledgeStatements,
      hierarchicalNodes,
      filters,
      organs,
    );
  }, [knowledgeStatements, hierarchicalNodes, filters, organs]);

  const isReset = Object.values(filters).every((arr) => arr.length === 0);

  const originsOptions = useMemo(
    () =>
      isReset
        ? initialFilterOptions.Origin
        : getUniqueOrigins(filteredKnowledgeStatements, filteredYAxis),
    [
      isReset,
      initialFilterOptions.Origin,
      filteredKnowledgeStatements,
      filteredYAxis,
    ],
  );

  const speciesOptions = useMemo(
    () =>
      isReset
        ? initialFilterOptions.Species
        : getUniqueSpecies(filteredKnowledgeStatements),
    [isReset, initialFilterOptions.Species, filteredKnowledgeStatements],
  );

  const phenotypesOptions = useMemo(
    () =>
      isReset
        ? initialFilterOptions.Phenotype
        : getUniquePhenotypes(filteredKnowledgeStatements),
    [isReset, initialFilterOptions.Phenotype, filteredKnowledgeStatements],
  );

  const apinatomiesOptions = useMemo(
    () =>
      isReset
        ? initialFilterOptions.apiNATOMY
        : getUniqueApinatomies(filteredKnowledgeStatements),
    [isReset, initialFilterOptions.apiNATOMY, filteredKnowledgeStatements],
  );

  const viasOptions = useMemo(
    () =>
      isReset
        ? initialFilterOptions.Via
        : getUniqueVias(filteredKnowledgeStatements),
    [isReset, initialFilterOptions.Via, filteredKnowledgeStatements],
  );

  const organsOptions = useMemo(
    () =>
      isReset
        ? initialFilterOptions.EndOrgan
        : getUniqueOrgans(filteredXOrgans),
    [isReset, initialFilterOptions.EndOrgan, filteredXOrgans],
  );

  const entitiesOptions = useMemo(
    () =>
      isReset
        ? initialFilterOptions.Entities
        : getUniqueAllEntities(
            filteredKnowledgeStatements,
            filteredYAxis,
            filteredXOrgans,
          ),
    [
      isReset,
      initialFilterOptions.Entities,
      filteredKnowledgeStatements,
      filteredYAxis,
      filteredXOrgans,
    ],
  );

  const handleSelect = (
    filterKey: keyof typeof filters,
    selectedOptions: Option[],
  ) => {
    const newFilter = {
      ...filters,
      [filterKey]: selectedOptions,
    };
    setFilters(newFilter);
    updateFilterDropdownSelect(newFilter);
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
    <Box ref={containerRef} p={3}>
      {filterRows.map((row, rowIndex) => (
        <Box
          key={rowIndex}
          display="flex"
          gap={1}
          mb={rowIndex < filterRows.length - 1 ? 1 : 0}
          flexWrap="nowrap" // Don't wrap within a row since we pre-calculated
        >
          {row.map((filter) => (
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
      ))}
    </Box>
  );
};

export default FiltersDropdowns;
