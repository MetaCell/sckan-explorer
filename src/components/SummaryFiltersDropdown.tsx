import { useMemo } from "react";
import { SummaryFilters, useDataContext } from "../context/DataContext";
import CustomFilterDropdown from "./common/CustomFilterDropdown";
import { Option, PhenotypeDetail } from "./common/Types";
import { Box } from "@mui/material";
import { searchNerveFilter, searchPhenotypeFilter } from "../services/searchService";
import { OTHER_LABEL } from "../constants";

interface FilterConfig {
	id: keyof SummaryFilters;
	placeholder: string;
	searchPlaceholder: string;
}

const filterConfig: FilterConfig[] = [
	{
		id: "Phenotype",
		placeholder: "Phenotype",
		searchPlaceholder: "Search phenotype",
	},
	{
		id: "Nerve",
		placeholder: "Nerve",
		searchPlaceholder: "Search Nerve",
	}
]

const SummaryFiltersDropdown = ({ nerves, phenotypes }: {
	nerves: { [key: string]: string },
	phenotypes: PhenotypeDetail[]
}) => {
	const { summaryFilters, setSummaryFilters, knowledgeStatements, organs } = useDataContext();

	const convertNervesToOptions = (nerves: { [key: string]: string }): Option[] => {
		return Object.keys(nerves).map(nerve => ({
			id: nerve,
			label: nerves[nerve],
			group: 'Nerve',
			content: []
		}));
	}
	const convertPhenotypesToOptions = (phenotypes: PhenotypeDetail[]): Option[] => {
		// filter the phenotype where label is other
		return phenotypes.map(phenotype => ({
			id: phenotype.label,
			label: phenotype.label,
			group: 'Phenotype',
			content: []
		})).filter(phenotype => phenotype.label !== OTHER_LABEL);
	}

	const phenotypeOptions = useMemo(() => convertPhenotypesToOptions(phenotypes), [phenotypes]);
	const nerveOptions = useMemo(() => convertNervesToOptions(nerves), [nerves]);

	const handleSelect = (filterKey: keyof typeof summaryFilters, selectedOptions: Option[]) => {
		setSummaryFilters(prevFilters => ({
			...prevFilters,
			[filterKey]: selectedOptions
		}));
	};

	const searchFunctions = {
		Phenotype: (value: string) => searchPhenotypeFilter(value, phenotypeOptions),
		Nerve: (value: string) => searchNerveFilter(value, nerveOptions)
	};

	return (
		<Box display="flex" gap={1} flexWrap="wrap">
			{filterConfig.map(filter => (
				<CustomFilterDropdown
					key={filter.id}
					id={filter.id}
					placeholder={filter.placeholder}
					searchPlaceholder={filter.searchPlaceholder}
					selectedOptions={summaryFilters[filter.id]}
					onSearch={(searchValue: string) => searchFunctions[filter.id](searchValue)}
					onSelect={(options: Option[]) => handleSelect(filter.id as keyof SummaryFilters, options)}
				/>
			))}
		</Box>
	)

}

export default SummaryFiltersDropdown;