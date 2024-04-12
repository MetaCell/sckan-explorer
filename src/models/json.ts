type DataType = 'uri' | 'literal';

interface Variable {
    type: DataType;
    value: string;
}

interface Binding {
    Neuron_ID?: Variable;
    A_L1_ID?: Variable;
    A_L1?: Variable;
    A_L2_ID?: Variable;
    A_L2?: Variable;
    A_L3_ID?: Variable;
    A_L3?: Variable;
    A_ID?: Variable;
    A?: Variable;
    C_ID?: Variable;
    C?: Variable;
    C_Type?: Variable;
    B_ID?: Variable;
    B?: Variable;
    Target_Organ_IRI?: Variable;
    Target_Organ?: Variable;
    [key: string]: Variable | undefined; // This allows for any additional variable that follows the same pattern
}

interface Result {
    bindings: Binding[];
}

interface Head {
    vars: string[];
}

export interface JsonData {
    head: Head;
    results: Result;
}