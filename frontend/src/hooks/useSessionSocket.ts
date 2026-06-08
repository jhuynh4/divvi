import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Client } from "@stomp/stompjs";

interface SessionEvent {
    type: string;
    shareCode: string;
}

export function useSessionSocket(shareCode?: string) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!shareCode) return;

        const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";
        const wsBase = apiBase
            .replace(/^https:\/\//, "wss://")
            .replace(/^http:\/\//, "ws://")
            .replace(/\/api$/, "");

        const client = new Client({
            brokerURL: `${wsBase}/ws`,
            reconnectDelay: 5000,
            onConnect: () => {
                client.subscribe(`/topic/sessions/${shareCode}`, (message) => {
                    const event: SessionEvent = JSON.parse(message.body);

                    if (event.type === "ASSIGNMENT_UPDATED") {
                        queryClient.invalidateQueries({
                            queryKey: ["assignments", shareCode],
                        });

                        queryClient.invalidateQueries({
                            queryKey: ["summary", shareCode],
                        });
                    }

                    if (event.type === "ITEMS_UPDATED") {
                        queryClient.invalidateQueries({ queryKey: ["receiptItems", shareCode] });
                        queryClient.invalidateQueries({ queryKey: ["assignments", shareCode] });
                        queryClient.invalidateQueries({
                            queryKey: ["summary", shareCode],
                        });
                    }

                    if (event.type == "SESSION_UPDATED" || event.type == "PARTICIPANTS_UPDATED") {
                        queryClient.invalidateQueries(({ queryKey: ["session", shareCode] }));
                        queryClient.invalidateQueries({
                            queryKey: ["summary", shareCode],
                        });
                    }
                });
            },
        });

        client.activate();

        return () => {
            client.deactivate();
        };
    }, [shareCode, queryClient]);
}