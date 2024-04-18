export enum NodeTypes {
    Origin = 'Origin',
    Via = 'Via',
    Destination = 'Destination'
}

export const TypeB60Enum = {
    Axon: 'AXON',
    Dendrite: 'DENDRITE'
} as const;

export type TypeB60Enum = typeof TypeB60Enum[keyof typeof TypeB60Enum];


export const TypeC11Enum = {
    AxonT: 'AXON-T',
    AfferentT: 'AFFERENT-T',
    Unknown: 'UNKNOWN'
} as const;

export type TypeC11Enum = typeof TypeC11Enum[keyof typeof TypeC11Enum];

export interface AnatomicalEntity {
    /**
     *
     * @type {number}
     * @memberof AnatomicalEntity
     */
    'id': number;
    /**
     *
     * @type {AnatomicalEntityMeta}
     * @memberof AnatomicalEntity
     */
    'simple_entity': AnatomicalEntityMeta | null;
    /**
     *
     * @type {AnatomicalEntityIntersection}
     * @memberof AnatomicalEntity
     */
    'region_layer': AnatomicalEntityIntersection | null;
    /**
     *
     * @type {string}
     * @memberof AnatomicalEntity
     */
    'synonyms': string;
}

/**
 *
 * @export
 * @interface AnatomicalEntityIntersection
 */
export interface AnatomicalEntityIntersection {
    /**
     *
     * @type {number}
     * @memberof AnatomicalEntityIntersection
     */
    'id': number;
    /**
     *
     * @type {Layer}
     * @memberof AnatomicalEntityIntersection
     */
    'layer': Layer;
    /**
     *
     * @type {Region}
     * @memberof AnatomicalEntityIntersection
     */
    'region': Region;
}

/**
 *
 * @export
 * @interface AnatomicalEntityMeta
 */
export interface AnatomicalEntityMeta {
    /**
     *
     * @type {number}
     * @memberof AnatomicalEntityMeta
     */
    'id': number;
    /**
     *
     * @type {string}
     * @memberof AnatomicalEntityMeta
     */
    'name': string;
    /**
     *
     * @type {string}
     * @memberof AnatomicalEntityMeta
     */
    'ontology_uri': string;
}

export interface ViaSerializerDetails {
    /**
     *
     * @type {number}
     * @memberof ViaSerializerDetails
     */
    'id': number;
    /**
     *
     * @type {number}
     * @memberof ViaSerializerDetails
     */
    'order': number;
    /**
     *
     * @type {number}
     * @memberof ViaSerializerDetails
     */
    'connectivity_statement_id': number;
    /**
     *
     * @type {TypeB60Enum}
     * @memberof ViaSerializerDetails
     */
    'type'?: TypeB60Enum;
    /**
     *
     * @type {Array<AnatomicalEntity>}
     * @memberof ViaSerializerDetails
     */
    'anatomical_entities': Array<AnatomicalEntity>;
    /**
     *
     * @type {Array<AnatomicalEntity>}
     * @memberof ViaSerializerDetails
     */
    'from_entities': Array<AnatomicalEntity>;
}

export interface DestinationSerializerDetails {
    /**
     *
     * @type {number}
     * @memberof DestinationSerializerDetails
     */
    'id': number;
    /**
     *
     * @type {number}
     * @memberof DestinationSerializerDetails
     */
    'connectivity_statement_id': number;
    /**
     *
     * @type {TypeC11Enum}
     * @memberof DestinationSerializerDetails
     */
    'type'?: TypeC11Enum;
    /**
     *
     * @type {Array<AnatomicalEntity>}
     * @memberof DestinationSerializerDetails
     */
    'anatomical_entities': Array<AnatomicalEntity>;
    /**
     *
     * @type {Array<AnatomicalEntity>}
     * @memberof DestinationSerializerDetails
     */
    'from_entities': Array<AnatomicalEntity>;
}

export interface Region {
    /**
     *
     * @type {number}
     * @memberof Region
     */
    'id': number;
    /**
     *
     * @type {string}
     * @memberof Region
     */
    'name': string;
    /**
     *
     * @type {string}
     * @memberof Region
     */
    'ontology_uri': string;
    /**
     *
     * @type {Array<Layer>}
     * @memberof Region
     */
    'layers': Array<Layer>;
}

/**
 *
 * @export
 * @interface Layer
 */
export interface Layer {
    /**
     *
     * @type {number}
     * @memberof Layer
     */
    'id': number;
    /**
     *
     * @type {string}
     * @memberof Layer
     */
    'name': string;
    /**
     *
     * @type {string}
     * @memberof Layer
     */
    'ontology_uri': string;
}


export interface ForwardConnection {
    id: string;
    knowledge_statement: string;
    type: string;
    origins: AnatomicalEntity[]
}