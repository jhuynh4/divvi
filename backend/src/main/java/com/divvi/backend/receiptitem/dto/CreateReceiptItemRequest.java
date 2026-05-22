package com.divvi.backend.receiptitem.dto;

import java.math.BigDecimal;

public record CreateReceiptItemRequest(
        String name,
        BigDecimal price
) {
}