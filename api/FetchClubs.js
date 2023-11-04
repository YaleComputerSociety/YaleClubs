import { API_KEY } from "@env";

const url = "https://yalies.io/api/groups";

export const fetchClubs = async (defaultPayload) => {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
            },
            body: JSON.stringify(defaultPayload),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error("API Request Error:", error);
        throw error;
    }
}
