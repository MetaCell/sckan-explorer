import {
  AnatomicalEntity,
  TypeB60Enum,
  TypeC11Enum,
} from '../models/composer.ts';
import { Sex, type KnowledgeStatement } from '../models/explorer.ts';

export interface ComposerResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: KnowledgeStatementAPI[];
}

interface KnowledgeStatementAPI {
  id: number;
  sentence_id: number;
  species: Array<{ name: string; ontology_uri: string }>;
  origins: Array<AnatomicalEntity>;
  destinations: Array<{
    id: number;
    anatomical_entities: Array<AnatomicalEntity>;
    from_entities: Array<AnatomicalEntity>;
    type: string;
    connectivity_statement_id: number;
    are_connections_explicit: boolean;
  }>;
  vias: Array<{
    id: number;
    type: string;
    anatomical_entities: Array<AnatomicalEntity>;
    from_entities: Array<AnatomicalEntity>;
    order: number;
    connectivity_statement_id: number;
    are_connections_explicit: boolean;
  }>;
  from_entities: Array<AnatomicalEntity>;
  are_connections_explicit: boolean;
  apinatomy_model: string | null;
  phenotype_id: number | null;
  phenotype: { name: string; ontology_uri: string };
  forward_connection: Array<KnowledgeStatement>;
  reference_uri: string;
  provenances: Array<{
    id: number;
    uri: string;
    connectivity_statement_id: number;
  }>;
  knowledge_statement: string;
  journey: string[];
  laterality: string;
  projection: string;
  circuit_type: string;
  sex: Sex;
  statement_preview: string;
}

export function mapApiResponseToKnowledgeStatements(
  composerResponse: ComposerResponse,
) {
  return composerResponse.results.map((ks) => ({
    id: String(ks.reference_uri),
    phenotype: ks.phenotype?.name || '',
    apinatomy: ks.apinatomy_model || '',
    species: ks.species.map((species) =>
      getBaseEntity(species.name, species.ontology_uri),
    ),
    origins: ks.origins.map((origin) => getAnatomicalEntity(origin)),
    destinations: ks.destinations.flatMap((dest) => {
      const anatomicalEntities = dest.anatomical_entities.map((destA) =>
        getAnatomicalEntity(destA),
      );
      const fromEntities = dest.from_entities.map((fromE) =>
        getAnatomicalEntity(fromE),
      );
      return {
        ...dest,
        anatomical_entities: anatomicalEntities,
        from_entities: fromEntities,
        type: dest.type as TypeC11Enum,
      };
    }),
    vias: ks.vias.flatMap((via) => {
      const anatomicalEntities = via.anatomical_entities.map((viaA) =>
        getAnatomicalEntity(viaA),
      );
      const fromEntities = via.from_entities.map((fromE) =>
        getAnatomicalEntity(fromE),
      );
      return {
        ...via,
        anatomical_entities: anatomicalEntities,
        from_entities: fromEntities,
        type: via.type as TypeB60Enum,
      };
    }),
    forwardConnections: ks.forward_connection,
    provenances: ks.provenances?.map((p) => p.uri || ''),
    knowledge_statement: ks.knowledge_statement || '',
    journey: ks.journey || [],
    laterality: ks.laterality || '',
    projection: ks.projection || '',
    circuit_type: ks.circuit_type || '',
    sex: ks.sex || [],
    statement_preview: ks.statement_preview || '',
  }));
}

const getBaseEntity = (name: string, uri: string) => {
  return {
    id: uri,
    name,
  };
};

const getAnatomicalEntity = (anatomicalEntity: AnatomicalEntity) => {
  return {
    id: getAnatomicalEntityOntologyUri(anatomicalEntity) || '',
    name: getAnatomicalEntityName(anatomicalEntity) || '',
    ontology_uri: getAnatomicalEntityOntologyUri(anatomicalEntity) || '',
    synonyms: anatomicalEntity.synonyms || '',
  };
};
const getAnatomicalEntityName = (anatomicalEntity: AnatomicalEntity) => {
  if (anatomicalEntity.region_layer) {
    return `${anatomicalEntity.region_layer.region.name} (${anatomicalEntity.region_layer.layer.name})`;
  }
  return anatomicalEntity.simple_entity?.name;
};

const getAnatomicalEntityOntologyUri = (anatomicalEntity: AnatomicalEntity) => {
  if (anatomicalEntity.region_layer) {
    return `${anatomicalEntity.region_layer.region.ontology_uri} (${anatomicalEntity.region_layer.layer.ontology_uri})`;
  }
  return anatomicalEntity.simple_entity?.ontology_uri;
};
