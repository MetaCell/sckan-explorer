interface PropertyValuePair {
    label: string;
    value: number;
}
interface NeuronPopulations {
    title: string;
    total_sparc_neuron_populations: PropertyValuePair;
    apinatomy_models: PropertyValuePair;
    sparc_nlp_curated: {
        label: string;
        value: number;
        changes: string;
    };
    cut: PropertyValuePair;
    markram: PropertyValuePair;
    huang: PropertyValuePair;
    notes: string;
}

interface LocationalPhenotypes {
    title: string;
    total_count_of_locational_phenotypes: PropertyValuePair;
    apinatomy_models: PropertyValuePair;
    sparc_nlp_curated: {
        label: string;
        value: number;
        changes: string;
    };
    notes: string;
}

interface SPARCConnections {
    title: string;
    total_number_of_a_to_b_via_nerve_c_sparc_connections: PropertyValuePair;
    apinatomy_models: PropertyValuePair;
    sparc_nlp_curated: {
        label: string;
        value: number;
        changes: string;
    };
    notes: string;
}

interface DatabaseSummary {
    sparc_neuron_populations: NeuronPopulations;
    locational_phenotypes: LocationalPhenotypes;
    sparc_connections: SPARCConnections;
}

const data: DatabaseSummary = {
    sparc_neuron_populations: {
        title: 'SPARC Neuron Populations',
        total_sparc_neuron_populations: { label: 'Total SPARC Neuron Populations', value: 700 },
        apinatomy_models: { label: 'ApINATOMY Models', value: 288 },
        sparc_nlp_curated: {
            label: 'SPARC NLP Curated',
            value: 114,
            changes: "2023-12-31"
        },
        cut: { label: 'Common Usage Types (CUT)', value: 122 },
        markram: { label: 'Markram 2015 Models', value: 77 },
        huang: { label: 'Huang 2017 Models', value: 18 },
        notes: 'SPARC connectivity only includes populations from ApINATOMY and NLP curated neuron populations. Neuron types from CUT and other evidence based models (EBM) are not considered for the SPARC project.'
    },
    locational_phenotypes: {
        title: 'Locational phenotypes',
        total_count_of_locational_phenotypes: { label: 'Total count of locational phenotypes in SPARC Populations', value: 700 },
        apinatomy_models: { label: 'ApINATOMY Models', value: 288 },
        sparc_nlp_curated: {
            label: 'SPARC NLP Curated',
            value: 114,
            changes: "2023-12-31"
        },
        notes: 'SPARC connectivity only includes populations from ApINATOMY and NLP curated neuron populations. Neuron types from CUT and other evidence based models (EBM) are not considered for the SPARC project.'
    },
    sparc_connections: {
        title: 'SPARC Connections',
        total_number_of_a_to_b_via_nerve_c_sparc_connections: { label: 'Total number of ‘A to B via Nerve C’ SPARC Connections', value: 700 },
        apinatomy_models: { label: 'ApINATOMY Models', value: 288 },
        sparc_nlp_curated: {
            label: 'SPARC NLP Curated',
            value: 114,
            changes: "2023-12-31"
        },
        notes: 'SPARC connectivity only includes populations from ApINATOMY and NLP curated neuron populations'
    }
};

export default data;
