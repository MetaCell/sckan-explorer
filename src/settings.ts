export const SCKAN_JSON_URL =
  'https://raw.githubusercontent.com/smtifahim/SCKAN-Apps/master/sckan-explorer/json/a-b-via-c-2.json';

export const SCKAN_ORDER_JSON_URL =
  'https://raw.githubusercontent.com/MetaCell/sckan-explorer/feature/order/public/order.json';
export const SCKAN_MAJOR_NERVES_JSON_URL =
  'https://raw.githubusercontent.com/smtifahim/SCKAN-Apps/master/sckan-explorer/json/major-nerves.json';

export const COMPOSER_API_URL = import.meta.env.VITE_COMPOSER_API_URL;
export const SCKAN_DATABASE_SUMMARY_URL_LATEST =
  'https://raw.githubusercontent.com/smtifahim/SCKAN-Apps/master/sckan-explorer/json/sckan-stats/sckan-version-2024-03-04/';

export const SCKAN_DATABASE_SUMMARY_URL_PREVIOUS =
  'https://raw.githubusercontent.com/smtifahim/SCKAN-Apps/master/sckan-explorer/json/sckan-stats/sckan-version-2024-03-04/';

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
