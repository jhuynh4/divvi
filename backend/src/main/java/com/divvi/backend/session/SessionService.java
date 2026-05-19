package com.divvi.backend.session;

import com.divvi.backend.participant.ParticipantRepository;
import com.divvi.backend.participant.dto.ParticipantResponse;
import com.divvi.backend.session.dto.SessionResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.util.List;

@Service
public class SessionService {
    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    private static final int CODE_LENGTH = 7;

    private final SecureRandom secureRandom = new SecureRandom();

    private final SplitSessionRepository sessionRepository;

    private final ParticipantRepository participantRepository;

    public SessionService(SplitSessionRepository sessionRepository, ParticipantRepository participantRepository) {
        this.sessionRepository = sessionRepository;
        this.participantRepository = participantRepository;
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
                participants
        );
    }
}