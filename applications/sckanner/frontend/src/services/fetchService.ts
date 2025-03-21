import {
  SCKAN_JSON_URL,
  SCKAN_MAJOR_NERVES_JSON_URL,
  SCKAN_ORDER_JSON_URL,
} from '../settings.ts';
import { KnowledgeStatement } from '../models/explorer.ts';
import { mapApiResponseToKnowledgeStatements } from './mappers.ts';
import { JsonData, NerveResponse, OrderJson } from '../models/json.ts';

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

export const fetchKnowledgeStatements = async () => {
  let results: KnowledgeStatement[] = [];
  const url = `/api/knowledge-statements`;

  try {
    // Construct the request body or query params based on API requirements
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse the response and map to KnowledgeStatement objects
    const data = await response.json();
    results = mapApiResponseToKnowledgeStatements(data);
  } catch (error) {
    throw new Error(`Failed to fetch knowledge statements: ${error}`);
  }

  return results;
};
