import {
    Dialog,
    Portal,
    CloseButton,
    Box,
    Image,
} from "@chakra-ui/react";

interface ReceiptViewerModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    imageUrl: string;
}

export function ReceiptViewerModal({
                                       open,
                                       onOpenChange,
                                       imageUrl,
                                   }: ReceiptViewerModalProps) {
    return (
        <Dialog.Root
            open={open}
            onOpenChange={(details) => onOpenChange(details.open)}
            size="full"
        >
            <Portal>
                <Dialog.Backdrop />

                <Dialog.Positioner>
                    <Dialog.Content bg="gray.950">
                        <Dialog.CloseTrigger asChild>
                            <CloseButton
                                position="absolute"
                                top="4"
                                right="4"
                                zIndex="1"
                                color="white"
                                bg="blackAlpha.700"
                                borderRadius="full"
                                _hover={{ bg: "blackAlpha.800" }}
                            />
                        </Dialog.CloseTrigger>

                        <Box
                            w="full"
                            h="100vh"
                            overflow="auto"
                            display="flex"
                            alignItems="start"
                            justifyContent="center"
                            p="4"
                        >
                            <Image
                                src={imageUrl}
                                alt="Uploaded receipt"
                                maxW="full"
                                h="auto"
                                objectFit="contain"
                                borderRadius="lg"
                            />
                        </Box>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
}
