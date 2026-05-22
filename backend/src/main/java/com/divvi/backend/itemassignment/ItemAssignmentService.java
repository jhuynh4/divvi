package com.divvi.backend.itemassignment;

import com.divvi.backend.itemassignment.dto.CreateItemAssignmentRequest;
import com.divvi.backend.itemassignment.dto.ItemAssignmentResponse;
import com.divvi.backend.participant.Participant;
import com.divvi.backend.participant.ParticipantRepository;
import com.divvi.backend.receiptitem.ReceiptItem;
import com.divvi.backend.receiptitem.ReceiptItemRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class ItemAssignmentService {
    private final ItemAssignmentRepository itemAssignmentRepository;

    private final ReceiptItemRepository receiptItemRepository;

    private final ParticipantRepository participantRepository;

    public ItemAssignmentService(
            ItemAssignmentRepository itemAssignmentRepository,
            ReceiptItemRepository receiptItemRepository,
            ParticipantRepository participantRepository
    ){
        this.itemAssignmentRepository = itemAssignmentRepository;
        this.receiptItemRepository = receiptItemRepository;
        this.participantRepository = participantRepository;
    }

    @Transactional
    public ItemAssignmentResponse assignParticipantToItem(
            String shareCode,
            UUID itemId,
            CreateItemAssignmentRequest request
    ) {
        ReceiptItem receiptItem = receiptItemRepository
                .findById(itemId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Receipt item not found"
                ));

        if (!receiptItem.getSession().getShareCode().equals(shareCode)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Receipt item does not belong to session"
            );
        }

        Participant participant = participantRepository
                .findById(request.participantId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Participant not found"
                ));

        if (!participant.getSession().getShareCode().equals(shareCode)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Participant does not belong to session"
            );
        }

        ItemAssignment assignment = new ItemAssignment(
                receiptItem,
                participant,
                BigDecimal.ZERO
        );

        itemAssignmentRepository.save(assignment);

        rebalanceAssignments(itemId);

        return mapToResponse(assignment);
    }

    private void rebalanceAssignments(UUID receiptItemId) {
        List<ItemAssignment> assignments =
                itemAssignmentRepository.findByReceiptItemId(receiptItemId);

        if (assignments.isEmpty()) {
            return;
        }

        BigDecimal share = BigDecimal.valueOf(100.0 / assignments.size());

        assignments.forEach(assignment -> assignment.setSharePercentage(share));

        itemAssignmentRepository.saveAll(assignments);
    }
    public List<ItemAssignmentResponse> getAssignmentsForSession(String shareCode) {
        return itemAssignmentRepository
                .findByReceiptItemSessionShareCode(shareCode)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public void removeAssignment(String shareCode, UUID assignmentId) {
        ItemAssignment assignment = itemAssignmentRepository
                .findById(assignmentId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Assignment not found"
                ));

        if (!assignment.getReceiptItem().getSession().getShareCode().equals(shareCode)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Assignment does not belong to session"
            );
        }

        UUID receiptItemId = assignment.getReceiptItem().getId();

        itemAssignmentRepository.delete(assignment);

        rebalanceAssignments(receiptItemId);
    }

    private ItemAssignmentResponse mapToResponse(ItemAssignment assignment) {
        return new ItemAssignmentResponse(
                assignment.getId(),
                assignment.getReceiptItem().getId(),
                assignment.getParticipant().getId(),
                assignment.getParticipant().getDisplayName(),
                assignment.getSharePercentage()
        );
    }
}