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

export async function getAssignments(shareCode: string) {
    const response = await fetch(`${API_BASE_URL}/sessions/${shareCode}/assignments`);

    if (!response.ok) {
        throw new Error("Failed to fetch assignments");
    }

    return response.json();
}

export async function createAssignment(
    shareCode: string,
    itemId: string,
    participantId: string,
    sharePercentage: number
) {
    const response = await fetch(
        `${API_BASE_URL}/sessions/${shareCode}/items/${itemId}/assignments`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                participantId,
                sharePercentage,
            }),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to create assignment");
    }

    return response.json();
}

export async function deleteAssignment(
    shareCode: string,
    assignmentId: string
) {
    const response = await fetch(
        `${API_BASE_URL}/sessions/${shareCode}/assignments/${assignmentId}`,
        {
            method: "DELETE",
        }
    );

    if (!response.ok) {
        throw new Error("Failed to delete assignment");
    }
}

export async function getSummary(shareCode: string) {
    const response = await fetch(`${API_BASE_URL}/sessions/${shareCode}/summary`);

    if (!response.ok) {
        throw new Error("Failed to fetch summary");
    }

    return response.json();
}

export async function completeSession(shareCode: string) {
    const response = await fetch(`${API_BASE_URL}/sessions/${shareCode}/complete`, {
        method: "PATCH",
    });

    if (!response.ok) {
        throw new Error("Failed to complete session");
    }

    return response.json();
}

export async function uploadReceiptImage(
    shareCode: string,
    file: File
) {
    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(
        `${API_BASE_URL}/sessions/${shareCode}/receipt-image`,
        {
            method: "POST",
            body: formData,
        }
    );

    if (!response.ok) {
        throw new Error("Failed to upload receipt image");
    }

    return response.json();
}