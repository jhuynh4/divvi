import { useNavigate } from "react-router-dom";
import { Box, Container, VStack, HStack, Text } from "@chakra-ui/react";
import { Plus, Upload, Edit3 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { createSession } from "../api/sessionApi";

function LandingPage() {
    const navigate = useNavigate();

    const createSessionMutation = useMutation({
        mutationFn: createSession,
        onSuccess: (data) => {
            navigate(`/session/${data.shareCode}`);
        },
    });

    function handleStartNew() {
        createSessionMutation.mutate();
    }

    function handleUploadReceipt() {
        createSessionMutation.mutate(undefined, {
            onSuccess: (data) => {
                navigate(`/session/${data.shareCode}/upload`);
            },
        });
    }

    function handleEnterManually() {
        createSessionMutation.mutate(undefined, {
            onSuccess: (data) => {
                navigate(`/receipt/${data.shareCode}?mode=manual`);
            },
        });
    }

    return (
        <Box minH="100vh" bgGradient="to-b" gradientFrom="gray.50" gradientTo="gray.100">
            <Container maxW="md" minH="100vh" bg="gray.50" p="0">
                <Box px="5" py="12">
                    <VStack gap="8" align="stretch">
                        <VStack gap="4" textAlign="center" py="8">
                            <Text fontSize="4xl" fontWeight="medium" letterSpacing="tight">
                                Divvi
                            </Text>

                            <Text fontSize="lg" color="gray.600" maxW="sm" mx="auto">
                                Split bills together in real-time. Simple, collaborative, and fair.
                            </Text>
                        </VStack>

                        <VStack gap="4" align="stretch">
                            <ActionCard
                                icon={<Plus size={24} />}
                                iconBg="gray.900"
                                iconColor="white"
                                title="Start a New Split"
                                subtitle="Create a session and add items together"
                                onClick={handleStartNew}
                                disabled={createSessionMutation.isPending}
                            />

                            <ActionCard
                                icon={<Upload size={24} />}
                                iconBg="blue.100"
                                iconColor="blue.700"
                                title="Upload Receipt"
                                subtitle="Scan or upload a photo to get started"
                                onClick={handleUploadReceipt}
                            />

                            <ActionCard
                                icon={<Edit3 size={24} />}
                                iconBg="purple.100"
                                iconColor="purple.700"
                                title="Enter Manually"
                                subtitle="Type in items and prices yourself"
                                onClick={handleEnterManually}
                            />
                        </VStack>
                    </VStack>
                </Box>
            </Container>
        </Box>
    );
}

interface ActionCardProps {
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    title: string;
    subtitle: string;
    onClick: () => void;
    disabled?: boolean;
}

function ActionCard({
                        icon,
                        iconBg,
                        iconColor,
                        title,
                        subtitle,
                        onClick,
                        disabled = false,
                    }: ActionCardProps) {
    return (
        <Box
            bg="white"
            borderRadius="2xl"
            p="6"
            shadow="sm"
            borderWidth="1px"
            borderColor="gray.200"
            cursor={disabled ? "not-allowed" : "pointer"}
            opacity={disabled ? 0.6 : 1}
            onClick={disabled ? undefined : onClick}
            _hover={disabled ? undefined : { shadow: "md", transform: "translateY(-2px)" }}
            transition="all 0.2s"
        >
            <HStack gap="3">
                <Box bg={iconBg} color={iconColor} borderRadius="full" p="3">
                    {icon}
                </Box>

                <VStack gap="0" align="start" flex="1">
                    <Text fontSize="lg" fontWeight="medium">
                        {title}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                        {subtitle}
                    </Text>
                </VStack>
            </HStack>
        </Box>
    );
}

export default LandingPage;