package com.divvi.backend.participant;

import com.divvi.backend.participant.dto.JoinSessionRequest;
import com.divvi.backend.participant.dto.ParticipantResponse;
import com.divvi.backend.session.SplitSession;
import com.divvi.backend.session.SplitSessionRepository;
import org.springframework.stereotype.Service;

@Service
public class ParticipantService {
    private final ParticipantRepository participantRepository;

    private final SplitSessionRepository splitSessionRepository;

    public ParticipantService(ParticipantRepository participantRepository, SplitSessionRepository splitSessionRepository) {
        this.participantRepository = participantRepository;
        this.splitSessionRepository = splitSessionRepository;
    }

    public ParticipantResponse joinSession(String shareCode, JoinSessionRequest request) {
        SplitSession session = splitSessionRepository
                .findByShareCode(shareCode)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        Participant participant = new Participant(request.displayName(), session);

        Participant savedParticipant = participantRepository.save(participant);

        return new ParticipantResponse(
                savedParticipant.getId(),
                savedParticipant.getDisplayName()
        );
    }

}