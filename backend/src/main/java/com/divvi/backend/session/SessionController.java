package com.divvi.backend.session;

import com.divvi.backend.session.dto.SessionResponse;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/sessions")
public class SessionController {
    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @PostMapping
    public SessionResponse createSession() {
        return sessionService.createSession();
    }

    @GetMapping("/{shareCode}")
    public SessionResponse getSession(
            @PathVariable String shareCode
    ) {
        return sessionService.getSessionByShareCode(shareCode);
    }

}