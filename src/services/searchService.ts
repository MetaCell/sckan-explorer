// Search origins
import {Option} from "../components/common/Types.ts";

export const searchOrigins = (searchValue: string, options: Option[]): Option[] => {
    return options.filter(origin => origin.label.toLowerCase().includes(searchValue.toLowerCase()));
};

// Search end organs
export const searchEndOrgans = (searchValue: string, options: Option[]): Option[] => {
    return options.filter(organ => organ.label.toLowerCase().includes(searchValue.toLowerCase()));
};

// Search species
export const searchSpecies = (searchValue: string, options: Option[]): Option[] => {
    return options.filter(species => species.label.toLowerCase().includes(searchValue.toLowerCase()));
};

// Search phenotypes
export const searchPhenotypes = (searchValue: string, options: Option[]): Option[] => {
    return options.filter(phenotype => phenotype.label.toLowerCase().includes(searchValue.toLowerCase()));
};

// Search ApiNATOMY links
export const searchApiNATOMY = (searchValue: string, options: Option[]): Option[] => {
    return options.filter(api => api.label.toLowerCase().includes(searchValue.toLowerCase()));
};

// Search vias
export const searchVias = (searchValue: string, options: Option[]): Option[] => {
    return options.filter(via => via.label.toLowerCase().includes(searchValue.toLowerCase()));
};
