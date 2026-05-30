import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Box,
    Container,
    VStack,
    HStack,
    Button,
    Text,
    Badge,
    Input,
    IconButton,
    Field,
} from "@chakra-ui/react";
import {
    ArrowLeft,
    Plus,
    Trash2,
    Receipt,
    Upload,
    Edit3,
    ArrowRight,
    Check,
} from "lucide-react";

import {
    getSession,
    getReceiptItems,
    createReceiptItem,
    updateReceiptItem,
    deleteReceiptItem,
    updateSession,
} from "../api/sessionApi";

interface ReceiptItem {
    id: string;
    name: string;
    price: number;
}

function ReceiptBuilderPage() {
    const { shareCode } = useParams<{ shareCode: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const queryClient = useQueryClient();

    const mode = searchParams.get("mode") ?? "manual";
    const isUpload = mode === "upload";

    const [itemName, setItemName] = useState("");
    const [itemPrice, setItemPrice] = useState("");

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editPrice, setEditPrice] = useState("");

    const [tax, setTax] = useState<string | null>(null);
    const [tip, setTip] = useState<string | null>(null);

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

    const items: ReceiptItem[] = itemsQuery.data ?? [];

    const displayedTax = tax ?? String(sessionQuery.data?.taxAmount ?? "");
    const displayedTip = tip ?? String(sessionQuery.data?.tipAmount ?? "");

    const createItemMutation = useMutation({
        mutationFn: (item: { name: string; price: number }) =>
            createReceiptItem(shareCode!, item),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["receiptItems", shareCode] });
        },
    });

    const updateItemMutation = useMutation({
        mutationFn: ({
                         itemId,
                         item,
                     }: {
            itemId: string;
            item: { name: string; price: number };
        }) => updateReceiptItem(shareCode!, itemId, item),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["receiptItems", shareCode] });
        },
    });

    const deleteItemMutation = useMutation({
        mutationFn: (itemId: string) => deleteReceiptItem(shareCode!, itemId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["receiptItems", shareCode] });
        },
    });
    const returnTo = searchParams.get("returnTo");
    const updateSessionMutation = useMutation({
        mutationFn: (data: { taxAmount: number; tipAmount: number }) =>
            updateSession(shareCode!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["session", shareCode] });
            if (returnTo === "workspace") {
                navigate(`/workspace/${shareCode}`);
            } else {
                navigate(`/session/${shareCode}`);
            }
        },
    });

    const subtotal = items.reduce((sum, item) => sum + Number(item.price), 0);
    const taxAmount = Number(displayedTax) || 0;
    const tipAmount = Number(displayedTip) || 0;
    const grandTotal = subtotal + taxAmount + tipAmount;

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

    function handleDelete(id: string) {
        deleteItemMutation.mutate(id);
    }

    function handleStartEdit(item: ReceiptItem) {
        setEditingId(item.id);
        setEditName(item.name);
        setEditPrice(Number(item.price).toFixed(2));
    }

    function handleSaveEdit(id: string) {
        const parsedPrice = Number(editPrice);

        if (!editName.trim() || Number.isNaN(parsedPrice)) {
            return;
        }

        updateItemMutation.mutate({
            itemId: id,
            item: {
                name: editName.trim(),
                price: parsedPrice,
            },
        });

        setEditingId(null);
    }

    function handleContinue() {
        updateSessionMutation.mutate({
            taxAmount,
            tipAmount,
        });
    }

    function handleBack() {
        if (isUpload) {
            navigate(`/session/${shareCode}/upload`);
        } else {
            navigate("/");
        }
    }

    if (itemsQuery.isPending || sessionQuery.isPending) {
        return <Box p="6">Loading receipt...</Box>;
    }

    if (itemsQuery.isError || sessionQuery.isError) {
        return <Box p="6">Error loading receipt.</Box>;
    }


    return (
        <Box minH="100vh" bgGradient="to-b" bg="gray.50">
            <Container maxW="md" minH="100vh" bg="gray.50" p="0">
                <Box px="5" py="6" pb="10">
                    <VStack gap="6" align="stretch">
                        <VStack gap="4" align="stretch">
                            <HStack justify="space-between">
                                <Button
                                    onClick={handleBack}
                                    variant="ghost"
                                    size="sm"
                                    color="gray.600"
                                    px="0"
                                >
                                    <ArrowLeft size={18} />
                                    <Text fontSize="sm">Back</Text>
                                </Button>

                                <HStack gap="1.5">
                                    <Box
                                        bg={isUpload ? "blue.100" : "purple.100"}
                                        color={isUpload ? "blue.700" : "purple.700"}
                                        borderRadius="full"
                                        p="1.5"
                                    >
                                        {isUpload ? <Upload size={14} /> : <Edit3 size={14} />}
                                    </Box>

                                    <Text fontSize="sm" color="gray.600">
                                        {isUpload ? "Upload" : "Manual"}
                                    </Text>
                                </HStack>
                            </HStack>

                            <VStack gap="1" align="start">
                                <Text fontSize="2xl" fontWeight="medium" letterSpacing="tight">
                                    Review Receipt
                                </Text>

                                <Text fontSize="sm" color="gray.500">
                                    {isUpload
                                        ? "We've scanned your receipt. Fix any errors before splitting."
                                        : "Add items from your receipt before splitting with the group."}
                                </Text>
                            </VStack>
                        </VStack>

                        {isUpload && (
                            <Box
                                bg="blue.50"
                                borderRadius="2xl"
                                p="4"
                                borderWidth="1px"
                                borderColor="blue.100"
                            >
                                <HStack gap="3">
                                    <Box
                                        bg="blue.100"
                                        color="blue.600"
                                        borderRadius="xl"
                                        p="2.5"
                                        flexShrink="0"
                                    >
                                        <Receipt size={20} />
                                    </Box>

                                    <VStack gap="0.5" align="start" flex="1">
                                        <Text fontSize="sm" fontWeight="medium" color="blue.900">
                                            Receipt scanned
                                        </Text>
                                        <Text fontSize="xs" color="blue.600">
                                            Review and correct the extracted items before splitting.
                                        </Text>
                                    </VStack>
                                </HStack>
                            </Box>
                        )}

                        <Box
                            bg="white"
                            borderRadius="2xl"
                            p="5"
                            shadow="sm"
                            borderWidth="1px"
                            borderColor="gray.200"
                        >
                            <VStack gap="4" align="stretch">
                                <HStack justify="space-between">
                                    <Text fontSize="sm" fontWeight="medium">
                                        Receipt Summary
                                    </Text>

                                    <Badge
                                        px="3"
                                        py="1"
                                        bg="gray.100"
                                        color="gray.700"
                                        borderRadius="full"
                                        fontSize="xs"
                                    >
                                        {items.length} {items.length === 1 ? "item" : "items"}
                                    </Badge>
                                </HStack>

                                <HStack justify="space-between">
                                    <Text fontSize="sm" color="gray.600">
                                        Subtotal
                                    </Text>
                                    <Text fontSize="sm" fontWeight="medium">
                                        ${subtotal.toFixed(2)}
                                    </Text>
                                </HStack>

                                <HStack justify="space-between" align="center">
                                    <Text fontSize="sm" color="gray.600">
                                        Tax
                                    </Text>

                                    <HStack gap="1">
                                        <Text fontSize="sm" color="gray.500">
                                            $
                                        </Text>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={displayedTax}
                                            onChange={(e) => setTax(e.target.value)}
                                            placeholder="0.00"
                                            px="3"
                                            py="1.5"
                                            bg="gray.100"
                                            borderRadius="lg"
                                            borderWidth="0"
                                            fontSize="sm"
                                            w="28"
                                            h="auto"
                                            textAlign="right"
                                        />
                                    </HStack>
                                </HStack>

                                <HStack justify="space-between" align="center">
                                    <Text fontSize="sm" color="gray.600">
                                        Tip
                                    </Text>

                                    <HStack gap="1">
                                        <Text fontSize="sm" color="gray.500">
                                            $
                                        </Text>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={displayedTip}
                                            onChange={(e) => setTip(e.target.value)}
                                            placeholder="0.00"
                                            px="3"
                                            py="1.5"
                                            bg="gray.100"
                                            borderRadius="lg"
                                            borderWidth="0"
                                            fontSize="sm"
                                            w="28"
                                            h="auto"
                                            textAlign="right"
                                        />
                                    </HStack>
                                </HStack>

                                <Box h="1px" bg="gray.200" />

                                <HStack justify="space-between">
                                    <Text fontSize="sm" fontWeight="medium">
                                        Grand Total
                                    </Text>
                                    <Text fontSize="xl" fontWeight="medium">
                                        ${grandTotal.toFixed(2)}
                                    </Text>
                                </HStack>
                            </VStack>
                        </Box>

                        <VStack gap="3" align="stretch">
                            <Text fontSize="sm" color="gray.500" px="1">
                                Items
                            </Text>

                            {items.length === 0 ? (
                                <Box
                                    bg="white"
                                    borderRadius="2xl"
                                    p="10"
                                    shadow="sm"
                                    borderWidth="1px"
                                    borderColor="gray.200"
                                    textAlign="center"
                                >
                                    <VStack gap="3">
                                        <Box bg="gray.100" borderRadius="full" p="4">
                                            <Receipt size={28} color="gray" />
                                        </Box>

                                        <VStack gap="1">
                                            <Text fontSize="sm" fontWeight="medium" color="gray.900">
                                                No items yet
                                            </Text>
                                            <Text fontSize="xs" color="gray.500">
                                                Add items from your receipt below
                                            </Text>
                                        </VStack>
                                    </VStack>
                                </Box>
                            ) : (
                                <VStack gap="2" align="stretch">
                                    {items.map((item) => (
                                        <Box
                                            key={item.id}
                                            bg="white"
                                            borderRadius="2xl"
                                            px="4"
                                            py="3.5"
                                            shadow="sm"
                                            borderWidth="1px"
                                            borderColor="gray.200"
                                        >
                                            {editingId === item.id ? (
                                                <HStack gap="2">
                                                    <Input
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        placeholder="Item name"
                                                        px="3"
                                                        py="1.5"
                                                        bg="gray.100"
                                                        borderRadius="lg"
                                                        borderWidth="0"
                                                        fontSize="sm"
                                                        flex="2"
                                                        h="auto"
                                                    />

                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={editPrice}
                                                        onChange={(e) => setEditPrice(e.target.value)}
                                                        placeholder="0.00"
                                                        px="3"
                                                        py="1.5"
                                                        bg="gray.100"
                                                        borderRadius="lg"
                                                        borderWidth="0"
                                                        fontSize="sm"
                                                        flex="1"
                                                        h="auto"
                                                    />

                                                    <IconButton
                                                        aria-label="Save"
                                                        onClick={() => handleSaveEdit(item.id)}
                                                        size="sm"
                                                        bg="gray.900"
                                                        color="white"
                                                        borderRadius="lg"
                                                        _hover={{ opacity: 0.9 }}
                                                    >
                                                        <Check size={14} />
                                                    </IconButton>
                                                </HStack>
                                            ) : (
                                                <HStack justify="space-between">
                                                    <VStack
                                                        gap="0"
                                                        align="start"
                                                        flex="1"
                                                        onClick={() => handleStartEdit(item)}
                                                        cursor="pointer"
                                                    >
                                                        <Text fontSize="sm" fontWeight="medium">
                                                            {item.name}
                                                        </Text>
                                                        <Text fontSize="sm" color="gray.500">
                                                            ${Number(item.price).toFixed(2)}
                                                        </Text>
                                                    </VStack>

                                                    <HStack gap="1">
                                                        <IconButton
                                                            aria-label="Edit item"
                                                            onClick={() => handleStartEdit(item)}
                                                            size="sm"
                                                            variant="ghost"
                                                            color="gray.400"
                                                            _hover={{ color: "gray.700", bg: "gray.100" }}
                                                        >
                                                            <Edit3 size={15} />
                                                        </IconButton>

                                                        <IconButton
                                                            aria-label="Delete item"
                                                            onClick={() => handleDelete(item.id)}
                                                            size="sm"
                                                            variant="ghost"
                                                            color="gray.400"
                                                            _hover={{ color: "red.500", bg: "red.50" }}
                                                        >
                                                            <Trash2 size={15} />
                                                        </IconButton>
                                                    </HStack>
                                                </HStack>
                                            )}
                                        </Box>
                                    ))}
                                </VStack>
                            )}
                        </VStack>

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
                                        <Text fontSize="sm" fontWeight="medium">
                                            Add Item
                                        </Text>
                                        <Plus size={15} color="gray" />
                                    </HStack>

                                    <HStack gap="2">
                                        <Field.Root flex="2">
                                            <Input
                                                type="text"
                                                value={itemName}
                                                onChange={(e) => setItemName(e.target.value)}
                                                placeholder="Item name"
                                                px="3"
                                                py="2"
                                                bg="gray.100"
                                                borderRadius="lg"
                                                borderWidth="0"
                                                fontSize="sm"
                                            />
                                        </Field.Root>

                                        <Field.Root flex="1">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={itemPrice}
                                                onChange={(e) => setItemPrice(e.target.value)}
                                                placeholder="$0.00"
                                                px="3"
                                                py="2"
                                                bg="gray.100"
                                                borderRadius="lg"
                                                borderWidth="0"
                                                fontSize="sm"
                                            />
                                        </Field.Root>

                                        <Button
                                            type="submit"
                                            disabled={!itemName.trim() || !itemPrice}
                                            px="3"
                                            py="2"
                                            h="auto"
                                            bg="gray.900"
                                            color="white"
                                            borderRadius="lg"
                                            _disabled={{ opacity: 0.5 }}
                                        >
                                            <Plus size={16} />
                                        </Button>
                                    </HStack>
                                </VStack>
                            </form>
                        </Box>

                        <VStack gap="3" pt="2">
                            <Button
                                onClick={handleContinue}
                                disabled={items.length === 0}
                                w="full"
                                py="4"
                                h="auto"
                                bg="gray.900"
                                color="white"
                                borderRadius="2xl"
                                _hover={{ opacity: 0.9 }}
                                _disabled={{ opacity: 0.4, cursor: "not-allowed" }}
                                shadow="sm"
                            >
                                <Text>Continue to Split</Text>
                                <ArrowRight size={20} />
                            </Button>

                            {items.length === 0 && (
                                <Text fontSize="xs" textAlign="center" color="gray.400">
                                    Add at least one item to continue
                                </Text>
                            )}
                        </VStack>
                    </VStack>
                </Box>
            </Container>
        </Box>
    );
}

export default ReceiptBuilderPage;