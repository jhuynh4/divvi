package com.divvi.backend.summary.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record ParticipantSummaryResponse(
        UUID participantId,
        String participantName,
        BigDecimal itemSubtotal,
        BigDecimal taxShare,
        BigDecimal tipShare,
        BigDecimal totalOwed
) {}