import {COMPOSER_API_URL, SCKAN_JSON_URL, SCKAN_MAJOR_NERVES_JSON_URL} from "../settings.ts";
import {KnowledgeStatement} from "../models/explorer.ts";
import {ComposerResponse, mapApiResponseToKnowledgeStatements} from "./mappers.ts";

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
    const baseUrl = `${COMPOSER_API_URL}/composer/knowledge-statement/?population_uris=${neuronIds.join(',')}`;
    let results = [] as KnowledgeStatement[];
    let nextUrl: string | null = baseUrl;

    try {
        while (nextUrl) {
            const response = await fetch(nextUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: ComposerResponse = await response.json();
            results = results.concat(mapApiResponseToKnowledgeStatements(data));
            nextUrl = data.next;
        }
        return results;
    } catch (error) {
        console.error("Failed to fetch knowledge statements:", error);
        return []
    }
}
