package com.divvi.backend.receiptimage.dto;

public record ReceiptImageUploadResponse(
        String originalFilename,
        String storedFilename,
        String imagePath
) {}