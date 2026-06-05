package com.divvi.backend.receiptimage.dto;

public record ReceiptImageResponse(
        String originalFilename,
        String imagePath
) {
}