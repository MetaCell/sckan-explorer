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
    children: Set<BaseEntity>;
}

export interface AnatomicalEntity extends BaseEntity {
    /**
     *
     * @type {string}
     * @memberof AnatomicalEntity
     */
    synonyms: string;
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
     * @type {Array<AnatomicalEntity>}
     * @memberof KnowledgeStatement
     */
    via: AnatomicalEntity[];
    /**
     *
     * @type {Array<AnatomicalEntity>}
     * @memberof KnowledgeStatement
     */
    origins: AnatomicalEntity[];
    /**
     *
     * @type {Array<AnatomicalEntity>}
     * @memberof KnowledgeStatement
     */
    destinations: AnatomicalEntity[];

    /**
     *
     * @type {Array<string>}
     * @memberof KnowledgeStatement
     */
    forwardConnections: string[];

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
     *  The children of the node
     * @type {Array<string>}w
     * @memberof HierarchicalNode
     */
    children: Set<string>;
    /**
     * The connection details of the node targetOrgan -> KnowledgeStatementsId
     * @type {Record<string, string[]>}
     * @memberof HierarchicalNode
     */
    connectionDetails?: Record<string, string[]>;
}
