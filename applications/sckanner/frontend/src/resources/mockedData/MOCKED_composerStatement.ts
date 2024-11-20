import { TypeB60Enum, TypeC11Enum } from '../../models/composer.ts';

export const MOCKED_composerStatement = {
  id: 421,
  sentence_id: 1885,
  sentence: {
    id: 1885,
    title:
      'neuron type bolew unbranched 12 created from neurondm on 20240208131816',
    text: 'neuron type bolew unbranched 12 created from neurondm on 20240208131816',
    pmid: null,
    pmcid: null,
    doi: 'http://uri.interlex.org/tgbugs/uris/readable/neuron-type-bolew-unbranched-12',
    batch_name: null,
    external_ref: null,
    tags: [],
    owner: null,
    owner_id: null,
    state: 'compose_now',
    modified_date: '2024-02-08T13:19:53.977778+01:00',
    available_transitions: ['completed'],
    connectivity_statements: [
      {
        id: 421,
        sentence_id: 1885,
        knowledge_statement: 'neuron type bolew unbranched 12',
        provenances: [
          {
            id: 3807,
            uri: 'http://uri.interlex.org/tgbugs/uris/readable/neuron-type-bolew-unbranched-12',
            connectivity_statement_id: 421,
          },
        ],
        phenotype_id: 1,
        phenotype: {
          id: 1,
          name: 'enteric',
        },
        laterality: 'LEFT',
        projection: 'IPSI',
        circuit_type: 'MOTOR',
        species: [
          {
            id: 3,
            name: 'Cavia porcellus',
            ontology_uri:
              'https://ontobee.org/ontology/NCBITaxon?iri=http://purl.obolibrary.org/obo/NCBITaxon_10141',
          },
        ],
        sex_id: 2,
        sex: {
          id: 2,
          name: 'female',
          ontology_uri: 'http://purl.obolibrary.org/obo/PATO_0000383',
        },
        apinatomy_model: 'This is a test',
        additional_information: null,
        owner_id: 7,
        owner: {
          id: 7,
          username: '0000-0002-6119-4975',
          first_name: 'Afonso',
          last_name: 'Pinto',
          email: '',
        },
      },
    ],
    has_notes: false,
    pmid_uri: '.',
    pmcid_uri: '.',
    doi_uri:
      'https://doi.org/http://uri.interlex.org/tgbugs/uris/readable/neuron-type-bolew-unbranched-12',
  },
  knowledge_statement: 'neuron type bolew unbranched 12',
  tags: [
    {
      id: 7,
      tag: 'important',
    },
  ],
  provenances: [
    {
      id: 3807,
      uri: 'http://uri.interlex.org/tgbugs/uris/readable/neuron-type-bolew-unbranched-12',
      connectivity_statement_id: 421,
    },
  ],
  owner: {
    id: 7,
    username: '0000-0002-6119-4975',
    first_name: 'Afonso',
    last_name: 'Pinto',
    email: '',
  },
  owner_id: 7,
  state: 'exported',
  available_transitions: ['compose_now'],
  origins: [
    {
      id: 137364,
      simple_entity: {
        id: 137365,
        name: 'inferior glossopharyngeal IX ganglion',
        ontology_uri: 'http://purl.obolibrary.org/obo/UBERON_0005360',
      },
      region_layer: null,
      synonyms:
        'extracraniale ganglion, ganglion inferius nervi glossopharyngei, ganglion inferius (nervus glossopharygeus), ganglion inferius nervus glossopharyngei, ganglion of andersch, ganglion petrosum, glossopharyngeal inferior ganglion, glossopharyngeal IX inferior ganglion, glossopharyngeal nerve inferior ganglion, glossopharyngeal nerve petrous ganglion, inferior ganglion of glossopharyngeal nerve, inferior glossopharyngeal ganglion, inferior glossopharyngeal ganglion of the glossopharyngeal (IX) nerve, ninth cranial nerve inferior ganglion, petrosal ganglion, petrous ganglion',
    },
  ],
  vias: [
    {
      id: 4389,
      order: 0,
      connectivity_statement_id: 421,
      type: TypeB60Enum.Axon,
      anatomical_entities: [
        {
          id: 133742,
          simple_entity: {
            id: 133743,
            name: 'carotid sinus nerve',
            ontology_uri: 'http://purl.obolibrary.org/obo/UBERON_0009009',
          },
          region_layer: null,
          synonyms:
            'carotid branch of glossopharyngeal nerve, Hering sinus nerve, ramus sinus carotici, ramus sinus carotici nervi glossopharyngei, ramus sinus carotici nervus glossopharyngei, sinus nerve of Hering',
        },
      ],
      from_entities: [
        {
          id: 137364,
          simple_entity: {
            id: 137365,
            name: 'inferior glossopharyngeal IX ganglion',
            ontology_uri: 'http://purl.obolibrary.org/obo/UBERON_0005360',
          },
          region_layer: null,
          synonyms:
            'extracraniale ganglion, ganglion inferius nervi glossopharyngei, ganglion inferius (nervus glossopharygeus), ganglion inferius nervus glossopharyngei, ganglion of andersch, ganglion petrosum, glossopharyngeal inferior ganglion, glossopharyngeal IX inferior ganglion, glossopharyngeal nerve inferior ganglion, glossopharyngeal nerve petrous ganglion, inferior ganglion of glossopharyngeal nerve, inferior glossopharyngeal ganglion, inferior glossopharyngeal ganglion of the glossopharyngeal (IX) nerve, ninth cranial nerve inferior ganglion, petrosal ganglion, petrous ganglion',
        },
      ],
      are_connections_explicit: false,
    },
  ],
  destinations: [
    {
      id: 2995,
      connectivity_statement_id: 421,
      type: TypeC11Enum.AxonT,
      anatomical_entities: [
        {
          id: 133741,
          simple_entity: {
            id: 133742,
            name: 'carotid sinus',
            ontology_uri: 'http://purl.obolibrary.org/obo/UBERON_0003708',
          },
          region_layer: null,
          synonyms: 'carotid bulb, sinus caroticus',
        },
      ],
      from_entities: [
        {
          id: 133742,
          simple_entity: {
            id: 133743,
            name: 'carotid sinus nerve',
            ontology_uri: 'http://purl.obolibrary.org/obo/UBERON_0009009',
          },
          region_layer: null,
          synonyms:
            'carotid branch of glossopharyngeal nerve, Hering sinus nerve, ramus sinus carotici, ramus sinus carotici nervi glossopharyngei, ramus sinus carotici nervus glossopharyngei, sinus nerve of Hering',
        },
      ],
      are_connections_explicit: false,
    },
    {
      id: 2996,
      connectivity_statement_id: 421,
      type: TypeC11Enum.AxonT,
      anatomical_entities: [
        {
          id: 140764,
          simple_entity: {
            id: 140765,
            name: 'nucleus of solitary tract',
            ontology_uri: 'http://purl.obolibrary.org/obo/UBERON_0009050',
          },
          region_layer: null,
          synonyms:
            'nuclei tractus solitarii, nucleus of the solitary tract, nucleus of the tractus solitarius, nucleus of tractus solitarius, nucleus solitarius, nucleus tracti solitarii, nucleus tractus solitarii, nucleus tractus solitarii medullae oblongatae, solitary nuclear complex, solitary nucleus, solitary tract nucleus',
        },
      ],
      from_entities: [
        {
          id: 133742,
          simple_entity: {
            id: 133743,
            name: 'carotid sinus nerve',
            ontology_uri: 'http://purl.obolibrary.org/obo/UBERON_0009009',
          },
          region_layer: null,
          synonyms:
            'carotid branch of glossopharyngeal nerve, Hering sinus nerve, ramus sinus carotici, ramus sinus carotici nervi glossopharyngei, ramus sinus carotici nervus glossopharyngei, sinus nerve of Hering',
        },
      ],
      are_connections_explicit: false,
    },
  ],
  phenotype_id: 1,
  phenotype: {
    id: 1,
    name: 'enteric',
  },
  journey: [
    'from inferior glossopharyngeal IX ganglion to carotid sinus or nucleus of solitary tract via carotid sinus nerve',
  ],
  laterality: 'LEFT',
  projection: 'IPSI',
  circuit_type: 'MOTOR',
  species: [
    {
      id: 3,
      name: 'Cavia porcellus',
      ontology_uri:
        'https://ontobee.org/ontology/NCBITaxon?iri=http://purl.obolibrary.org/obo/NCBITaxon_10141',
    },
  ],
  sex_id: 2,
  sex: {
    id: 2,
    name: 'female',
    ontology_uri: 'http://purl.obolibrary.org/obo/PATO_0000383',
  },
  forward_connection: [],
  apinatomy_model: 'This is a test',
  additional_information: null,
  modified_date: '2024-04-17T20:50:49.539786+02:00',
  has_notes: true,
  statement_preview:
    'In female Cavia porcellus, the enteric connection goes from inferior glossopharyngeal IX ganglion to carotid sinus or nucleus of solitary tract via carotid sinus nerve.\nThis ipsilateral motor connection projects from the inferior glossopharyngeal IX ganglion and is found on the left side of the body.\n It is described in This is a test model.',
  errors: [],
};
