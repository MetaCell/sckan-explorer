import {AnatomicalEntity, BaseEntity, KnowledgeStatement, Organ} from "../models/explorer";
import {Option} from "../components/common/Types.ts";


const mapEntityToOption = (entities: BaseEntity[]): Option[] =>
    entities.map(entity => ({
        id: entity.id,
        label: entity.name,
        group: '',
        content: []
    }));

const getUniqueEntities = (entities: BaseEntity[]): Option[] => {
    const uniqueMap = new Map<string, BaseEntity>();
    entities.forEach(entity => {
        uniqueMap.set(entity.id, entity); // This ensures that each ID has only one entry
    });
    return mapEntityToOption(Array.from(uniqueMap.values()));
};


export const getUniqueOrigins = (knowledgeStatements: Record<string, KnowledgeStatement>): Option[] => {
    let origins: AnatomicalEntity[] = [];
    Object.values(knowledgeStatements).forEach(ks => {
        origins = origins.concat(ks.origins);
    });
    return getUniqueEntities(origins);
};

export const getUniqueVias = (knowledgeStatements: Record<string, KnowledgeStatement>): Option[] => {
    let vias: AnatomicalEntity[] = [];
    Object.values(knowledgeStatements).forEach(ks => {
        vias = vias.concat(ks.via);
    });
    return getUniqueEntities(vias);
};

export const getUniqueSpecies = (knowledgeStatements: Record<string, KnowledgeStatement>): Option[] => {
    let species: BaseEntity[] = [];
    Object.values(knowledgeStatements).forEach(ks => {
        species = species.concat(ks.species);
    });
    return getUniqueEntities(species);
};


export const getUniqueOrgans = (organs: Organ[]): Option[] => {

    return organs.map(organ => ({
        id: organ.id,
        label: organ.name,
        group: "",
        content: []
    }));
};


function mapNameToOption(items: Set<string>) {
    return Array.from(items).map((item) => ({
        id: item,
        label: item,
        group: '',
        content: []
    }));
}

export const getUniqueApinatomies = (knowledgeStatements: Record<string, KnowledgeStatement>): Option[] => {
    const apinatomies = new Set<string>();
    Object.values(knowledgeStatements).forEach(ks => {
        if (ks.apinatomy) {
            apinatomies.add(ks.apinatomy);
        }
    });
    return mapNameToOption(apinatomies);
};

export const getUniquePhenotypes = (knowledgeStatements: Record<string, KnowledgeStatement>): Option[] => {

    const phenotypes = new Set<string>();
    Object.values(knowledgeStatements).forEach(ks => {
        if (ks.phenotype) {
            phenotypes.add(ks.phenotype);
        }
    });
    return mapNameToOption(phenotypes);
};
