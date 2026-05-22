import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Box,
    Container,
    VStack,
    HStack,
    Button,
    Text,
    Badge,
    Avatar,
} from "@chakra-ui/react";
import {ArrowLeft, Check, CheckCircle2} from "lucide-react";

import { getSummary, completeSession } from "../api/sessionApi";

const PARTICIPANT_COLORS = [
    "#10b981",
    "#3b82f6",
    "#8b5cf6",
    "#f59e0b",
    "#ec4899",
    "#14b8a6",
    "#f97316",
];

interface ParticipantSummary {
    participantId: string;
    participantName: string;
    itemSubtotal: number;
    taxShare: number;
    tipShare: number;
    totalOwed: number;
}

interface SessionSummary {
    shareCode: string;
    status: string;
    subtotal: number;
    taxAmount: number;
    tipAmount: number;
    grandTotal: number;
    participants: ParticipantSummary[];
}

function SummaryPage() {
    const { shareCode } = useParams<{ shareCode: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const summaryQuery = useQuery({
        queryKey: ["summary", shareCode],
        queryFn: () => getSummary(shareCode!),
    });

    const completeSessionMutation = useMutation({
        mutationFn: () => completeSession(shareCode!),
        onSuccess: () => {
            queryClient.setQueryData(
                ["summary", shareCode],
                (oldData: SessionSummary | undefined) => {
                    if (!oldData) return oldData;

                    return {
                        ...oldData,
                        status: "COMPLETED",
                    };
                }
            );
        },
    });

    if (summaryQuery.isPending) {
        return <Box p="6">Loading summary...</Box>;
    }

    if (summaryQuery.isError) {
        return <Box p="6">Error loading summary.</Box>;
    }

    const summary: SessionSummary = summaryQuery.data;
    const isSettled = summary.status === "COMPLETED";

    return (
        <Box minH="100vh" bgGradient="to-b" gradientFrom="gray.50" gradientTo="gray.100">
            <Container maxW="md" minH="100vh" bg="gray.50" p="0">
                <Box px="5" py="6" pb="8">
                    <VStack gap="6" align="stretch">
                        <HStack justify="space-between">
                            <Button
                                onClick={() => navigate(`/workspace/${shareCode}`)}
                                variant="ghost"
                                size="sm"
                                color="gray.600"
                            >
                                <ArrowLeft size={20} />
                                <Text>Back</Text>
                            </Button>

                            <Text fontSize="2xl" fontWeight="medium" letterSpacing="tight">
                                Summary
                            </Text>

                            <Box w="20" />
                        </HStack>

                        <Box
                            bg="white"
                            borderRadius="2xl"
                            p="6"
                            shadow="sm"
                            borderWidth="1px"
                            borderColor="gray.200"
                            textAlign="center"
                        >
                            <VStack gap="2">
                                <Text fontSize="sm" color="gray.600">
                                    Total Bill
                                </Text>

                                <Text fontSize="4xl" fontWeight="medium">
                                    ${Number(summary.grandTotal).toFixed(2)}
                                </Text>

                                <Badge px="3" py="1" bg="green.50" color="green.700" borderRadius="full">
                                    <HStack gap="1">
                                        <CheckCircle2 size={12} />
                                        <Text>Split {summary.participants.length} ways</Text>
                                    </HStack>
                                </Badge>
                            </VStack>
                        </Box>

                        <VStack gap="3" align="stretch">
                            <Text fontSize="sm" color="gray.600" px="1">
                                Individual Totals
                            </Text>

                            {summary.participants.map((participant, index) => (
                                <Box
                                    key={participant.participantId}
                                    bg="white"
                                    borderRadius="2xl"
                                    p="5"
                                    shadow="sm"
                                    borderWidth="1px"
                                    borderColor="gray.200"
                                >
                                    <VStack gap="4" align="stretch">
                                        <HStack justify="space-between">
                                            <HStack gap="3">
                                                <Avatar.Root
                                                    size="sm"
                                                    bg={PARTICIPANT_COLORS[index % PARTICIPANT_COLORS.length]}
                                                    borderWidth="2px"
                                                    borderColor="white"
                                                >
                                                    <Avatar.Fallback
                                                        name={participant.participantName}
                                                        color="white"
                                                    />
                                                </Avatar.Root>

                                                <Text fontSize="sm" fontWeight="medium">
                                                    {participant.participantName}
                                                </Text>
                                            </HStack>

                                            <Text fontSize="lg" fontWeight="medium">
                                                ${Number(participant.totalOwed).toFixed(2)}
                                            </Text>
                                        </HStack>

                                        <VStack gap="2" align="stretch" pl="11">
                                            <HStack justify="space-between" fontSize="xs">
                                                <Text color="gray.600">Items subtotal</Text>
                                                <Text color="gray.900" fontWeight="medium">
                                                    ${Number(participant.itemSubtotal).toFixed(2)}
                                                </Text>
                                            </HStack>

                                            <HStack justify="space-between" fontSize="xs">
                                                <Text color="gray.600">Tax share</Text>
                                                <Text color="gray.900" fontWeight="medium">
                                                    ${Number(participant.taxShare).toFixed(2)}
                                                </Text>
                                            </HStack>

                                            <HStack justify="space-between" fontSize="xs">
                                                <Text color="gray.600">Tip share</Text>
                                                <Text color="gray.900" fontWeight="medium">
                                                    ${Number(participant.tipShare).toFixed(2)}
                                                </Text>
                                            </HStack>
                                        </VStack>
                                    </VStack>
                                </Box>
                            ))}
                        </VStack>

                        <VStack gap="3" pt="4">
                            <Button
                                w="full"
                                py="4"
                                h="auto"
                                bg={isSettled ? "green.500" : "gray.900"}
                                color="white"
                                borderRadius="2xl"
                                _hover={{ opacity: 0.9 }}
                                _disabled={{
                                    opacity: 1,
                                    cursor: "default",
                                }}
                                shadow="sm"
                                onClick={() => completeSessionMutation.mutate()}
                                disabled={isSettled || completeSessionMutation.isPending}
                            >
                                {isSettled ? (
                                    <>
                                        <Check size={20} />
                                        <Text>Settled</Text>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={20} />
                                        <Text>Mark as Settled</Text>
                                    </>
                                )}
                            </Button>
                        </VStack>
                    </VStack>
                </Box>
            </Container>
        </Box>
    );
}

export default SummaryPage;