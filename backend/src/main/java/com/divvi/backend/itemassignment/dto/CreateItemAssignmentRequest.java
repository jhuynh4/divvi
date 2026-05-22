package com.divvi.backend.itemassignment.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record CreateItemAssignmentRequest(
        UUID participantId,
        BigDecimal sharePercentage
) {}