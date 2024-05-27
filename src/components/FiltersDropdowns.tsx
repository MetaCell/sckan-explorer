import {Box} from "@mui/material";
import CustomFilterDropdown from "./common/CustomFilterDropdown.tsx";
import React, {useMemo} from "react";
import {Filters, useDataContext} from "../context/DataContext.ts";
import { Option } from "./common/Types.ts";
import {
    getUniqueApinatomies, getUniqueOrgans,
    getUniqueOrigins,
    getUniquePhenotypes,
    getUniqueSpecies, getUniqueVias
} from "../services/filterValuesService.ts";
import {
    searchApiNATOMY,
    searchEndOrgans,
    searchOrigins,
    searchPhenotypes,
    searchSpecies, searchVias
} from "../services/searchService.ts";

interface FilterConfig {
    id: keyof Filters;
    placeholder: string;
    searchPlaceholder: string;
}

const filterConfig: FilterConfig[] = [
    {
        id: "Origin",
        placeholder: "Origin",
        searchPlaceholder: "Search origin",
    },
    {
        id: "EndOrgan",
        placeholder: "End organ",
        searchPlaceholder: "Search End organ",
    },
    {
        id: "Species",
        placeholder: "Species",
        searchPlaceholder: "Search Species",
    },
    {
        id: "Phenotype",
        placeholder: "Phenotype",
        searchPlaceholder: "Search Phenotype",
    },
    {
        id: "apiNATOMY",
        placeholder: "ApiNATOMY",
        searchPlaceholder: "Search ApiNATOMY",
    },
    {
        id: "Via",
        placeholder: "Via",
        searchPlaceholder: "Search Via",
    }
];

const FiltersDropdowns: React.FC = () => {
    const {filters, setFilters, knowledgeStatements, organs} = useDataContext();

    const originsOptions = useMemo(() => getUniqueOrigins(knowledgeStatements), [knowledgeStatements]);
    const speciesOptions = useMemo(() => getUniqueSpecies(knowledgeStatements), [knowledgeStatements]);
    const phenotypesOptions = useMemo(() => getUniquePhenotypes(knowledgeStatements), [knowledgeStatements]);
    const apinatomiesOptions = useMemo(() => getUniqueApinatomies(knowledgeStatements), [knowledgeStatements]);
    const viasOptions = useMemo(() => getUniqueVias(knowledgeStatements), [knowledgeStatements]);
    const organsOptions = useMemo(() => getUniqueOrgans(organs), [organs]);

    const handleSelect = (filterKey: keyof typeof filters, selectedOptions: Option[]) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [filterKey]: selectedOptions
        }));
    };

    const searchFunctions = {
        Origin: (value: string) => searchOrigins(value, originsOptions),
        EndOrgan: (value: string) => searchEndOrgans(value, organsOptions),
        Species: (value: string) => searchSpecies(value, speciesOptions),
        Phenotype: (value: string) => searchPhenotypes(value, phenotypesOptions),
        apiNATOMY: (value: string) => searchApiNATOMY(value, apinatomiesOptions),
        Via: (value: string) => searchVias(value, viasOptions)
    };

    return (
        <Box display="flex" gap={1} flexWrap="wrap">
            {filterConfig.map(filter => (
                <CustomFilterDropdown
                    key={filter.id}
                    id={filter.id}
                    placeholder={filter.placeholder}
                    searchPlaceholder={filter.searchPlaceholder}
                    selectedOptions={filters[filter.id]}
                    onSearch={(searchValue: string) => searchFunctions[filter.id](searchValue)}
                    onSelect={(options: Option[]) => handleSelect(filter.id as keyof Filters, options)}
                />
            ))}
        </Box>
    );
}

export default FiltersDropdowns;
