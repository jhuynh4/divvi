package com.divvi.backend.receiptitem;

import com.divvi.backend.session.SplitSession;
import jakarta.persistence.*;
import lombok.Setter;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class ReceiptItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private Instant createdAt;

    @ManyToOne
    @JoinColumn(name = "session_id", nullable = false)
    private SplitSession session;

    public ReceiptItem(
            String name,
            BigDecimal price,
            SplitSession session
    ) {
        this.name = name;
        this.price = price;
        this.session = session;
        this.createdAt = Instant.now();
    }
}