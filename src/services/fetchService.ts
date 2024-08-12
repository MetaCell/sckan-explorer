import {
  COMPOSER_API_URL,
  SCKAN_JSON_URL,
  SCKAN_MAJOR_NERVES_JSON_URL,
  SCKAN_ORDER_JSON_URL,
} from '../settings.ts';
import { KnowledgeStatement } from '../models/explorer.ts';
import { mapApiResponseToKnowledgeStatements } from './mappers.ts';
import { JsonData, NerveResponse, OrderJson } from '../models/json.ts';

const KNOWLEDGE_STATEMENTS_BATCH_SIZE = 50;

const fetchData = async <T>(url: string): Promise<T> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(`Error fetching data from ${url}: ${error}`);
  }
};

export const fetchJSON = async (): Promise<JsonData> => {
  return await fetchData<JsonData>(SCKAN_JSON_URL);
};

export const fetchOrderJson = async (): Promise<OrderJson> => {
  try {
    return await fetchData<OrderJson>(SCKAN_ORDER_JSON_URL);
  } catch (error) {
    console.warn('Failed to fetch order JSON:', error);
    return {};
  }
};

export const fetchMajorNerves = async (): Promise<NerveResponse> => {
  return await fetchData<NerveResponse>(SCKAN_MAJOR_NERVES_JSON_URL);
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
    let results: KnowledgeStatement[] = [];
    let url = `${COMPOSER_API_URL}/composer/knowledge-statement/?population_uris=${batch.join(',')}`;

    while (url) {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      results = results.concat(mapApiResponseToKnowledgeStatements(data));

      // Check if there is a next page
      url = data.next || null;
    }

    return results;
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
