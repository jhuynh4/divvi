package com.divvi.backend.participant;

import com.divvi.backend.session.SplitSession;
import jakarta.persistence.*;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Entity
public class Participant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String displayName;

    @Column(nullable = false)
    private Instant joinedAt;

    @ManyToOne
    @JoinColumn(name = "session_id", nullable = false)
    private SplitSession session;

    protected Participant() {
    }

    public Participant(String displayName, SplitSession session) {
        this.displayName = displayName;
        this.session = session;
        this.joinedAt = Instant.now();
    }
}