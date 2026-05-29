package com.divvi.backend.ocr;

import com.divvi.backend.ocr.dto.OcrWord;
import com.divvi.backend.ocr.dto.ParsedReceiptItem;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/api/ocr")
public class OcrController {

    private final OcrService ocrService;

    private final ReceiptParserService receiptParserService;

    public OcrController(
            OcrService ocrService,
            ReceiptParserService receiptParserService
    ) {
        this.ocrService = ocrService;
        this.receiptParserService = receiptParserService;
    }

    @PostMapping("/test")
    public List<ParsedReceiptItem> testOcr(@RequestParam String imagePath) {
        List<OcrWord> words = ocrService.extractWords(Path.of(imagePath));
        return receiptParserService.parseItemsFromWords(words);
    }
}