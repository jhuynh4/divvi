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

export async function joinSession(shareCode: string, displayName: string) {
    const response = await fetch(`${API_BASE_URL}/sessions/${shareCode}/participants`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({displayName}),
    });

    if (!response.ok) {
        throw new Error("Failed to join session");
    }

    return response.json();
}

export async function updateSession(
    shareCode: string,
    data: { taxAmount: number; tipAmount: number }
) {
    const response = await fetch(`${API_BASE_URL}/sessions/${shareCode}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error("Failed to update session");
    }

    return response.json();
}

export async function getReceiptItems(shareCode: string) {
    const response = await fetch(`${API_BASE_URL}/sessions/${shareCode}/items`);

    if (!response.ok) {
        throw new Error("Failed to fetch receipt items");
    }

    return response.json();
}

export async function createReceiptItem(
    shareCode: string,
    item: { name: string; price: number }
) {
    const response = await fetch(`${API_BASE_URL}/sessions/${shareCode}/items`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
    });

    if (!response.ok) {
        throw new Error("Failed to create receipt item");
    }

    return response.json();
}

export async function updateReceiptItem(
    shareCode: string,
    itemId: string,
    item: { name: string; price: number }
) {
    const response = await fetch(
        `${API_BASE_URL}/sessions/${shareCode}/items/${itemId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(item),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to update receipt item");
    }

    return response.json();
}

export async function deleteReceiptItem(
    shareCode: string,
    itemId: string
) {
    const response = await fetch(
        `${API_BASE_URL}/sessions/${shareCode}/items/${itemId}`,
        {
            method: "DELETE",
        }
    );

    if (!response.ok) {
        throw new Error("Failed to delete receipt item");
    }
}

