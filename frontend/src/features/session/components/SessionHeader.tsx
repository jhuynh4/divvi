import { Share2, Copy, Circle as CircleIcon } from "lucide-react";
import { useState } from "react";
import {
    Box,
    VStack,
    HStack,
    Button,
    Text,
    Badge,
} from "@chakra-ui/react";

interface SessionHeaderProps {
    sessionCode: string;
}

export function SessionHeader({ sessionCode }: SessionHeaderProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(window.location.href);

        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    const handleShare = async () => {
        if (navigator.share) {
            await navigator.share({
                title: "Join my Divvi session",
                text: `Join my bill splitting session with code: ${sessionCode}`,
                url: window.location.href,
            });
        } else {
            await handleCopy();
        }
    };

    return (
        <VStack gap="4" align="stretch">
            {/* Header */}
            <HStack justify="space-between">
                <Text
                    fontSize="2xl"
                    fontWeight="medium"
                    letterSpacing="tight"
                >
                    Divvi
                </Text>

                <HStack
                    gap="1.5"
                    px="2.5"
                    py="1"
                    bg="green.50"
                    borderRadius="full"
                >
                    <Box color="green.500">
                        <CircleIcon size={8} fill="currentColor" />
                    </Box>

                    <Text fontSize="xs" color="green.700">
                        Live
                    </Text>
                </HStack>
            </HStack>

            {/* Session Card */}
            <Box
                bg="white"
                borderRadius="2xl"
                p="5"
                shadow="sm"
                borderWidth="1px"
                borderColor="gray.200"
            >
                <VStack gap="3" align="stretch">
                    <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">
                            Session Code
                        </Text>

                        <Badge
                            px="2"
                            py="0.5"
                            bg="gray.100"
                            borderRadius="md"
                            fontSize="xs"
                            color="gray.900"
                        >
                            Active
                        </Badge>
                    </HStack>

                    <Text
                        fontFamily="mono"
                        fontSize="3xl"
                        letterSpacing="wider"
                        color="gray.900"
                    >
                        {sessionCode}
                    </Text>

                    <HStack gap="2" pt="2">
                        <Button
                            flex="1"
                            onClick={handleCopy}
                            variant="outline"
                            bg="gray.100"
                            borderColor="transparent"
                            borderRadius="xl"
                            _hover={{ bg: "gray.200" }}
                        >
                            <Copy size={16} />
                            <Text fontSize="sm">
                                {copied ? "Copied!" : "Copy"}
                            </Text>
                        </Button>

                        <Button
                            flex="1"
                            onClick={handleShare}
                            variant="outline"
                            bg="gray.100"
                            borderColor="transparent"
                            borderRadius="xl"
                            _hover={{ bg: "gray.200" }}
                        >
                            <Share2 size={16} />
                            <Text fontSize="sm">
                                Share
                            </Text>
                        </Button>
                    </HStack>
                </VStack>
            </Box>
        </VStack>
    );
}