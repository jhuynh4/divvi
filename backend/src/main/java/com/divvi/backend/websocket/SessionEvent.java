package com.divvi.backend.websocket;

public record SessionEvent(
    String type,
    String shareCode
) {}