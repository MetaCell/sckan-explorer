import {Box} from "@mui/material";
import CustomFilterDropdown from "./common/CustomFilterDropdown.tsx";
import React from "react";
import {Filters, useDataContext} from "../context/DataContext.ts";
import {searchPlaceholder} from "../services/searchService.ts";
import {Option} from "./common/Types.ts";
import {KnowledgeStatement, Organ} from "../models/explorer.ts";


interface FilterConfig {
    id: keyof Filters;
    placeholder: string;
    searchPlaceholder: string;
    onSearch: (queryString: string, filterType: keyof Filters,
               knowledgeStatements: Record<string, KnowledgeStatement>, organs: Record<string, Organ>) => Option[];
}

const filterConfig: FilterConfig[] = [
    {
        id: "Origin",
        placeholder: "Origin",
        searchPlaceholder: "Search origin",
        onSearch: searchPlaceholder
    },
    {
        id: "EndOrgan",
        placeholder: "End organ",
        searchPlaceholder: "Search End organ",
        onSearch: searchPlaceholder
    },
    {
        id: "Species",
        placeholder: "Species",
        searchPlaceholder: "Search Species",
        onSearch: searchPlaceholder
    },
    {
        id: "Phenotype",
        placeholder: "Phenotype",
        searchPlaceholder: "Search Phenotype",
        onSearch: searchPlaceholder
    },
    {
        id: "apiNATOMY",
        placeholder: "ApiNATOMY",
        searchPlaceholder: "Search ApiNATOMY",
        onSearch: searchPlaceholder
    },
    {
        id: "Via",
        placeholder: "Via",
        searchPlaceholder: "Search Via",
        onSearch: searchPlaceholder
    }
];

const FiltersDropdowns: React.FC = () => {
    const {filters, setFilters, knowledgeStatements, organs} = useDataContext();

    const handleSelect = (filterKey: keyof typeof filters, selectedOptions: Option[]) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [filterKey]: selectedOptions
        }));
    };

    return (
        <Box display="flex" gap={1} flexWrap="wrap">
            {filterConfig.map(filter => (
                <CustomFilterDropdown
                    key={filter.id}
                    placeholder={filter.placeholder}
                    id={filter.id}
                    searchPlaceholder={filter.searchPlaceholder}
                    onSearch={(searchValue: string) => filter.onSearch(searchValue, filter.id, knowledgeStatements, organs)}
                    selectedOptions={filters[filter.id]}
                    onSelect={(options: Option[]) => handleSelect(filter.id as keyof Filters, options)}
                />
            ))}
        </Box>
    );
}

export default FiltersDropdowns;
