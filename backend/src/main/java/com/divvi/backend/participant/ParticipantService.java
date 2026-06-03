package com.divvi.backend.participant;

import com.divvi.backend.itemassignment.ItemAssignment;
import com.divvi.backend.itemassignment.ItemAssignmentRepository;
import com.divvi.backend.itemassignment.ItemAssignmentService;
import com.divvi.backend.participant.dto.JoinSessionRequest;
import com.divvi.backend.participant.dto.ParticipantResponse;
import com.divvi.backend.session.SplitSession;
import com.divvi.backend.session.SplitSessionRepository;

import com.divvi.backend.websocket.SessionEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ParticipantService {
    private final ParticipantRepository participantRepository;

    private final SplitSessionRepository splitSessionRepository;

    private final SessionEventPublisher sessionEventPublisher;

    private final ItemAssignmentRepository itemAssignmentRepository;

    private final ItemAssignmentService itemAssignmentService;
    public ParticipantService(
            ParticipantRepository participantRepository,
            SplitSessionRepository splitSessionRepository,
            SessionEventPublisher sessionEventPublisher,
            ItemAssignmentRepository itemAssignmentRepository,
            ItemAssignmentService itemAssignmentService
    ) {
        this.participantRepository = participantRepository;
        this.splitSessionRepository = splitSessionRepository;
        this.sessionEventPublisher = sessionEventPublisher;
        this.itemAssignmentRepository = itemAssignmentRepository;
        this.itemAssignmentService = itemAssignmentService;
    }

    @Transactional
    public ParticipantResponse joinSession(String shareCode, JoinSessionRequest request) {
        SplitSession session = splitSessionRepository
                .findByShareCode(shareCode)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        Participant participant = new Participant(request.displayName(), session);

        Participant savedParticipant = participantRepository.save(participant);
        publishParticipantsUpdatedAfterCommit(shareCode);
        return new ParticipantResponse(
                savedParticipant.getId(),
                savedParticipant.getDisplayName()
        );
    }

    private void publishParticipantsUpdatedAfterCommit(String shareCode) {
        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        sessionEventPublisher.publish(
                                shareCode,
                                "PARTICIPANTS_UPDATED"
                        );
                    }
                }
        );
    }

    private void publishAssignmentsUpdatedAfterCommit(String shareCode) {
        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        sessionEventPublisher.publish(
                                shareCode,
                                "ASSIGNMENT_UPDATED"
                        );
                    }
                }
        );
    }

    @Transactional
    public void removeParticipant(String shareCode, UUID participantId) {
        Participant participant = participantRepository
                .findByIdAndSessionShareCode(participantId, shareCode)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Participant not found"
                ));

        List<ItemAssignment> participantAssignments =
                itemAssignmentRepository.findByParticipantId(participantId);

        Set<UUID> affectedReceiptItemIds = participantAssignments
                .stream()
                .map(assignment -> assignment.getReceiptItem().getId())
                .collect(Collectors.toSet());

        itemAssignmentRepository.deleteByParticipantId(participantId);

        for (UUID receiptItemId : affectedReceiptItemIds) {
            itemAssignmentService.rebalanceAssignments(receiptItemId);
        }

        participantRepository.delete(participant);

        publishParticipantsUpdatedAfterCommit(shareCode);
        publishAssignmentsUpdatedAfterCommit(shareCode);
    }
}