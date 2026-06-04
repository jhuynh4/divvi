package com.divvi.backend.receiptimage;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ReceiptImageRepository extends JpaRepository<ReceiptImage, UUID> {

    Optional<ReceiptImage> findBySessionShareCode(String shareCode);

    void deleteBySessionId(UUID sessionId);
}