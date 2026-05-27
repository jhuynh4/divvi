package com.divvi.backend.participant;

import com.divvi.backend.participant.dto.JoinSessionRequest;
import com.divvi.backend.participant.dto.ParticipantResponse;
import com.divvi.backend.session.SplitSession;
import com.divvi.backend.session.SplitSessionRepository;

import com.divvi.backend.websocket.SessionEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
public class ParticipantService {
    private final ParticipantRepository participantRepository;

    private final SplitSessionRepository splitSessionRepository;

    private final SessionEventPublisher sessionEventPublisher;
    public ParticipantService(
            ParticipantRepository participantRepository,
            SplitSessionRepository splitSessionRepository,
            SessionEventPublisher sessionEventPublisher
    ) {
        this.participantRepository = participantRepository;
        this.splitSessionRepository = splitSessionRepository;
        this.sessionEventPublisher = sessionEventPublisher;
    }

    @Transactional
    public ParticipantResponse joinSession(String shareCode, JoinSessionRequest request) {
        SplitSession session = splitSessionRepository
                .findByShareCode(shareCode)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        Participant participant = new Participant(request.displayName(), session);

        Participant savedParticipant = participantRepository.save(participant);
        publishParticipantsUpdatedAfterCommit(shareCode);
        return new ParticipantResponse(
                savedParticipant.getId(),
                savedParticipant.getDisplayName()
        );
    }

    private void publishParticipantsUpdatedAfterCommit(String shareCode) {
        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        sessionEventPublisher.publish(
                                shareCode,
                                "PARTICIPANTS_UPDATED"
                        );
                    }
                }
        );
    }
}