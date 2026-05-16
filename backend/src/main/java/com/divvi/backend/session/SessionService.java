package com.divvi.backend.session;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;

@Service
public class SessionService {
    private final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    private final int CODE_LENGTH = 7;

    private final SecureRandom secureRandom = new SecureRandom();

    private final SplitSessionRepository sessionRepository;

    public SessionService(SplitSessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    public SplitSession createSession() {
        String shareCode = generateUniqueShareCode();
        SplitSession newSession = new SplitSession(shareCode);
        return this.sessionRepository.save(newSession);
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

    public SplitSession getSessionByShareCode(String shareCode) {
        return sessionRepository
                .findByShareCode(shareCode)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Session not found"
                ));
    }
}