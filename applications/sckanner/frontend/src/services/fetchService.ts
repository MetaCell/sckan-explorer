import {
  SCKAN_MAJOR_NERVES_JSON_URL,
  SCKAN_ORDER_JSON_URL,
} from '../settings.ts';
import { KnowledgeStatement } from '../models/explorer.ts';
import { mapApiResponseToKnowledgeStatements } from './mappers.ts';
import {
  Datasnapshot,
  JsonData,
  NerveResponse,
  OrderJson,
} from '../models/json.ts';

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

export const fetchJSON = async (url: string): Promise<JsonData> => {
  return await fetchData<JsonData>(url);
};

export const fetchOrderJson = async (): Promise<OrderJson> => {
  try {
    return await fetchData<OrderJson>(SCKAN_ORDER_JSON_URL);
  } catch (error) {
    throw new Error(
      `Failed to fetch organ hierarchy order from GitHub: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const fetchMajorNerves = async (): Promise<NerveResponse> => {
  try {
    return await fetchData<NerveResponse>(SCKAN_MAJOR_NERVES_JSON_URL);
  } catch (error) {
    throw new Error(
      `Failed to fetch major nerves data from GitHub: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const fetchEndorgansOrder = async (): Promise<
  Record<string, string[]>
> => {
  try {
    return await fetchData<Record<string, string[]>>(
      'https://raw.githubusercontent.com/ddelpiano/SCKAN-Apps/refs/heads/master/sckan-explorer/json/sckanner-data/hierarchy/endorgansHierarchy.json',
    );
  } catch (error) {
    throw new Error(
      `Failed to fetch end organs hierarchy from GitHub: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const fetchDatasnapshots = async (): Promise<Datasnapshot[]> => {
  const url = `/api/datasnapshots`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

export const fetchKnowledgeStatements = async (datasnapshot_id: string) => {
  let results: KnowledgeStatement[] = [];
  const url = `/api/knowledge-statements?datasnapshot_id=${datasnapshot_id}`;

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
