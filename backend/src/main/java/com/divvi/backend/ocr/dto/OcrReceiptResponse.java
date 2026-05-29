package com.divvi.backend.ocr.dto;

import java.util.List;

public record OcrReceiptResponse(
        List<ParsedReceiptItem> items
) {}