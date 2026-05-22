package com.divvi.backend.itemassignment.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record ItemAssignmentResponse(
        UUID id,
        UUID receiptItemId,
        UUID participantId,
        String participantName,
        BigDecimal sharePercentage
) {}