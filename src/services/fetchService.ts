import {SCKAN_JSON_URL} from "../settings.ts";
import {KnowledgeStatement} from "../models/explorer.ts";
import {ComposerResponse, mapApiResponseToKnowledgeStatements} from "./composerToExplorerMapper.ts";

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

export const fetchKnowledgeStatements = async (neuronIds: string[]) => {
    // TODO: Expects a /api proxy to -> https://composer.sckan.dev.metacell.us
    const baseUrl = `/api/composer/knowledge-statement/?population_uris=${neuronIds.join(',')}`;
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
            nextUrl = data.next ? new URL(data.next).pathname + new URL(data.next).search : null;
        }
        return results;
    } catch (error) {
        console.error("Failed to fetch knowledge statements:", error);
        return []
    }
}
