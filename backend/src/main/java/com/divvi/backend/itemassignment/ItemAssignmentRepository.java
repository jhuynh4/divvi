package com.divvi.backend.itemassignment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ItemAssignmentRepository extends JpaRepository<ItemAssignment, UUID> {
    List<ItemAssignment> findByReceiptItemId(UUID receiptItemId);

    List<ItemAssignment> findByParticipantId(UUID participantId);

    List<ItemAssignment> findByReceiptItemSessionShareCode(String shareCode);

    void deleteByReceiptItemId(UUID receiptItemId);

    void deleteByParticipantId(UUID participantId);

    void deleteByReceiptItemSessionId(UUID sessionId);
    void deleteByParticipantSessionId(UUID sessionId);
}