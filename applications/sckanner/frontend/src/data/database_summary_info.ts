export const sckanInfoText = {
  summary: {
    title: 'What is SCKAN database summary?',
    content:
      'SCKAN database summary is a summary of the connectivity stats in SCKAN.',
  },
  connectivityStats: {
    title: 'SPARC Connectivity Stats',
    content:
      "The SPARC Connectivity Knowledgebase of the Automatic Nervous System (SCKAN) includes the neuronal connectivity models based on the Neuron Phenotype Ontology (NPO). NPO represents various neuron types, including Common Usage Types (CUT) and the types from Evidence-Based Models (EBM) such as ApINATOMY and SPARC’s NLP Curated models. The term 'connectivity' in this context refers to the connections formed by the neuron types or populations among different anatomical regions. Each connectivity statement in NPO models the connections of a single neuron population based on a set of locational phenotypes, in the following form:",
    bulletPoints: [
      'X represents a neuron type or population',
      'A represents the region of the soma location',
      'B represents the region(s) of the axon terminal or the axon sensory terminal',
      'C represents the axon location(s) including any nerve or nerve plexus',
    ],
    note: "So, a connectivity statement of the form 'A to B via Nerve C' denotes the connection of a neuron population originating at Region A and projecting to Region(s) B via Nerve(s) C. Please note that the neuron populations modeled in SCKAN are theoretical in that they do not correspond to identified cell types. In cases where a population projects to multiple targets, we do not differentiate whether this is via axon collaterals or distinct cell types.",
  },
  speciesAndSex: {
    title: 'Species and Sex specificities in SCKAN',
    content:
      "SCKAN models the species and sex of the animal in which the connection was observed. All connections in SCKAN are based on evidence from literature sources and are observed in mammals. Below is a summary of SCKAN's policies on species and sex specificities: ",
    speciesSection: {
      title: 'Species',
      bulletPoints: [
        'Unspecified Species: If no species is specified, the connection has been observed in at least one mammal, but the specific species is considered unknown.',
        'Specified Species: If a species (e.g., rats) is specified, the connection has been observed in that species. However, this does not rule out the possibility of the connection existing in other mammals. Example: A connection observed in rats might also exist in humans, pending further research supported by published literature.',
      ],
    },
    sexSection: {
      title: 'Sex',
      bulletPoints: [
        'Unspecified Sex: If no sex is specied, the connection is assumed to exist in both males and females.',
        'Specified Sex: If sex (e.g., male rats) is specified, the connection has only been observed in that sex, indicating a potential sex-specific difference. Example: A connection specified for male rats means it has not been observed in female rats.',
      ],
    },
  },
  versions: {
    title: 'Versions',
    bulletPoints: ['Composer Version: 3.1.0', 'SCKAN VersionInfo: 2024-04-27'],
    // SCKAN version is retrieved manually from the ttl files inside the composer pod, since the ingestion has been run there
    // the file to look for is phenotype-indicators.ttl
  },
};
