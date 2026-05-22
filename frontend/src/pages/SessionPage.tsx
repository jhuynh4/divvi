import {useNavigate, useParams} from "react-router-dom";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {Container, VStack} from "@chakra-ui/react";

import {getSession, joinSession} from "../api/sessionApi";
import {SessionHeader} from "../features/session/components/SessionHeader";
import {ParticipantList} from "../features/session/components/ParticipantsList.tsx";
import {JoinSession} from "../features/session/components/JoinSession.tsx";

function SessionPage() {
    const {shareCode} = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const sessionQuery = useQuery({
        queryKey: ['session', shareCode],
        queryFn: () => getSession(shareCode!),
    });
    const joinSessionMutation = useMutation({
        mutationFn: (displayName: string) =>
            joinSession(shareCode!, displayName),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["session", shareCode],
            });
            navigate(`/workspace/${shareCode}`);
        },
    });
    if (sessionQuery.isPending) {
        return <div>Loading...</div>;
    }
    if (sessionQuery.isError) {
        return <div>Error loading session</div>;
    }
    return (
        <Container
            maxW="md"
            py={6}
            px={4}
        >
            <VStack gap={6} align="stretch">
                <SessionHeader
                    sessionCode={sessionQuery.data.shareCode}
                />
                <ParticipantList
                    participants={sessionQuery.data.participants}
                />
                <JoinSession
                    onJoin={(name) => {
                        joinSessionMutation.mutate(name);
                    }}
                />
            </VStack>
        </Container>
    );
}

export default SessionPage;