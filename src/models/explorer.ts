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
     * @type {Array<string>}
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
