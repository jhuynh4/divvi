package com.divvi.backend.ocr.dto;

import java.math.BigDecimal;

public record ParsedReceiptItem(
        String name,
        BigDecimal price
) {}