package com.divvi.backend.session;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
public class SplitSession {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String shareCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status;

    @Column(nullable = false)
    private Instant createdAt;

    protected SplitSession(){
    }

    public SplitSession(String shareCode) {
        this.shareCode = shareCode;
        this.status = SessionStatus.ACTIVE;
        this.createdAt = Instant.now();
    }

    public UUID getId() {
        return this.id;
    }

    public String getShareCode() {
        return this.shareCode;
    }

    public SessionStatus getStatus() {
        return this.status;
    }

    public Instant getCreatedAt() {
        return this.createdAt;
    }
}