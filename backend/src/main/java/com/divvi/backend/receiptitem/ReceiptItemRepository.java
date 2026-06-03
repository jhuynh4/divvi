package com.divvi.backend.receiptitem;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReceiptItemRepository extends JpaRepository<ReceiptItem, UUID> {
    List<ReceiptItem> findBySessionShareCode(String shareCode);

    void deleteBySessionId(UUID sessionId);
}