import {useEffect, useState} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSessionSocket } from "../hooks/useSessionSocket";
import { getParticipantColor } from "../utils/participantColors";
import { UserPlus } from "lucide-react";
import {
    Box,
    Container,
    VStack,
    HStack,
    Button,
    Text,
    Badge,
    Avatar,
    Input,
    Field,
} from "@chakra-ui/react";
import {
    Users,
    Plus,
    ArrowRight,
    DollarSign,
    Edit3,
} from "lucide-react";

import {
    getSession,
    getReceiptItems,
    createReceiptItem,
    getAssignments,
    createAssignment,
    deleteAssignment,
} from "../api/sessionApi";


interface Participant {
    id: string;
    displayName: string;
}

interface ReceiptItem {
    id: string;
    name: string;
    price: number;
}

interface ItemAssignment {
    id: string;
    receiptItemId: string;
    participantId: string;
    participantName: string;
    sharePercentage: number;
}

function WorkspacePage() {
    const { shareCode } = useParams<{ shareCode: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    useSessionSocket(shareCode);

    const [itemName, setItemName] = useState("");
    const [itemPrice, setItemPrice] = useState("");

    const sessionQuery = useQuery({
        queryKey: ["session", shareCode],
        queryFn: () => getSession(shareCode!),
    });
    useEffect(() => {
        if (sessionQuery.data?.status === "COMPLETED") {
            navigate(`/summary/${shareCode}`);
        }
    }, [sessionQuery.data, navigate, shareCode]);

    const itemsQuery = useQuery({
        queryKey: ["receiptItems", shareCode],
        queryFn: () => getReceiptItems(shareCode!),
    });

    const assignmentsQuery = useQuery({
        queryKey: ["assignments", shareCode],
        queryFn: () => getAssignments(shareCode!),
    });

    const createItemMutation = useMutation({
        mutationFn: (item: { name: string; price: number }) =>
            createReceiptItem(shareCode!, item),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["receiptItems", shareCode],
            });
        },
    });

    const createAssignmentMutation = useMutation({
        mutationFn: ({
                         itemId,
                         participantId,
                         sharePercentage,
                     }: {
            itemId: string;
            participantId: string;
            sharePercentage: number;
        }) =>
            createAssignment(
                shareCode!,
                itemId,
                participantId,
                sharePercentage
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["assignments", shareCode],
            });
        },
    });

    const deleteAssignmentMutation = useMutation({
        mutationFn: (assignmentId: string) =>
            deleteAssignment(shareCode!, assignmentId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["assignments", shareCode],
            });
        },
    });

    const participants: Participant[] =
        sessionQuery.data?.participants ?? [];

    const items: ReceiptItem[] = itemsQuery.data ?? [];

    const assignments: ItemAssignment[] =
        assignmentsQuery.data ?? [];

    function getInitials(name: string) {
        return name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    }

    function handleAddItem(e: React.FormEvent) {
        e.preventDefault();

        const parsedPrice = Number(itemPrice);

        if (!itemName.trim() || Number.isNaN(parsedPrice)) {
            return;
        }

        createItemMutation.mutate({
            name: itemName.trim(),
            price: parsedPrice,
        });

        setItemName("");
        setItemPrice("");
    }

    function toggleItemAssignment(
        itemId: string,
        participantId: string
    ) {
        const itemAssignments = assignments.filter(
            (assignment) =>
                assignment.receiptItemId === itemId
        );

        const existingAssignment = itemAssignments.find(
            (assignment) =>
                assignment.participantId === participantId
        );

        if (existingAssignment) {
            deleteAssignmentMutation.mutate(existingAssignment.id);
            return;
        }

        const totalParticipants =
            itemAssignments.length + 1;

        const sharePercentage =
            100 / totalParticipants;

        createAssignmentMutation.mutate({
            itemId,
            participantId,
            sharePercentage,
        });
    }

    function calculateSubtotal() {
        return items.reduce(
            (sum, item) => sum + Number(item.price),
            0
        );
    }

    function calculateTotal() {
        const taxAmount = Number(sessionQuery.data?.taxAmount ?? 0);
        const tipAmount = Number(sessionQuery.data?.tipAmount ?? 0);

        return calculateSubtotal() + taxAmount + tipAmount;
    }

    function handleGoToSummary() {
        navigate(`/summary/${shareCode}`);
    }

    if (
        sessionQuery.isPending ||
        itemsQuery.isPending ||
        assignmentsQuery.isPending
    ) {
        return <Box p="6">Loading workspace...</Box>;
    }

    if (
        sessionQuery.isError ||
        itemsQuery.isError ||
        assignmentsQuery.isError
    ) {
        return <Box p="6">Error loading workspace.</Box>;
    }

    return (
        <Box
            minH="100vh"
            bgGradient="to-b"
            bg="gray.50"
        >
            <Container
                maxW="md"
                minH="100vh"
                bg="gray.50"
                p="0"
            >
                <Box px="5" py="6" pb="8">
                    <VStack gap="6" align="stretch">

                        <VStack gap="4" align="stretch">
                            <HStack justify="space-between">
                                <VStack gap="0" align="start">
                                    <Text
                                        fontSize="2xl"
                                        fontWeight="medium"
                                        letterSpacing="tight"
                                    >
                                        Divvi
                                    </Text>

                                    <Text
                                        fontSize="xs"
                                        color="gray.600"
                                        fontFamily="mono"
                                    >
                                        {shareCode}
                                    </Text>
                                </VStack>

                                <HStack
                                    gap="1.5"
                                    px="2.5"
                                    py="1"
                                    bg="green.50"
                                    borderRadius="full"
                                >
                                    <Box color="green.500">
                                        <Users size={12} />
                                    </Box>

                                    <Text
                                        fontSize="xs"
                                        color="green.700"
                                    >
                                        {participants.length} online
                                    </Text>
                                </HStack>
                            </HStack>

                            <Box
                                bg="white"
                                borderRadius="2xl"
                                p="5"
                                shadow="sm"
                                borderWidth="1px"
                                borderColor="gray.200"
                            >
                                <HStack justify="space-between">
                                    <VStack gap="0" align="start">
                                        <Text
                                            fontSize="sm"
                                            color="gray.600"
                                        >
                                            Running Total
                                        </Text>

                                        <Text
                                            fontSize="2xl"
                                            fontWeight="medium"
                                        >
                                            ${calculateTotal().toFixed(2)}
                                        </Text>
                                    </VStack>

                                    <Badge
                                        px="3"
                                        py="1"
                                        bg="blue.50"
                                        color="blue.700"
                                        borderRadius="full"
                                        fontSize="xs"
                                    >
                                        {items.length} items
                                    </Badge>
                                </HStack>
                            </Box>
                        </VStack>

                        <Box
                            bg="white"
                            borderRadius="2xl"
                            p="4"
                            shadow="sm"
                            borderWidth="1px"
                            borderColor="gray.200"
                        >
                            <VStack gap="3" align="stretch">
                                <HStack gap="3" justify="space-between">
                                    <HStack gap="-2">
                                        {participants.slice(0, 7).map((participant) => (
                                            <Avatar.Root
                                                key={participant.id}
                                                size="xs"
                                                bg={getParticipantColor(participant.id)}
                                                borderWidth="2px"
                                                borderColor="white"
                                            >
                                                <Avatar.Fallback
                                                    name={participant.displayName}
                                                    color="white"
                                                />
                                            </Avatar.Root>
                                        ))}

                                        {participants.length > 7 && (
                                            <Box
                                                bg="gray.200"
                                                color="gray.700"
                                                borderRadius="full"
                                                w="8"
                                                h="8"
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                                fontSize="xs"
                                                borderWidth="2px"
                                                borderColor="white"
                                            >
                                                +{participants.length - 7}
                                            </Box>
                                        )}
                                    </HStack>

                                    <Text fontSize="sm" color="gray.600">
                                        {participants.length}{" "}
                                        {participants.length === 1 ? "participant" : "participants"}
                                    </Text>
                                </HStack>

                                <Button
                                    onClick={() => navigate(`/session/${shareCode}?returnTo=workspace`)}
                                    size="sm"
                                    variant="ghost"
                                    color="gray.600"
                                    borderRadius="lg"
                                    px="3"
                                    py="1.5"
                                    h="auto"
                                    w="full"
                                    _hover={{ bg: "gray.100", color: "gray.900" }}
                                >
                                    <UserPlus size={14} />
                                    <Text fontSize="xs">Add Participants</Text>
                                </Button>
                            </VStack>
                        </Box>

                        <Box
                            bg="white"
                            borderRadius="2xl"
                            p="5"
                            shadow="sm"
                            borderWidth="1px"
                            borderColor="gray.200"
                        >
                            <form onSubmit={handleAddItem}>
                                <VStack gap="3" align="stretch">

                                    <HStack justify="space-between">
                                        <Text
                                            fontSize="sm"
                                            fontWeight="medium"
                                        >
                                            Add Item
                                        </Text>

                                        <Plus
                                            size={16}
                                            color="gray"
                                        />
                                    </HStack>

                                    <HStack gap="2">
                                        <Field.Root flex="2">
                                            <Input
                                                value={itemName}
                                                onChange={(e) =>
                                                    setItemName(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Item name"
                                                bg="gray.100"
                                                borderRadius="lg"
                                                borderWidth="0"
                                            />
                                        </Field.Root>

                                        <Field.Root flex="1">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={itemPrice}
                                                onChange={(e) =>
                                                    setItemPrice(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="$0.00"
                                                bg="gray.100"
                                                borderRadius="lg"
                                                borderWidth="0"
                                                onBlur={() => {
                                                    const value = Number(itemPrice || "0");
                                                    setItemPrice(value.toFixed(2));
                                                }}
                                            />
                                        </Field.Root>

                                        <Button
                                            type="submit"
                                            bg="gray.900"
                                            color="white"
                                            borderRadius="lg"
                                            disabled={
                                                !itemName.trim() ||
                                                !itemPrice
                                            }
                                        >
                                            <Plus size={16} />
                                        </Button>
                                    </HStack>
                                </VStack>
                            </form>
                        </Box>

                        <VStack gap="3" align="stretch">

                            <HStack
                                justify="space-between"
                                px="1"
                            >
                                <Text
                                    fontSize="sm"
                                    color="gray.600"
                                >
                                    Receipt Items
                                </Text>

                                <Button
                                    onClick={() =>
                                        navigate(`/receipt/${shareCode}?returnTo=workspace`)
                                    }
                                    size="sm"
                                    variant="ghost"
                                    color="gray.500"
                                >
                                    <Edit3 size={14} />
                                    <Text fontSize="xs">
                                        Edit Receipt
                                    </Text>
                                </Button>
                            </HStack>

                            {items.length === 0 ? (
                                <Box
                                    bg="white"
                                    borderRadius="2xl"
                                    p="12"
                                    shadow="sm"
                                    borderWidth="1px"
                                    borderColor="gray.200"
                                    textAlign="center"
                                >
                                    <VStack gap="3">
                                        <Box
                                            bg="gray.100"
                                            borderRadius="full"
                                            p="4"
                                        >
                                            <DollarSign
                                                size={32}
                                                color="gray"
                                            />
                                        </Box>

                                        <VStack gap="1">
                                            <Text
                                                fontSize="sm"
                                                fontWeight="medium"
                                            >
                                                No items yet
                                            </Text>

                                            <Text
                                                fontSize="xs"
                                                color="gray.600"
                                            >
                                                Add your first item
                                            </Text>
                                        </VStack>
                                    </VStack>
                                </Box>
                            ) : (
                                items.map((item) => {
                                    const itemAssignments =
                                        assignments.filter(
                                            (assignment) =>
                                                assignment.receiptItemId ===
                                                item.id
                                        );

                                    return (
                                        <Box
                                            key={item.id}
                                            bg="white"
                                            borderRadius="2xl"
                                            p="4"
                                            shadow="sm"
                                            borderWidth="1px"
                                            borderColor="gray.200"
                                        >
                                            <VStack
                                                gap="3"
                                                align="stretch"
                                            >
                                                <HStack justify="space-between">
                                                    <VStack
                                                        gap="0"
                                                        align="start"
                                                    >
                                                        <Text
                                                            fontSize="sm"
                                                            fontWeight="medium"
                                                        >
                                                            {item.name}
                                                        </Text>

                                                        <Text
                                                            fontSize="sm"
                                                            color="gray.600"
                                                        >
                                                            $
                                                            {Number(
                                                                item.price
                                                            ).toFixed(2)}
                                                        </Text>
                                                    </VStack>
                                                </HStack>

                                                <Box>
                                                    <Text
                                                        fontSize="xs"
                                                        color="gray.600"
                                                        mb="2"
                                                    >
                                                        Split between:
                                                    </Text>

                                                    <HStack
                                                        gap="2"
                                                        flexWrap="wrap"
                                                    >
                                                        {participants.map(
                                                            (
                                                                participant
                                                            ) => {
                                                                const existingAssignment =
                                                                    itemAssignments.find(
                                                                        (
                                                                            assignment
                                                                        ) =>
                                                                            assignment.participantId ===
                                                                            participant.id
                                                                    );

                                                                const isAssigned =
                                                                    Boolean(
                                                                        existingAssignment
                                                                    );

                                                                return (
                                                                    <Button
                                                                        key={
                                                                            participant.id
                                                                        }
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            toggleItemAssignment(
                                                                                item.id,
                                                                                participant.id
                                                                            )
                                                                        }
                                                                        variant={
                                                                            isAssigned
                                                                                ? "solid"
                                                                                : "outline"
                                                                        }
                                                                        bg={
                                                                            isAssigned
                                                                                ? getParticipantColor(participant.id)
                                                                                : "white"
                                                                        }
                                                                        color={
                                                                            isAssigned
                                                                                ? "white"
                                                                                : "gray.700"
                                                                        }
                                                                        borderColor={
                                                                            isAssigned
                                                                                ? getParticipantColor(participant.id)
                                                                                : "gray.300"
                                                                        }
                                                                        borderRadius="full"
                                                                        px="3"
                                                                        py="1"
                                                                        h="auto"
                                                                        fontSize="xs"
                                                                    >
                                                                        {getInitials(
                                                                            participant.displayName
                                                                        )}
                                                                    </Button>
                                                                );
                                                            }
                                                        )}
                                                    </HStack>
                                                </Box>
                                            </VStack>
                                        </Box>
                                    );
                                })
                            )}
                        </VStack>

                        <Button
                            onClick={handleGoToSummary}
                            w="full"
                            py="4"
                            h="auto"
                            bg="gray.900"
                            color="white"
                            borderRadius="2xl"
                        >
                            <Text>
                                View Summary
                            </Text>

                            <ArrowRight size={20} />
                        </Button>
                    </VStack>
                </Box>
            </Container>
        </Box>
    );
}

export default WorkspacePage;