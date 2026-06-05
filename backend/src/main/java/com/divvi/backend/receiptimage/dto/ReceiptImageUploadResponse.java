package com.divvi.backend.receiptimage.dto;

import com.divvi.backend.ocr.dto.ParsedReceiptItem;

import java.util.List;

public record ReceiptImageUploadResponse(
        String originalFilename,
        String storedFilename,
        String storageKey,
        List<ParsedReceiptItem> items
) {}