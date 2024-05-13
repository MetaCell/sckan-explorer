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

export type SummaryType = 'summary' | 'detailedSummary' | 'instruction';

export type KSIDAndOriginType = { origin_name: string, ksIds: string[] }[]
export type ksMapType = Record<string, { ks: KnowledgeStatement, count: number }>;
export type PhenotypeDetail = {
  label: string;
  color: string;
};