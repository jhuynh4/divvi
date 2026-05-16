package com.divvi.backend.session;

import org.springframework.stereotype.Service;

@Service
public class SessionService {
    private final SplitSessionRepository sessionRepository;

    public SessionService(SplitSessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    public SplitSession createSession() {
        String shareCode = "ABC123";
        SplitSession newSession = new SplitSession(shareCode);
        return this.sessionRepository.save(newSession);
    }
}