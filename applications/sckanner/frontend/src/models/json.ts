type DataType = 'uri' | 'literal';

interface Variable {
  type: DataType;
  value: string;
}

export interface Binding {
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
  C_Type_ID?: Variable;
  B_ID?: Variable;
  B?: Variable;
  Target_Organ_IRI?: Variable;
  Target_Organ?: Variable;
  Target_System_IRI?: Variable;
  Target_System?: Variable;

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

export interface OrderJson {
  [nodeId: string]: string[];
}

interface NerveData {
  type: string;
  value: string;
}

interface NerveBinding {
  Nerve_IRI: NerveData;
  Nerve_Label: NerveData;
}

interface NerveResult {
  bindings: NerveBinding[];
}

export interface NerveResponse {
  head: {
    vars: string[];
  };
  results: NerveResult;
}

export interface Datasnapshot {
  id: number;
  timestamp: string;
  source_id: number;
  source: string;
  version: string;
  a_b_via_c_json_file: string;
  default: boolean;
}
