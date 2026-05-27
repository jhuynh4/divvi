package com.divvi.backend.websocket;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class SessionEventPublisher {
    private final SimpMessagingTemplate messagingTemplate;

    public SessionEventPublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void publish(String shareCode, String type) {
        messagingTemplate.convertAndSend(
                "/topic/sessions/" + shareCode,
                new SessionEvent(type, shareCode)
        );
    }

}