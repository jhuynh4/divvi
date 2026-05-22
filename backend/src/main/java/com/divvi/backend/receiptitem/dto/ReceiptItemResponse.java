package com.divvi.backend.receiptitem.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record ReceiptItemResponse(
        UUID id,
        String name,
        BigDecimal price
) {
}