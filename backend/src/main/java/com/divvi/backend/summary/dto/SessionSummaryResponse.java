package com.divvi.backend.summary.dto;


import com.divvi.backend.session.SessionStatus;

import java.math.BigDecimal;
import java.util.List;

public record SessionSummaryResponse(
        String shareCode,
        SessionStatus status,
        BigDecimal subtotal,
        BigDecimal taxAmount,
        BigDecimal tipAmount,
        BigDecimal grandTotal,
        List<ParticipantSummaryResponse> participants
) {}