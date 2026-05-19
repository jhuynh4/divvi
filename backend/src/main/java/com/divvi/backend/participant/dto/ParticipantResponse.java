package com.divvi.backend.participant.dto;

import java.util.UUID;

public record ParticipantResponse(
        UUID id,
        String displayName
) {}