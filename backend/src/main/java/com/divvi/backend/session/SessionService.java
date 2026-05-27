package com.divvi.backend.session;

import com.divvi.backend.participant.ParticipantRepository;
import com.divvi.backend.participant.dto.ParticipantResponse;
import com.divvi.backend.session.dto.SessionResponse;
import com.divvi.backend.session.dto.UpdateSessionRequest;
import com.divvi.backend.websocket.SessionEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.security.SecureRandom;
import java.util.List;

@Service
public class SessionService {
    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    private static final int CODE_LENGTH = 7;

    private final SecureRandom secureRandom = new SecureRandom();

    private final SplitSessionRepository sessionRepository;

    private final ParticipantRepository participantRepository;

    private final SessionEventPublisher sessionEventPublisher;
    public SessionService(
            SplitSessionRepository sessionRepository,
            ParticipantRepository participantRepository,
            SessionEventPublisher sessionEventPublisher
    ) {
        this.sessionRepository = sessionRepository;
        this.participantRepository = participantRepository;
        this.sessionEventPublisher = sessionEventPublisher;
    }

    public SessionResponse createSession() {
        String shareCode = generateUniqueShareCode();
        SplitSession newSession = new SplitSession(shareCode);
        return mapToResponse(this.sessionRepository.save(newSession));
    }

    public String generateShareCode() {
        StringBuilder code = new StringBuilder(CODE_LENGTH);

        for (int i = 0; i < CODE_LENGTH; i++) {
            int randomIndex = secureRandom.nextInt(CODE_CHARS.length());
            code.append(CODE_CHARS.charAt(randomIndex));
        }

        return code.toString();
    }

    public String generateUniqueShareCode() {
        String shareCode;

        do {
            shareCode = generateShareCode();
        } while (sessionRepository.existsByShareCode(shareCode));

        return shareCode;
    }

    public SessionResponse getSessionByShareCode(String shareCode) {
        SplitSession session = sessionRepository
                .findByShareCode(shareCode)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Session not found"
                ));
        return mapToResponse(session);
    }

    @Transactional
    public SessionResponse updateSession(
            String shareCode,
            UpdateSessionRequest request
    ) {
        SplitSession session = sessionRepository
                .findByShareCode(shareCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));

        session.setTaxAmount(request.taxAmount());
        session.setTipAmount(request.tipAmount());

        SplitSession updatedSession = sessionRepository.save(session);
        publishSessionUpdatedAfterCommit(shareCode);
        return mapToResponse(updatedSession);
    }

    @Transactional
    public SessionResponse settleSession(String shareCode) {
        SplitSession session = sessionRepository
                .findByShareCode(shareCode)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Session not found"
                ));

        session.setStatus(SessionStatus.COMPLETED);
        publishSessionUpdatedAfterCommit(shareCode);
        return mapToResponse(sessionRepository.save(session));
    }

    private SessionResponse mapToResponse(SplitSession session) {
        List<ParticipantResponse> participants = participantRepository
                .findBySessionShareCode(session.getShareCode())
                .stream()
                .map(participant -> new ParticipantResponse(
                        participant.getId(),
                        participant.getDisplayName()
                ))
                .toList();
        return new SessionResponse(
                session.getId(),
                session.getShareCode(),
                session.getStatus(),
                session.getCreatedAt(),
                session.getTaxAmount(),
                session.getTipAmount(),
                participants
        );
    }

    private void publishSessionUpdatedAfterCommit(String shareCode) {
        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        sessionEventPublisher.publish(
                                shareCode,
                                "SESSION_UPDATED"
                        );
                    }
                }
        );
    }
}