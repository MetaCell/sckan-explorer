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
     * @type {string}
     * @memberof AnatomicalEntity
     */
    'name': string;
    /**
     *
     * @type {string}
     * @memberof AnatomicalEntity
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