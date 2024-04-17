import {AnatomicalEntity} from "../models/composer.ts";

export interface ComposerResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: KnowledgeStatementAPI[];
}

interface KnowledgeStatementAPI {
    id: number;
    sentence_id: number;
    species: Array<{ name: string, ontology_uri: string }>;
    origins: Array<AnatomicalEntity>;
    destinations: Array<{
        id: number,
        anatomical_entities: Array<AnatomicalEntity>
    }>;
    vias: Array<{
        id: number;
        type: string;
        anatomical_entities: Array<AnatomicalEntity>;
    }>;
    from_entities: Array<AnatomicalEntity>;
    are_connections_explicit: boolean;
    apinatomy_model: string | null;
    phenotype_id: number | null;
    phenotype: { name: string, ontology_uri: string };
    forward_connection: Array<unknown>;
}


export function mapApiResponseToKnowledgeStatements(composerResponse: ComposerResponse) {
    return composerResponse.results.map(ks => ({
        id: ks.id.toString(), // TODO: THis should be the ontology_uri
        phenotype: ks.phenotype?.name || "",
        apinatomy: ks.apinatomy_model || "",
        species: ks.species.map(species => getBaseEntity(species.name, species.ontology_uri)),
        origins: ks.origins.map(origin => getAnatomicalEntity(origin)),
        destinations: ks.destinations.flatMap(dest => dest.anatomical_entities.map(destA => getAnatomicalEntity(destA))),
        via: ks.vias.flatMap(via => via.anatomical_entities.map(viaA => {
            return {...getAnatomicalEntity(viaA), isNerve: false}
        }))
    }));
}


const getBaseEntity = (name: string, uri: string) => {
    return {
        id: uri,
        name
    }
}

const getAnatomicalEntity = (anatomicalEntity: AnatomicalEntity) => {
    return {
        id: getAnatomicalEntityOntologyUri(anatomicalEntity),
        name: getAnatomicalEntityName(anatomicalEntity),
        synonyms: anatomicalEntity.synonyms || ""
    }
}
const getAnatomicalEntityName = (anatomicalEntity: AnatomicalEntity) => {
    if (anatomicalEntity.region_layer) {
        return `${anatomicalEntity.region_layer.region.name} (${anatomicalEntity.region_layer.layer.name})`
    }
    return anatomicalEntity.simple_entity.name
}

const getAnatomicalEntityOntologyUri = (anatomicalEntity: AnatomicalEntity) => {
    if (anatomicalEntity.region_layer) {
        return `${anatomicalEntity.region_layer.region.ontology_uri} (${anatomicalEntity.region_layer.layer.ontology_uri})`
    }
    return anatomicalEntity.simple_entity.ontology_uri
}