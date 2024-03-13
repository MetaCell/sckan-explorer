import {TypeB60Enum, TypeC11Enum} from "../../models/composer.ts";

export const MOCKED_composerStatement = {
    "id": 280,
    "sentence_id": 1744,
    "sentence": {
        "id": 1744,
        "title": "neuron type kblad 1 created from neurondm on 20240208131816",
        "text": "neuron type kblad 1 created from neurondm on 20240208131816",
        "pmid": null,
        "pmcid": null,
        "doi": "http://uri.interlex.org/tgbugs/uris/readable/neuron-type-keast-1",
        "batch_name": null,
        "external_ref": null,
        "tags": [],
        "owner": null,
        "owner_id": null,
        "state": "compose_now",
        "modified_date": "2024-02-08T13:19:01.984749",
        "available_transitions": [
            "completed"
        ],
        "connectivity_statements": [
            {
                "id": 280,
                "sentence_id": 1744,
                "knowledge_statement": "neuron type kblad 1",
                "provenances": [
                    {
                        "id": 2198,
                        "uri": "http://www.ncbi.nlm.nih.gov/pubmed/2571623",
                        "connectivity_statement_id": 280
                    },
                    {
                        "id": 2199,
                        "uri": "http://www.ncbi.nlm.nih.gov/pubmed/7644029",
                        "connectivity_statement_id": 280
                    },
                    {
                        "id": 2200,
                        "uri": "http://www.ncbi.nlm.nih.gov/pubmed/4700666",
                        "connectivity_statement_id": 280
                    },
                    {
                        "id": 2201,
                        "uri": "http://www.ncbi.nlm.nih.gov/pubmed/1358408",
                        "connectivity_statement_id": 280
                    },
                    {
                        "id": 2202,
                        "uri": "http://www.ncbi.nlm.nih.gov/pubmed/2713886",
                        "connectivity_statement_id": 280
                    },
                    {
                        "id": 2203,
                        "uri": "http://www.ncbi.nlm.nih.gov/pubmed/30704972",
                        "connectivity_statement_id": 280
                    }
                ],
                "phenotype_id": null,
                "phenotype": null,
                "laterality": null,
                "projection": null,
                "circuit_type": null,
                "species": [],
                "sex_id": null,
                "sex": null,
                "apinatomy_model": null,
                "additional_information": null,
                "owner_id": 7,
                "owner": {
                    "id": 7,
                    "username": "0000-0002-6119-4975",
                    "first_name": "Afonso",
                    "last_name": "Pinto",
                    "email": ""
                }
            }
        ],
        "has_notes": false,
        "pmid_uri": ".",
        "pmcid_uri": ".",
        "doi_uri": "https://doi.org/http://uri.interlex.org/tgbugs/uris/readable/neuron-type-keast-1"
    },
    "knowledge_statement": "neuron type kblad 1",
    "tags": [],
    "provenances": [
        {
            "id": 2198,
            "uri": "http://www.ncbi.nlm.nih.gov/pubmed/2571623",
            "connectivity_statement_id": 280
        },
        {
            "id": 2199,
            "uri": "http://www.ncbi.nlm.nih.gov/pubmed/7644029",
            "connectivity_statement_id": 280
        },
        {
            "id": 2200,
            "uri": "http://www.ncbi.nlm.nih.gov/pubmed/4700666",
            "connectivity_statement_id": 280
        },
        {
            "id": 2201,
            "uri": "http://www.ncbi.nlm.nih.gov/pubmed/1358408",
            "connectivity_statement_id": 280
        },
        {
            "id": 2202,
            "uri": "http://www.ncbi.nlm.nih.gov/pubmed/2713886",
            "connectivity_statement_id": 280
        },
        {
            "id": 2203,
            "uri": "http://www.ncbi.nlm.nih.gov/pubmed/30704972",
            "connectivity_statement_id": 280
        }
    ],
    "owner": {
        "id": 7,
        "username": "0000-0002-6119-4975",
        "first_name": "Afonso",
        "last_name": "Pinto",
        "email": ""
    },
    "owner_id": 7,
    "state": "compose_now",
    "available_transitions": [
        "in_progress"
    ],
    "origins": [
        {
            "id": 48411,
            "name": "inferior hypogastric ganglion",
            "ontology_uri": "http://purl.obolibrary.org/obo/UBERON_0016508"
        }
    ],
    "vias": [
        {
            "id": 2541,
            "order": 0,
            "connectivity_statement_id": 280,
            "type": TypeB60Enum.Axon,
            "anatomical_entities": [
                {
                    "id": 59262,
                    "name": "bladder nerve",
                    "ontology_uri": "http://uri.interlex.org/base/ilx_0793559"
                }
            ],
            "from_entities": [
                {
                    "id": 48411,
                    "name": "inferior hypogastric ganglion",
                    "ontology_uri": "http://purl.obolibrary.org/obo/UBERON_0016508"
                }
            ],
            "are_connections_explicit": false
        }
    ],
    "destinations": [
        {
            "id": 1736,
            "connectivity_statement_id": 280,
            "type": TypeC11Enum.AxonT,
            "anatomical_entities": [
                {
                    "id": 3786,
                    "name": "bladder neck",
                    "ontology_uri": "http://purl.obolibrary.org/obo/UBERON_0001258"
                }
            ],
            "from_entities": [
                {
                    "id": 3786,
                    "name": "bladder neck",
                    "ontology_uri": "http://purl.obolibrary.org/obo/UBERON_0001258"
                },
                {
                    "id": 59262,
                    "name": "bladder nerve",
                    "ontology_uri": "http://uri.interlex.org/base/ilx_0793559"
                }
            ],
            "are_connections_explicit": true
        }
    ],
    "phenotype_id": null,
    "phenotype": null,
    "journey": [
        "from inferior hypogastric ganglion to bladder neck via bladder nerve"
    ],
    "laterality": null,
    "projection": null,
    "circuit_type": null,
    "species": [],
    "sex_id": null,
    "sex": null,
    "forward_connection": [],
    "apinatomy_model": null,
    "additional_information": null,
    "modified_date": "2024-03-12T15:49:42.088916",
    "has_notes": true,
    "statement_preview": "A connection goes from inferior hypogastric ganglion to bladder neck via bladder nerve.\nThis connection projects from the inferior hypogastric ganglion.",
    "errors": []
}