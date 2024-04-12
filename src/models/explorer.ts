export interface Organ {
    /**
     *
     * @type {string}
     * @memberof Organ
     */
    id: string;
    /**
     *
     * @type {string}
     * @memberof Organ
     */
    name: string;
    /**
     *
     * @type {Array<string>}
     * @memberof Organ
     */
    children?: string[];
}

export interface Via {
    /**
     *
     * @type {string}
     * @memberof Via
     */
    id: string;
    /**
     *
     * @type {string}
     * @memberof Via
     */
    name: string;
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
    species: string[];
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
    origins: string[];
    /**
     *
     * @type {Array<string>}
     * @memberof KnowledgeStatement
     */
    destinations: string[];
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
     * The connection details of the node targetOrgan -> KnowledgeStatements
     * @type {Record<string, KnowledgeStatement[]>}
     * @memberof HierarchicalNode
     */
    connectionDetails?: Record<string, KnowledgeStatement[]>;
}
