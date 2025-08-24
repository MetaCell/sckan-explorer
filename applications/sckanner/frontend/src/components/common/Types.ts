import { KnowledgeStatement } from '../../models/explorer';

export type OptionDetail = {
  title: string; // What to display as the title/label for the property.
  value: string; // The actual value/content for the property.
};
export type Option = {
  id: string;
  label: string;
  group: string;
  content: OptionDetail[];
};

export type LabelIdPair = {
  labels: string[];
  ids: string[];
  expanded: boolean[];
};

export type KsRecord = Record<string, KnowledgeStatement>;

export type KsPerPhenotype = {
  [phenotype: string]: {
    ksIds: string[];
  };
};
// SummaryType - Three types of summary views - default - instruction.
// When user clicks the primary heatmap, the summary view will be displayed.
// When user clicks the secondary heatmap, the detailed summary view will be displayed.
export enum SummaryType {
  Summary = 'summary',
  DetailedSummary = 'detailedSummary',
  Instruction = 'instruction',
}

export type DetailedHeatmapData = {
  label: string;
  data: string[][];
  id: string;
}[];

export type SynapticConnectionsData = {
  label: string;
  directConnections: string[][];
  synapticConnections: string[][][];
  id: string;
}[];

export interface HeatmapMatrixInformation {
  heatmapMatrix: number[][];
  synapticHeatmapMatrix: number[][];
  detailedHeatmap: DetailedHeatmapData;
  synapticConnections: SynapticConnectionsData;
}
export interface HierarchicalItem {
  id: string;
  label: string;
  children: HierarchicalItem[];
  expanded: boolean;
}

export type PhenotypeDetail = {
  label: string;
  color: string;
};

export enum HeatmapMode {
  Default = 'default',
  Synaptic = 'synaptic',
}
