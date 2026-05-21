package com.divvi.backend.receiptitem.dto;

import java.math.BigDecimal;

public record UpdateReceiptItemRequest(
        String name,
        BigDecimal price
) {
}