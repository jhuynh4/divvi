const API_BASE_URL = 'http://localhost:8080/api';

export async function createSession() {
    const response = await fetch(`${API_BASE_URL}/sessions`, {
        method: 'POST',
    });
    if (!response.ok) {
        throw new Error('Failed to create session');
    }
    return response.json();
}

export async function getSession(shareCode: string) {
    const response = await fetch(
        `${API_BASE_URL}/sessions/${shareCode}`
    );

    if (!response.ok) {
        throw new Error('Failed to fetch session');
    }
    return response.json();
}