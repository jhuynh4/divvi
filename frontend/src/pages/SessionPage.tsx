import {useNavigate, useParams} from "react-router-dom";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {Button, Container, VStack} from "@chakra-ui/react";

import {getSession, joinSession} from "../api/sessionApi";
import {SessionHeader} from "../features/session/components/SessionHeader";
import {ParticipantList} from "../features/session/components/ParticipantsList.tsx";
import {JoinSession} from "../features/session/components/JoinSession.tsx";
import {useSessionSocket} from "../hooks/useSessionSocket.ts";
import {useEffect} from "react";
import {ArrowRight} from "lucide-react";

function SessionPage() {
    const {shareCode} = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    useSessionSocket(shareCode);
    const sessionQuery = useQuery({
        queryKey: ['session', shareCode],
        queryFn: () => getSession(shareCode!),
    });
    useEffect(() => {
        if (sessionQuery.data?.status === "COMPLETED") {
            navigate(`/summary/${shareCode}`);
        }
    }, [sessionQuery.data, navigate, shareCode]);
    const joinSessionMutation = useMutation({
        mutationFn: (displayName: string) =>
            joinSession(shareCode!, displayName),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["session", shareCode],
            });
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
                    onAddParticipant={(name) => {
                        joinSessionMutation.mutate(name);
                    }}
                />
                <Button
                    onClick={() => navigate(`/workspace/${shareCode}`)}
                    disabled={sessionQuery.data.participants.length === 0}
                    w="full"
                    h="auto"
                    py="4"
                    bg="gray.900"
                    color="white"
                    borderRadius="2xl"
                    _hover={{ opacity: 0.9 }}
                    _disabled={{ opacity: 0.5, cursor: "not-allowed" }}
                >
                    Start Splitting
                    <ArrowRight size={20} />
                </Button>
            </VStack>
        </Container>
    );
}

export default SessionPage;