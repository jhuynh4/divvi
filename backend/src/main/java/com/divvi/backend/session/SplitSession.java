package com.divvi.backend.session;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
public class SplitSession {

    @Getter
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Getter
    @Setter
    @Column(nullable = false, unique = true)
    private String shareCode;

    @Getter
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status;

    @Getter
    @Column(nullable = false)
    private Instant createdAt;

    @Getter
    @Setter
    @Column(nullable = false)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Getter
    @Setter
    @Column(nullable = false)
    private BigDecimal tipAmount = BigDecimal.ZERO;

    protected SplitSession(){
    }

    public SplitSession(String shareCode) {
        this.shareCode = shareCode;
        this.status = SessionStatus.ACTIVE;
        this.createdAt = Instant.now();
    }

}