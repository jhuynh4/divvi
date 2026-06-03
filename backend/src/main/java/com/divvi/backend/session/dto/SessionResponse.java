package com.divvi.backend.session.dto;

import com.divvi.backend.participant.dto.ParticipantResponse;
import com.divvi.backend.session.SessionStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record SessionResponse(
        UUID id,
        String shareCode,
        SessionStatus status,
        Instant createdAt,
        Instant expiresAt,
        BigDecimal taxAmount,
        BigDecimal tipAmount,
        List<ParticipantResponse> participants
) {}