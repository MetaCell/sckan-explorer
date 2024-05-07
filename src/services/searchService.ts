import {Option} from "../components/common/Types.ts";
import {KnowledgeStatement, Organ} from "../models/explorer.ts";
import {
    getUniqueApinatomies, getUniqueOrgans,
    getUniqueOrigins,
    getUniquePhenotypes,
    getUniqueSpecies,
    getUniqueVias
} from "./filterValuesService.ts";

export const searchPlaceholder = (searchValue: string, filterType: string,
                                  knowledgeStatements: Record<string, KnowledgeStatement>,
                                  organs: Record<string, Organ>): Option[] => {

    let options: Option[] = [];

    switch (filterType) {
        case 'Origin':
            options = getUniqueOrigins(knowledgeStatements);
            break;
        case 'Species':
            options = getUniqueSpecies(knowledgeStatements);
            break;
        case 'Phenotype':
            options = getUniquePhenotypes(knowledgeStatements);
            break;
        case 'apiNATOMY':
            options = getUniqueApinatomies(knowledgeStatements);
            break;
        case 'Via':
            options = getUniqueVias(knowledgeStatements);
            break;
        case "EndOrgan":
            options = getUniqueOrgans(organs)
            break;
        default:
            return []
    }

    return options.filter(option =>
        option.label.toLowerCase().includes(searchValue.toLowerCase())
    );
};
