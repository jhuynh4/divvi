import { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Container,
    VStack,
    HStack,
    Button,
    Text,
    Image,
    Spinner,
} from "@chakra-ui/react";
import {
    ArrowLeft,
    Upload,
    Camera,
    CheckCircle2,
    Image as ImageIcon,
} from "lucide-react";

import { uploadReceiptImage, createReceiptItem } from "../api/sessionApi";

interface ParsedReceiptItem {
    name: string;
    price: number;
}

function UploadReceiptPage() {
    const { shareCode } = useParams<{ shareCode: string }>();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];

        if (!file) return;

        setSelectedFile(file);

        const reader = new FileReader();
        reader.onload = (e) => {
            setSelectedImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    }

    function handleChoosePhoto() {
        fileInputRef.current?.click();
    }

    async function handleUploadAndExtract() {
        if (!shareCode || !selectedFile) return;

        setIsProcessing(true);

        try {
            const result = await uploadReceiptImage(shareCode, selectedFile);

            for (const item of result.items as ParsedReceiptItem[]) {
                await createReceiptItem(shareCode, {
                    name: item.name,
                    price: item.price,
                });
            }

            navigate(`/receipt/${shareCode}?mode=upload`);
        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("We couldn't extract this receipt. Try a clearer photo.");
            }
        }
        finally {
            setIsProcessing(false);
        }
    }

    return (
        <Box minH="100vh" bgGradient="to-b" bg="gray.50">
            <Container maxW="md" minH="100vh" bg="gray.50" p="0">
                <Box px="5" py="6" pb="10">
                    <VStack gap="6" align="stretch">
                        <VStack gap="4" align="stretch">
                            <HStack justify="space-between">
                                <Button
                                    onClick={() => navigate(`/`)}
                                    variant="ghost"
                                    size="sm"
                                    color="gray.600"
                                    px="0"
                                >
                                    <ArrowLeft size={18} />
                                    <Text fontSize="sm">Back</Text>
                                </Button>

                                <Box bg="blue.100" color="blue.700" borderRadius="full" p="1.5">
                                    <Upload size={14} />
                                </Box>
                            </HStack>

                            <VStack gap="1" align="start">
                                <Text fontSize="2xl" fontWeight="medium" letterSpacing="tight">
                                    Upload Receipt
                                </Text>
                                <Text fontSize="sm" color="gray.500">
                                    We'll automatically extract items and prices from your receipt.
                                </Text>
                            </VStack>
                        </VStack>

                        <Box
                            bg="white"
                            borderRadius="2xl"
                            p="6"
                            shadow="sm"
                            borderWidth="1px"
                            borderColor="gray.200"
                            minH="320px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            {isProcessing ? (
                                <VStack gap="4">
                                    <Spinner size="xl" color="blue.500" />
                                    <VStack gap="1">
                                        <Text fontSize="sm" fontWeight="medium" color="gray.900">
                                            Processing Receipt
                                        </Text>
                                        <Text fontSize="xs" color="gray.500">
                                            Extracting items and prices...
                                        </Text>
                                    </VStack>
                                </VStack>
                            ) : selectedImage ? (
                                <VStack gap="4" w="full">
                                    <Box
                                        position="relative"
                                        w="full"
                                        borderRadius="xl"
                                        overflow="hidden"
                                        bg="gray.100"
                                    >
                                        <Image
                                            src={selectedImage}
                                            alt="Selected receipt"
                                            w="full"
                                            h="auto"
                                            maxH="400px"
                                            objectFit="contain"
                                        />
                                    </Box>

                                    <Button
                                        onClick={handleChoosePhoto}
                                        variant="ghost"
                                        size="sm"
                                        color="gray.600"
                                    >
                                        <Camera size={16} />
                                        <Text fontSize="sm">Choose Different Photo</Text>
                                    </Button>
                                </VStack>
                            ) : (
                                <VStack gap="4">
                                    <Box bg="gray.100" borderRadius="full" p="6">
                                        <ImageIcon size={40} color="gray" />
                                    </Box>
                                    <VStack gap="1">
                                        <Text fontSize="sm" fontWeight="medium" color="gray.900">
                                            No receipt selected
                                        </Text>
                                        <Text fontSize="xs" color="gray.500" textAlign="center" maxW="xs">
                                            Choose a photo to get started
                                        </Text>
                                    </VStack>
                                </VStack>
                            )}
                        </Box>

                        {!selectedImage && !isProcessing && (
                            <Button
                                onClick={handleChoosePhoto}
                                w="full"
                                py="4"
                                h="auto"
                                bg="gray.900"
                                color="white"
                                borderRadius="2xl"
                                _hover={{ opacity: 0.9 }}
                                shadow="sm"
                            >
                                <Camera size={20} />
                                <Text>Choose Photo</Text>
                            </Button>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            style={{ display: "none" }}
                        />

                        <Box bg="blue.50" borderRadius="2xl" p="5" borderWidth="1px" borderColor="blue.100">
                            <VStack gap="3" align="start">
                                <HStack gap="2">
                                    <Box bg="blue.100" color="blue.600" borderRadius="full" p="2" flexShrink="0">
                                        <CheckCircle2 size={16} />
                                    </Box>
                                    <Text fontSize="sm" fontWeight="medium" color="blue.900">
                                        Tips for best results
                                    </Text>
                                </HStack>

                                <VStack gap="2" align="start" pl="9">
                                    <Text fontSize="xs" color="blue.700">
                                        • Ensure the entire receipt is visible
                                    </Text>
                                    <Text fontSize="xs" color="blue.700">
                                        • Use good lighting, avoid shadows
                                    </Text>
                                    <Text fontSize="xs" color="blue.700">
                                        • Keep the receipt flat and in focus
                                    </Text>
                                    <Text fontSize="xs" color="blue.700">
                                        • Make sure text is clear and readable
                                    </Text>
                                </VStack>
                            </VStack>
                        </Box>
                        {errorMessage && (
                            <Text fontSize="sm" color="red.500" textAlign="center">
                                {errorMessage}
                            </Text>
                        )}
                        {selectedImage && !isProcessing && (
                            <Button
                                onClick={handleUploadAndExtract}
                                w="full"
                                py="4"
                                h="auto"
                                bg="blue.600"
                                color="white"
                                borderRadius="2xl"
                                _hover={{ opacity: 0.9 }}
                                shadow="sm"
                            >
                                <Upload size={20} />
                                <Text>Upload & Extract Items</Text>
                            </Button>
                        )}
                    </VStack>
                </Box>
            </Container>
        </Box>
    );
}

export default UploadReceiptPage;