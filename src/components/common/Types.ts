import { KnowledgeStatement } from "../../models/explorer";

export type OptionDetail = {
  title: string; // What to display as the title/label for the property.
  value: string; // The actual value/content for the property.
};
export type Option = {
  id: string;
  label: string;
  group: string;
  content: OptionDetail[];
}

export type LabelIdPair = { labels: string[], ids: string[] };

export type KsMapType = Record<string, KnowledgeStatement>;

export type PhenotypeKsIdMap = {
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
  Instruction = 'instruction'
}

export type DetailedHeatmapData = { label: string, data: string[][], id: string }[];

export interface HeatmapMatrixInformation {
  heatmapMatrix: number[][];
  detailedHeatmap: DetailedHeatmapData;
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