package com.divvi.backend.receiptimage;

import com.divvi.backend.ocr.OcrService;
import com.divvi.backend.ocr.OcrUsage;
import com.divvi.backend.ocr.OcrUsageRepository;
import com.divvi.backend.ocr.ReceiptParserService;
import com.divvi.backend.receiptimage.dto.ReceiptImageResponse;
import com.divvi.backend.receiptimage.dto.ReceiptImageUploadResponse;
import com.divvi.backend.session.SplitSession;
import com.divvi.backend.session.SplitSessionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import java.time.YearMonth;


@Service
public class ReceiptImageService{

    private final SplitSessionRepository sessionRepository;

    private final OcrService ocrService;

    private final ReceiptParserService receiptParserService;

    private final OcrUsageRepository ocrUsageRepository;

    private final ReceiptImageRepository receiptImageRepository;

    private static final int MAX_OCR_ATTEMPTS_PER_SESSION = 3;
    private static final int MONTHLY_OCR_LIMIT = 900;

    public ReceiptImageService(
            SplitSessionRepository sessionRepository,
            OcrService ocrService,
            ReceiptParserService receiptParserService,
            OcrUsageRepository ocrUsageRepository,
            ReceiptImageRepository receiptImageRepository
    ){
        this.sessionRepository = sessionRepository;
        this.ocrService = ocrService;
        this.receiptParserService = receiptParserService;
        this.ocrUsageRepository = ocrUsageRepository;
        this.receiptImageRepository = receiptImageRepository;
    }

    private OcrUsage getCurrentMonthUsage() {
        String monthKey = YearMonth.now().toString();

        return ocrUsageRepository
                .findById(monthKey)
                .orElseGet(() -> {
                    OcrUsage usage = new OcrUsage();
                    usage.setMonthKey(monthKey);
                    usage.setRequestCount(0);
                    return usage;
                });
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

            receiptImageRepository.findBySessionShareCode(shareCode)
                    .ifPresent(existingReceiptImage -> {
                        try {
                            Files.deleteIfExists(Path.of(existingReceiptImage.getImagePath()));
                        } catch (IOException e) {
                            throw new ResponseStatusException(
                                    HttpStatus.INTERNAL_SERVER_ERROR,
                                    "Failed to replace existing receipt image"
                            );
                        }

                        receiptImageRepository.delete(existingReceiptImage);
                    });

            ReceiptImage receiptImage = new ReceiptImage(
                    originalFileName,
                    storedFileName,
                    storedPath.toString(),
                    session
            );
            receiptImageRepository.save(receiptImage);


            if (session.getOcrAttemptCount() >= MAX_OCR_ATTEMPTS_PER_SESSION) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "You've reached the receipt scan limit for this session."
                );
            }

            OcrUsage usage = getCurrentMonthUsage();

            if (usage.getRequestCount() >= MONTHLY_OCR_LIMIT) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Receipt scanning is temporarily unavailable. Please enter items manually."
                );
            }

            var words = ocrService.extractWords(storedPath);
            var items = receiptParserService.parseItemsFromWords(words);

            session.setOcrAttemptCount(session.getOcrAttemptCount() + 1);
            sessionRepository.save(session);

            usage.setRequestCount(usage.getRequestCount() + 1);
            ocrUsageRepository.save(usage);

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

    public ReceiptImageResponse getReceiptImage(String shareCode) {
        ReceiptImage receiptImage = receiptImageRepository
                .findBySessionShareCode(shareCode)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Receipt image not found"
                ));

        return new ReceiptImageResponse(
                receiptImage.getOriginalFilename(),
                receiptImage.getImagePath()
        );
    }

    public Resource getReceiptImageFile(String shareCode) {
        ReceiptImage receiptImage = receiptImageRepository
                .findBySessionShareCode(shareCode)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Receipt image not found"
                ));

        return new FileSystemResource(receiptImage.getImagePath());
    }
}