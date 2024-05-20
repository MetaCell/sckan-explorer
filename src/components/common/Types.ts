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

export type KsMapType = Record<string, { ks: KnowledgeStatement, count: number }>;
export type ISubConnections = { count: number, color: string[], ksIds: Set<string> };
export enum SummaryType {
  Summary = 'summary',
  DetailedSummary = 'detailedSummary',
  Instruction = 'instruction'
}

export type DetailedHeatmapData = { label: string, data: Set<string>[], id: string }[];

export interface IHeatmapMatrixInformation {
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