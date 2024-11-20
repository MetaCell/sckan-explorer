import { KsPerPhenotype } from '../components/common/Types';
import { TypeB60Enum, TypeC11Enum } from './composer';

export interface BaseEntity {
  /**
   *
   * @type {string}
   * @memberof BaseEntity
   */
  id: string;
  /**
   *
   * @type {string}
   * @memberof BaseEntity
   */
  name: string;
}

export interface Organ extends BaseEntity {
  children: Map<string, BaseEntity>;

  order: number;
}

export interface AnatomicalEntity extends BaseEntity {
  /**
   *
   * @type {string}
   * @memberof AnatomicalEntity
   */
  synonyms: string;
  /**
   *
   * @type {string}
   * @memberof AnatomicalEntity
   */
  ontology_uri?: string;
}

// The following Serializer uses - AnatomicalEntity from {explorer.ts}
export interface DestinationExplorerSerializerDetails {
  /**
   *
   * @type {number}
   * @memberof DestinationSerializerDetails
   */
  id: number;
  /**
   *
   * @type {number}
   * @memberof DestinationSerializerDetails
   */
  connectivity_statement_id: number;
  /**
   *
   * @type {TypeC11Enum}
   * @memberof DestinationSerializerDetails
   */
  type?: TypeC11Enum;
  /**
   *
   * @type {Array<AnatomicalEntity>}
   * @memberof DestinationSerializerDetails
   */
  anatomical_entities: Array<AnatomicalEntity>;
  /**
   *
   * @type {Array<AnatomicalEntity>}
   * @memberof DestinationSerializerDetails
   */
  from_entities: Array<AnatomicalEntity>;
  /**
   *
   * @type {boolean}
   * @memberof DestinationSerializerDetails
   */
  are_connections_explicit: boolean;
}

export interface ForwardConnection {
  id: string;
  knowledge_statement: string;
  type: string;
  origins: AnatomicalEntity[];
}

export interface ViaExplorerSerializerDetails {
  /**
   *
   * @type {number}
   * @memberof ViaSerializerDetails
   */
  id: number;
  /**
   *
   * @type {number}
   * @memberof ViaSerializerDetails
   */
  order: number;
  /**
   *
   * @type {number}
   * @memberof ViaSerializerDetails
   */
  connectivity_statement_id: number;
  /**
   *
   * @type {TypeB60Enum}
   * @memberof ViaSerializerDetails
   */
  type?: TypeB60Enum;
  /**
   *
   * @type {Array<AnatomicalEntity>}
   * @memberof ViaSerializerDetails
   */
  anatomical_entities: Array<AnatomicalEntity>;
  /**
   *
   * @type {Array<AnatomicalEntity>}
   * @memberof ViaSerializerDetails
   */
  from_entities: Array<AnatomicalEntity>;
  /**
   *
   * @type {boolean}
   * @memberof ViaSerializerDetails
   */
  are_connections_explicit: boolean;
}

export interface Sex {
  // three id - number, name - string, ontology_uri - string
  /**
   *
   * @type {number}
   * @memberof Sex
   */
  id: number;
  /**
   *
   * @type {string}
   * @memberof Sex
   */
  name: string;
  /**
   *
   * @type {string}
   * @memberof Sex
   */
  ontology_uri: string;
}

export type EntitiesNameWithId = {
  label: string;
  id: string;
};

export type EntitiesJourneyType = {
  origins: string[];
  vias: string[];
  destinations: string[];
};

export type ComposerEntitiesJourneyType = {
  origins: EntitiesNameWithId[];
  vias: EntitiesNameWithId[];
  destinations: EntitiesNameWithId[];
};

export interface KnowledgeStatement {
  /**
   *
   * @type {string}
   * @memberof KnowledgeStatement
   */
  id: string;
  /**
   *
   * @type {string}
   * @memberof KnowledgeStatement
   */
  phenotype: string;
  /**
   *
   * @type {string}
   * @memberof KnowledgeStatement
   */
  apinatomy: string;
  /**
   *
   * @type {Array<BaseEntity>}
   * @memberof KnowledgeStatement
   */
  species: BaseEntity[];
  /**
   *
   * @type {Array<ViaExplorerSerializerDetails>}
   * @memberof KnowledgeStatement
   */
  vias: ViaExplorerSerializerDetails[];
  /**
   *
   * @type {Array<AnatomicalEntity>}
   * @memberof KnowledgeStatement
   */
  origins: AnatomicalEntity[];
  /**
   *
   * @type {Array<DestinationExplorerSerializerDetails>}
   * @memberof KnowledgeStatement
   */
  destinations: DestinationExplorerSerializerDetails[];

  /**
   *
   * @type {Array<KnowledgeStatement>}
   * @memberof KnowledgeStatement
   */
  forwardConnections: KnowledgeStatement[];

  /**
   *
   * @type {Array<string>}
   * @memberof KnowledgeStatement
   */
  provenances: string[];

  /**
   *
   * @type {string}
   * @memberof KnowledgeStatement
   */
  knowledge_statement: string;

  /**
   *
   * @type {Array<string>}
   * @memberof KnowledgeStatement
   */
  journey: string[];

  /**
   *
   * @type {Array<string>}
   * @memberof KnowledgeStatement
   */
  entities_journey: ComposerEntitiesJourneyType[];

  /**
   *
   * @type {string}
   * @memberof KnowledgeStatement
   */
  laterality: string;

  /**
   *
   * @type {string}
   * @memberof KnowledgeStatement
   */
  projection: string;

  /**
   *
   * @type {string}
   * @memberof KnowledgeStatement
   */
  circuit_type: string;

  /**
   *
   * @type {Array<string>}
   * @memberof KnowledgeStatement
   */
  sex: Sex;

  /**
   *
   * @type {string}
   * @memberof KnowledgeStatement
   */
  statement_preview: string;
}

export interface HierarchicalNode {
  /**
   *
   * @type {string}
   * @memberof HierarchicalNode
   */
  id: string;
  /**
   *
   * @type {string}
   * @memberof HierarchicalNode
   */
  name: string;
  /**
   * URI of the node
   *
   * @type {string}
   * @memberof HierarchicalNode
   */
  uri: string;
  /**
   *  The children of the node
   * @type {Set<string>}
   * @memberof HierarchicalNode
   */
  children: Set<string>;
  /**
   * The connection details of the node TargetOrgan -> Destination -> KnowledgeStatementsId
   * @type {Record<string, Record<string, string[]>>}
   * @memberof HierarchicalNode
   */
  connectionDetails?: Record<string, Record<string, string[]>>;
}

export interface SortedResults {
  data: KsPerPhenotype[][];
  total: number;
}
