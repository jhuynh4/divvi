package com.divvi.backend.session;

import com.divvi.backend.session.dto.SessionResponse;
import com.divvi.backend.session.dto.UpdateSessionRequest;
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
        return sessionService.createSession();
    }

    @GetMapping("/{shareCode}")
    public SessionResponse getSession(
            @PathVariable String shareCode
    ) {
        return sessionService.getSessionByShareCode(shareCode);
    }

    @PatchMapping("/{shareCode}")
    public SessionResponse updateSession(
            @PathVariable String shareCode,
            @RequestBody UpdateSessionRequest request
    ) {
        return sessionService.updateSession(shareCode, request);
    }

    @PatchMapping("/{shareCode}/complete")
    public SessionResponse settleSession(@PathVariable String shareCode) {
        return sessionService.settleSession(shareCode);
    }
}