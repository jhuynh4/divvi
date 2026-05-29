package com.divvi.backend.receiptimage;

import com.divvi.backend.ocr.OcrService;
import com.divvi.backend.ocr.ReceiptParserService;
import com.divvi.backend.receiptimage.dto.ReceiptImageUploadResponse;
import com.divvi.backend.session.SplitSession;
import com.divvi.backend.session.SplitSessionRepository;
import org.apache.coyote.Response;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@Service
public class ReceiptImageService{

    private final SplitSessionRepository sessionRepository;

    private final OcrService ocrService;

    private final ReceiptParserService receiptParserService;

    public ReceiptImageService(
            SplitSessionRepository sessionRepository,
            OcrService ocrService,
            ReceiptParserService receiptParserService
    ){
        this.sessionRepository = sessionRepository;
        this.ocrService = ocrService;
        this.receiptParserService = receiptParserService;
    }

    public ReceiptImageUploadResponse uploadReceiptImage(
            String shareCode,
            MultipartFile file
    ) {
        SplitSession session = sessionRepository
                .findByShareCode(shareCode)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Session not found"
                ));


        if (file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Receipt Image is required"
            );
        }

        long maxFileSize = 5 * 1024 * 1024;
        if (file.getSize() > maxFileSize) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Receipt image must be smaller than 5MB"
            );
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only image uploads are allowed"
            );
        }
        
        try {
            Path uploadDir = Path.of("uploads", "receipts");

            Files.createDirectories(uploadDir);
            String originalFileName = file.getOriginalFilename();
            String storedFileName = UUID.randomUUID() + "-" + originalFileName;

            Path storedPath = uploadDir.resolve(storedFileName);
            Files.copy(file.getInputStream(), storedPath);

            var words = ocrService.extractWords(storedPath);
            var items = receiptParserService.parseItemsFromWords(words);

            return new ReceiptImageUploadResponse(
                    originalFileName,
                    storedFileName,
                    storedPath.toString(),
                    items
            );
        } catch (IOException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to store receipt image"
            );
        }
    }
}