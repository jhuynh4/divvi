package com.divvi.backend.session;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SplitSessionRepository extends JpaRepository<SplitSession, UUID>{
    Optional<SplitSession> findByShareCode(String shareCode);

    boolean existsByShareCode(String shareCode);
}