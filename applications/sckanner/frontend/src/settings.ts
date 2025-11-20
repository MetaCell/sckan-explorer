export const SCKAN_ORDER_JSON_URL =
  'https://raw.githubusercontent.com/smtifahim/SCKAN-Apps/refs/heads/master/sckan-explorer/json/sckanner-data/order.json';
export const SCKAN_MAJOR_NERVES_JSON_URL =
  'https://raw.githubusercontent.com/smtifahim/SCKAN-Apps/refs/heads/master/sckan-explorer/json/major-nerves.json';

export const SCKAN_DATABASE_SUMMARY_URL_LATEST =
  'https://raw.githubusercontent.com/smtifahim/SCKAN-Apps/refs/heads/master/sckan-explorer/json/sckanner-data/stats/sckan-version-2024-09-21/';

export const SCKAN_DATABASE_SUMMARY_URL_PREVIOUS =
  'https://raw.githubusercontent.com/smtifahim/SCKAN-Apps/refs/heads/master/sckan-explorer/json/sckanner-data/stats/prod/';

export const FILES = {
  POPULATION: 'POPULATION',
  PHENOTYPE: 'PHENOTYPE',
  SPECIES: 'SPECIES',
  CATEGORY: 'CATEGORY',
};

export const DATABASE_FILES = {
  [FILES.POPULATION]: 'stats-model-population-count.json',
  [FILES.PHENOTYPE]: 'stats-phenotype-count.json',
  [FILES.SPECIES]: 'stats-phenotype-value-count.json',
  [FILES.CATEGORY]: 'stats-population-category-count.json',
};

export const OTHER_X_AXIS_ID = 'OTHER_X';
export const OTHER_X_AXIS_LABEL = 'Other';
export const OTHER_PHENOTYPE_LABEL = 'other';
export const SYNONYMS_TITLE = 'synonyms';
export const OTHER_LABEL = 'other';

export const FIXED_FOUR_PHENOTYPE_COLORS_ARRAY = [
  'rgba(155, 24, 216, 1)',
  'rgba(44, 44, 206, 1)',
  'rgba(220, 104, 3, 1)',
  'rgba(234, 170, 8, 1)',
];

export const HIERARCHY_ID_PATH_DELIMITER = '#';

export const DESTINATIONS_ORDER = [
  'cervical spinal cord',
  'thoracic spinal cord',
  'lumbar spinal cord',
  'sacral spinal cord',
  'cervical ganglion',
  'lumbar ganglion',
  'thoracic ganglion',
  'pelvic ganglion',
  'ovary',
  'nerve plexus of descending colon',
];

export const STRINGS_NUMBERS = [
  'first',
  'second',
  'third',
  'fourth',
  'fifth',
  'sixth',
  'seventh',
  'eighth',
  'ninth',
  'tenth',
  'eleventh',
  'twelfth',
  'thirteenth',
  'fourteenth',
  'fifteenth',
  'sixteenth',
  'seventeenth',
  'eighteenth',
  'nineteenth',
  'twentieth',
];

// Get version from Vite environment variable (set at build time)
export const SCKANNER_VERSION = import.meta.env.VITE_APP_VERSION || '3.0.1';
export const COMPOSER_VERSION = '6.0.0';
export const NEURONDM_VERSION = '2025-10-27';
export const KNOWLEDGE_STATEMENTS_BATCH_SIZE = 15;
