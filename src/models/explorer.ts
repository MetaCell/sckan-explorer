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
}

export interface AnatomicalEntity extends BaseEntity {
    /**
     *
     * @type {string}
     * @memberof AnatomicalEntity
     */
    synonyms: string;
}

export interface Via extends AnatomicalEntity {
    /**
     *
     * @type {boolean}
     * @memberof Via
     */
    isNerve: boolean;
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
     * @type {Array<string>}
     * @memberof KnowledgeStatement
     */
    species: BaseEntity[];
    /**
     *
     * @type {Array<Via>}
     * @memberof KnowledgeStatement
     */
    via: Via[];
    /**
     *
     * @type {Array<string>}
     * @memberof KnowledgeStatement
     */
    origins: AnatomicalEntity[];
    /**
     *
     * @type {Array<string>}
     * @memberof KnowledgeStatement
     */
    destinations: AnatomicalEntity[];
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
     * @type {Record<string, KnowledgeStatement[]>}
     * @memberof HierarchicalNode
     */
    connectionDetails?: Record<string, string[]>;
}
