package com.divvi.backend.summary;

import com.divvi.backend.itemassignment.ItemAssignment;
import com.divvi.backend.itemassignment.ItemAssignmentRepository;
import com.divvi.backend.receiptitem.ReceiptItem;
import com.divvi.backend.receiptitem.ReceiptItemRepository;
import com.divvi.backend.session.SplitSession;
import com.divvi.backend.session.SplitSessionRepository;
import com.divvi.backend.summary.dto.ParticipantSummaryResponse;
import com.divvi.backend.summary.dto.SessionSummaryResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class SummaryService {

    private final SplitSessionRepository sessionRepository;
    private final ReceiptItemRepository receiptItemRepository;
    private final ItemAssignmentRepository itemAssignmentRepository;

    public SummaryService(
            SplitSessionRepository sessionRepository,
            ReceiptItemRepository receiptItemRepository,
            ItemAssignmentRepository itemAssignmentRepository
    ) {
        this.sessionRepository = sessionRepository;
        this.receiptItemRepository = receiptItemRepository;
        this.itemAssignmentRepository = itemAssignmentRepository;
    }

    public SessionSummaryResponse getSummary(String shareCode) {
        SplitSession session = sessionRepository.findByShareCode(shareCode)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Session not found"
                ));

        List<ReceiptItem> items =
                receiptItemRepository.findBySessionShareCode(shareCode);

        List<ItemAssignment> assignments =
                itemAssignmentRepository.findByReceiptItemSessionShareCode(shareCode);

        BigDecimal subtotal = items.stream()
                .map(ReceiptItem::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal taxAmount = session.getTaxAmount();
        BigDecimal tipAmount = session.getTipAmount();
        BigDecimal grandTotal = subtotal.add(taxAmount).add(tipAmount);

        Map<UUID, ParticipantSummaryAccumulator> totals = new LinkedHashMap<>();

        for (ItemAssignment assignment : assignments) {
            UUID participantId = assignment.getParticipant().getId();

            totals.putIfAbsent(
                    participantId,
                    new ParticipantSummaryAccumulator(
                            participantId,
                            assignment.getParticipant().getDisplayName()
                    )
            );

            BigDecimal itemShare = assignment.getReceiptItem()
                    .getPrice()
                    .multiply(assignment.getSharePercentage())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            totals.get(participantId).itemSubtotal =
                    totals.get(participantId).itemSubtotal.add(itemShare);
        }

        List<ParticipantSummaryResponse> participantSummaries =
                totals.values().stream()
                        .map(accumulator -> {
                            BigDecimal ratio = subtotal.compareTo(BigDecimal.ZERO) == 0
                                    ? BigDecimal.ZERO
                                    : accumulator.itemSubtotal.divide(
                                    subtotal,
                                    8,
                                    RoundingMode.HALF_UP
                            );

                            BigDecimal taxShare = taxAmount
                                    .multiply(ratio)
                                    .setScale(2, RoundingMode.HALF_UP);

                            BigDecimal tipShare = tipAmount
                                    .multiply(ratio)
                                    .setScale(2, RoundingMode.HALF_UP);

                            BigDecimal totalOwed = accumulator.itemSubtotal
                                    .add(taxShare)
                                    .add(tipShare)
                                    .setScale(2, RoundingMode.HALF_UP);

                            return new ParticipantSummaryResponse(
                                    accumulator.participantId,
                                    accumulator.participantName,
                                    accumulator.itemSubtotal,
                                    taxShare,
                                    tipShare,
                                    totalOwed
                            );
                        })
                        .toList();

        return new SessionSummaryResponse(
                session.getShareCode(),
                session.getStatus(),
                subtotal,
                taxAmount,
                tipAmount,
                grandTotal,
                participantSummaries
        );
    }

    private static class ParticipantSummaryAccumulator {
        private final UUID participantId;
        private final String participantName;
        private BigDecimal itemSubtotal = BigDecimal.ZERO;

        private ParticipantSummaryAccumulator(UUID participantId, String participantName) {
            this.participantId = participantId;
            this.participantName = participantName;
        }
    }
}