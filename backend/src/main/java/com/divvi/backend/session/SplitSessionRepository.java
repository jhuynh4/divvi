package com.divvi.backend.session;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SplitSessionRepository extends JpaRepository<SplitSession, UUID>{
    //Spring reads method name and automatically generates query
    Optional<SplitSession> findByShareCode(String shareCode);
}