package com.divvi.backend.session;

import com.divvi.backend.session.dto.SessionResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {
    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @PostMapping
    public SessionResponse createSession() {
        SplitSession session = sessionService.createSession();
        return mapToResponse(session);
    }

    @GetMapping("/{shareCode}")
    public SessionResponse getSession(
            @PathVariable String shareCode
    ) {
        SplitSession session = sessionService.getSessionByShareCode(shareCode);
        return mapToResponse(session);
    }

    private SessionResponse mapToResponse(SplitSession session) {
        return new SessionResponse(
                session.getId(),
                session.getShareCode(),
                session.getStatus(),
                session.getCreatedAt()
        );
    }
}