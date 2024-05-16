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

export type ksMapType = Record<string, { ks: KnowledgeStatement, count: number }>;
export interface ISubConnections { count: number, color: string[] };

export type DetailedHeatmapData = { label: string, data: Set<string>[], id: string }[];

export interface IHeatmapMatrixInformation {
  heatmapMatrix: number[][];
  detailedHeatmap: DetailedHeatmapData;
}