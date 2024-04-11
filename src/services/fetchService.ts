import {SCKAN_JSON_URL} from "../settings.ts";

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