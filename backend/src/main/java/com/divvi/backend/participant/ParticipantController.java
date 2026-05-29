package com.divvi.backend.participant;

import com.divvi.backend.participant.dto.JoinSessionRequest;
import com.divvi.backend.participant.dto.ParticipantResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/sessions")
public class ParticipantController {
    private final ParticipantService participantService;

    public ParticipantController(ParticipantService participantService) {
        this.participantService = participantService;
    }

    @PostMapping("/{shareCode}/participants")
    public ParticipantResponse joinSession(
            @PathVariable String shareCode,
            @RequestBody JoinSessionRequest request
    ) {
        return participantService.joinSession(shareCode, request);
    }
}