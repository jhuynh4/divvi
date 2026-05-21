import { Box, VStack, HStack, Text, Badge, Circle } from "@chakra-ui/react";

interface Participant {
    id: string;
    displayName: string;
}

interface ParticipantListProps {
    participants: Participant[];
}

const avatarColors = ["green.400", "blue.400", "purple.400", "orange.400"];

export function ParticipantList({ participants }: ParticipantListProps) {
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <VStack gap="3" align="stretch">
            <Text fontSize="sm" color="gray.600" px="1">
                In Session ({participants.length})
            </Text>

            <Box
                bg="white"
                borderRadius="2xl"
                shadow="sm"
                borderWidth="1px"
                borderColor="gray.200"
                overflow="hidden"
                maxH="300px"
            >
                {participants.length === 0 ? (
                    <Box p="8" textAlign="center">
                        <Text fontSize="sm" color="gray.600">
                            No participants yet. Be the first to join!
                        </Text>
                    </Box>
                ) : (
                    <VStack
                        gap="0"
                        align="stretch"
                        maxH="300px"
                        overflowY="auto"
                    >
                        {participants.map((participant, index) => (
                            <HStack
                                key={participant.id}
                                gap="3"
                                p="4"
                                borderBottomWidth={index === participants.length - 1 ? "0" : "1px"}
                                borderColor="gray.200"
                                _hover={{ bg: "gray.100" }}
                                transition="background-color 0.2s"
                            >
                                <Circle
                                    size="40px"
                                    bg={avatarColors[index % avatarColors.length]}
                                    color="white"
                                    fontWeight="bold"
                                    fontSize="sm"
                                >
                                    {getInitials(participant.displayName)}
                                </Circle>

                                <Text fontSize="sm" flex="1">
                                    {participant.displayName}
                                </Text>

                                {index === 0 && (
                                    <Badge bg="gray.100" color="gray.900">
                                        Host
                                    </Badge>
                                )}
                            </HStack>
                        ))}
                    </VStack>
                )}
            </Box>
        </VStack>
    );
}