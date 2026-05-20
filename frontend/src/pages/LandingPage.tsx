import { Button, VStack, Heading } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { createSession } from "../api/sessionApi";
import { useNavigate } from "react-router-dom";

function LandingPage() {
    const navigate = useNavigate();
    const createSessionMutation = useMutation({
        mutationFn: createSession,
        onSuccess: (data) => {
            navigate(`/session/${data.shareCode}`);
        }
    });

    return (
        <VStack minH="100vh" justify="center">
            <Heading>Divvi</Heading>
            <Button
                onClick={() => createSessionMutation.mutate()}
                loading={createSessionMutation.isPending}
            >
                Create Session
            </Button>
        </VStack>
    );
}

export default LandingPage;