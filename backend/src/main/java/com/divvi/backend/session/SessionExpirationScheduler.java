package com.divvi.backend.session;

import com.divvi.backend.itemassignment.ItemAssignmentRepository;
import com.divvi.backend.participant.ParticipantRepository;
import com.divvi.backend.receiptitem.ReceiptItemRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Component
public class SessionExpirationScheduler {

    private final SplitSessionRepository sessionRepository;

    private final ItemAssignmentRepository itemAssignmentRepository;

    private final ReceiptItemRepository receiptItemRepository;
    private final ParticipantRepository participantRepository;

    public SessionExpirationScheduler(
            SplitSessionRepository sessionRepository,
            ItemAssignmentRepository itemAssignmentRepository,
            ReceiptItemRepository receiptItemRepository,
            ParticipantRepository participantRepository) {
        this.sessionRepository = sessionRepository;
        this.itemAssignmentRepository = itemAssignmentRepository;
        this.receiptItemRepository = receiptItemRepository;
        this.participantRepository = participantRepository;
    }

    @Scheduled(fixedRate = 60 * 60 * 1000)
    @Transactional
    public void cleanupExpiredSessions() {
        List<SplitSession> expiredSessions =
                sessionRepository.findByExpiresAtBefore(Instant.now());

        for (SplitSession session : expiredSessions) {

            itemAssignmentRepository.deleteByReceiptItemSessionId(
                    session.getId()
            );

            receiptItemRepository.deleteBySessionId(
                    session.getId()
            );

            participantRepository.deleteBySessionId(
                    session.getId()
            );

            sessionRepository.delete(session);
        }
    }
}