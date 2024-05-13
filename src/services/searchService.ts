// Search origins
import {Option} from "../components/common/Types.ts";
import {SYNONYMS_TITLE} from "../settings.ts";

export const searchOrigins = (searchValue: string, options: Option[]): Option[] => {
    return searchAnatomicalEntities(searchValue, options);
};

export const searchEndOrgans = (searchValue: string, options: Option[]): Option[] => {
    return searchByLabel(searchValue, options);
};

export const searchSpecies = (searchValue: string, options: Option[]): Option[] => {
    return searchByLabel(searchValue, options);
};

export const searchPhenotypes = (searchValue: string, options: Option[]): Option[] => {
    return searchByLabel(searchValue, options);
};

export const searchApiNATOMY = (searchValue: string, options: Option[]): Option[] => {
    return searchByLabel(searchValue, options);
};

export const searchVias = (searchValue: string, options: Option[]): Option[] => {
    return searchAnatomicalEntities(searchValue, options);
};


const searchByLabel = (searchValue: string, options: Option[]): Option[] => {
    const lowerSearchValue = searchValue.toLowerCase();
    return options.filter(option => option.label.toLowerCase().includes(lowerSearchValue));
};

const searchAnatomicalEntities = (searchValue: string, options: Option[]): Option[] => {
    const lowerSearchValue = searchValue.toLowerCase();
    return options.filter(option => {
        const labelMatch = option.label.toLowerCase().includes(lowerSearchValue);
        const synonymMatch = option.content.some(detail =>
            detail.title === SYNONYMS_TITLE && detail.value.toLowerCase().includes(lowerSearchValue)
        );
        return labelMatch || synonymMatch;
    });
};

