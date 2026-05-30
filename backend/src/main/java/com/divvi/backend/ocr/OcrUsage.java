package com.divvi.backend.ocr;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class OcrUsage{
    @Id
    private String monthKey;

    @Column(nullable = false)
    private int requestCount;
}