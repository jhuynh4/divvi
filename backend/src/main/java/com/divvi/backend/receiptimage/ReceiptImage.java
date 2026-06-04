package com.divvi.backend.receiptimage;

import com.divvi.backend.session.SplitSession;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Getter
@NoArgsConstructor
public class ReceiptImage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String originalFilename;

    @Column(nullable = false)
    private String storedFilename;

    @Column(nullable = false)
    private String imagePath;

    @Column(nullable = false)
    private Instant uploadedAt;

    @OneToOne
    @JoinColumn(name = "session_id", nullable = false, unique = true)
    private SplitSession session;

    public ReceiptImage(
            String originalFilename,
            String storedFilename,
            String imagePath,
            SplitSession session
    ) {
        this.originalFilename = originalFilename;
        this.storedFilename = storedFilename;
        this.imagePath = imagePath;
        this.session = session;
        this.uploadedAt = Instant.now();
    }
}