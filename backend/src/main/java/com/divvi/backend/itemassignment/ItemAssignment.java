package com.divvi.backend.itemassignment;

import com.divvi.backend.participant.Participant;
import com.divvi.backend.receiptitem.ReceiptItem;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class ItemAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "receipt_item_id", nullable = false)
    private ReceiptItem receiptItem;

    @ManyToOne
    @JoinColumn(name = "participant_id", nullable = false)
    private Participant participant;

    @Column(nullable = false)
    private BigDecimal sharePercentage;

    @Column(nullable = false)
    private Instant createdAt;

    public ItemAssignment(
            ReceiptItem receiptItem,
            Participant participant,
            BigDecimal sharePercentage
    ) {
        this.receiptItem = receiptItem;
        this.participant = participant;
        this.sharePercentage = sharePercentage;
        this.createdAt = Instant.now();
    }
}