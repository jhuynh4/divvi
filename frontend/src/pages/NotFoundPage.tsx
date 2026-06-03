import { useNavigate } from "react-router";
import { Box, Container, VStack, Button, Text } from "@chakra-ui/react";
import { Home } from "lucide-react";

export function NotFound() {
    const navigate = useNavigate();

    return (
        <Box minH="100vh" bgGradient="to-b" bg="gray.50">
            <Container maxW="md" minH="100vh" bg="gray.50" p="0">
                <Box px="5" py="12">
                    <VStack gap="8" align="stretch" textAlign="center" py="20">
                        <VStack gap="4">
                            <Text fontSize="6xl" fontWeight="medium">
                                404
                            </Text>
                            <Text fontSize="2xl" fontWeight="medium" color="gray.900">
                                Page Not Found
                            </Text>
                            <Text fontSize="sm" color="gray.600" maxW="sm" mx="auto">
                                The page you're looking for doesn't exist or has been moved.
                            </Text>
                        </VStack>

                        <Button
                            onClick={() => navigate("/")}
                            w="full"
                            py="4"
                            h="auto"
                            bg="gray.900"
                            color="white"
                            borderRadius="2xl"
                            _hover={{ opacity: 0.9 }}
                            shadow="sm"
                        >
                            <Home size={20} />
                            <Text>Go Home</Text>
                        </Button>
                    </VStack>
                </Box>
            </Container>
        </Box>
    );
}

export default NotFound;