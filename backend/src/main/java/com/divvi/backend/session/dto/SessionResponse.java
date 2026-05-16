package com.divvi.backend.session.dto;

import com.divvi.backend.session.SessionStatus;

import java.time.Instant;
import java.util.UUID;

public record SessionResponse(
        UUID id,
        String shareCode,
        SessionStatus status,
        Instant createdAt
) {}