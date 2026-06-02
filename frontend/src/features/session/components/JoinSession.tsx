import { UserPlus } from "lucide-react";
import { useState } from "react";
import {
    Box,
    VStack,
    Button,
    Text,
    Input,
    Field,
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
            <Box px="1">
                <Text fontSize="sm" color="gray.600">
                    Add Participants
                </Text>
            </Box>

            <form onSubmit={handleSubmit}>
                <VStack gap="3" align="stretch">
                    <Box
                        bg="white"
                        borderRadius="2xl"
                        p="5"
                        shadow="sm"
                        borderWidth="1px"
                        borderColor="gray.200"
                    >
                        <Field.Root>
                            <Field.Label fontSize="sm" mb="2" color="gray.900">
                                Participant Name
                            </Field.Label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter participant name"
                                px="4"
                                py="3"
                                bg="gray.100"
                                borderRadius="xl"
                                borderWidth="0"
                                autoComplete="off"
                            />
                        </Field.Root>
                    </Box>

                    <Button
                        type="submit"
                        disabled={!name.trim()}
                        w="full"
                        h="auto"
                        py="4"
                        bg="gray.900"
                        color="white"
                        borderRadius="2xl"
                        _hover={{ opacity: 0.9 }}
                        _disabled={{ opacity: 0.5, cursor: "not-allowed" }}
                    >
                        <UserPlus size={20} />
                        Add Participant
                    </Button>

                </VStack>
            </form>

            <Text fontSize="xs" textAlign="center" color="gray.600" px="4">
                You'll be able to add items and split the bill with everyone in the
                session.
            </Text>
        </VStack>
    );
}