export const sckanInfoText = {
  summary: {
    title: "What is SCKAN database summary?",
    content:
      "SCKAN database summary is a summary of the connectivity stats in SCKAN.",
  },
  connectivityStats: {
    title: "SPARC Connectivity Stats",
    content:
      "The SPARC Connectivity Knowledgebase of the Automatic Nervous System (SCKAN) includes the neuronal connectivity models based on the Neuron Phenotype Ontology (NPO). NPO represents various neuron types, including Common Usage Types (CUT) and the types from Evidence-Based models (EBM) such as ApINATOMY and SPARC’s NLP Curated models. The term 'connectivity' in this context refers to the connections formed by the neuron types or populations among different anatomical regions. Each connectivity statement in NPO models the connections of a single neuron population based on a set of locational phenotypes, in the following form:",
    bulletPoints: [
      "X represents a neuron type or population",
      "A represents the region of the soma location",
      "B represents the region(s) of the axon terminal or the axon sensory terminal",
      "C represents the axon location(s) including any nerve or nerve plexus",
    ],
    note:
      "So, a connectivity statement of the form 'A to B via Nerve C' denotes the connection of a neuron population originating at Region A and projecting to Region(s) B via Nerve(s) C. Please note that the neuron populations modeled in SCKAN are theoretical in that they do not correspond to identified cell types. In cases where a population projects to multiple targets, we do not differentiate whether this is via axon collaterals or distinct cell types.",
  },
};
