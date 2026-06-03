package com.divvi.backend.participant;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ParticipantRepository extends JpaRepository<Participant, UUID> {
    List<Participant> findBySessionId(UUID sessionId);

    List<Participant> findBySessionShareCode(String shareCode);

    Optional<Participant> findByIdAndSessionShareCode(UUID id, String shareCode);
}