import { UserPlus } from "lucide-react";
import { useState } from "react";
import {
    Box,
    VStack,
    Button,
    Text,
    Input,
    HStack,
} from "@chakra-ui/react";

interface JoinSessionProps {
    onAddParticipant: (name: string) => void;
}

export function JoinSession({ onAddParticipant }: JoinSessionProps) {
    const [name, setName] = useState("");
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!name.trim()) {
            return;
        }

        onAddParticipant(name.trim());
        setName("");
    }

    return (
        <VStack gap="4" align="stretch">
            <Box
                bg="white"
                borderRadius="2xl"
                p="5"
                shadow="sm"
                borderWidth="1px"
                borderColor="gray.200"
            >
                <form onSubmit={handleSubmit}>
                    <VStack gap="3" align="stretch">
                        <HStack justify="space-between">
                            <Text fontSize="sm" fontWeight="medium">
                                Add Participant
                            </Text>
                            <UserPlus size={16} color="gray" />
                        </HStack>

                        <HStack gap="2">
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter name"
                                px="4"
                                py="2.5"
                                bg="gray.100"
                                borderRadius="xl"
                                borderWidth="0"
                                fontSize="sm"
                                flex="1"
                                autoComplete="off"
                            />

                            <Button
                                type="submit"
                                disabled={!name.trim()}
                                px="4"
                                py="2.5"
                                h="auto"
                                bg="gray.900"
                                color="white"
                                borderRadius="xl"
                                _disabled={{ opacity: 0.5 }}
                                _hover={{ opacity: 0.9 }}
                            >
                                <Text fontSize="sm">Add</Text>
                            </Button>
                        </HStack>
                    </VStack>
                </form>
            </Box>

            <Text fontSize="xs" textAlign="center" color="gray.500" px="4">
                Add yourself and others, then start splitting when everyone is ready.
            </Text>
        </VStack>
    );
}