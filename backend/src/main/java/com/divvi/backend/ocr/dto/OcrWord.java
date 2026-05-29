package com.divvi.backend.ocr.dto;

public record OcrWord(
        String text,
        int x,
        int y
) {}