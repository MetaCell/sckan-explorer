import {
  COMPOSER_API_URL,
  SCKAN_JSON_URL,
  SCKAN_MAJOR_NERVES_JSON_URL,
} from '../settings.ts';
import { KnowledgeStatement } from '../models/explorer.ts';
import { mapApiResponseToKnowledgeStatements } from './mappers.ts';

const KNOWLEDGE_STATEMENTS_BATCH_SIZE = 100;

export const fetchJSON = async () => {
  try {
    const response = await fetch(SCKAN_JSON_URL);
    if (!response.ok) {
      throw new Error(`${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(`Error fetching json data: ${error}`);
  }
};

export const fetchMajorNerves = async () => {
  try {
    const response = await fetch(SCKAN_MAJOR_NERVES_JSON_URL);
    if (!response.ok) {
      throw new Error(`${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(`Error fetching major nerves data: ${error}`);
  }
};

export const fetchKnowledgeStatements = async (neuronIds: string[]) => {
  let results = [] as KnowledgeStatement[];

  // Helper function to create batches
  const createBatches = (ids: string[], size: number) => {
    const batches = [];
    for (let i = 0; i < ids.length; i += size) {
      batches.push(ids.slice(i, i + size));
    }
    return batches;
  };

  // Process each batch
  const fetchBatch = async (batch: string[]) => {
    const url = `${COMPOSER_API_URL}/composer/knowledge-statement/?population_uris=${batch.join(',')}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return mapApiResponseToKnowledgeStatements(data);
  };

  try {
    const batches = createBatches(neuronIds, KNOWLEDGE_STATEMENTS_BATCH_SIZE);
    const batchPromises = batches.map((batch) => fetchBatch(batch));
    const batchResults = await Promise.all(batchPromises);
    results = batchResults.flat();
  } catch (error) {
    throw new Error(
      `Failed to fetch knowledge statements in batches:  ${error}`,
    );
  }

  return results;
};
