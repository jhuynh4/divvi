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

        const client = new Client({
            brokerURL: "ws://localhost:8080/ws",
            reconnectDelay: 5000,
            onConnect: () => {
                client.subscribe(`/topic/sessions/${shareCode}`, (message) => {
                    const event: SessionEvent = JSON.parse(message.body);

                    if (event.type === "ASSIGNMENT_UPDATED") {
                        queryClient.invalidateQueries({
                            queryKey: ["assignments", shareCode],
                        });
                    }

                    if (event.type === "ITEMS_UPDATED") {
                        queryClient.invalidateQueries({ queryKey: ["receiptItems", shareCode] });
                        queryClient.invalidateQueries({ queryKey: ["assignments", shareCode] });
                    }

                    if (event.type == "SESSION_UPDATED" || event.type == "PARTICIPANTS_UPDATED") {
                        queryClient.invalidateQueries(({ queryKey: ["session", shareCode] }));
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