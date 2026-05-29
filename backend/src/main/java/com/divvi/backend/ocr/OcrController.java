package com.divvi.backend.ocr;

import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;

@RestController
@RequestMapping("/api/ocr")
@CrossOrigin(origins = "http://localhost:5173")
public class OcrController {

    private final OcrService ocrService;

    public OcrController(OcrService ocrService) {
        this.ocrService = ocrService;
    }

    @PostMapping("/test")
    public String testOcr(@RequestParam String imagePath) {
        return ocrService.extractText(Path.of(imagePath));
    }
}