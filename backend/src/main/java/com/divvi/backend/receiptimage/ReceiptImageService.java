package com.divvi.backend.receiptimage;

import com.divvi.backend.receiptimage.dto.ReceiptImageUploadResponse;
import com.divvi.backend.session.SplitSession;
import com.divvi.backend.session.SplitSessionRepository;
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

    public ReceiptImageService(
            SplitSessionRepository sessionRepository
    ){
        this.sessionRepository = sessionRepository;
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

        try {
            Path uploadDir = Path.of("uploads", "receipts");

            Files.createDirectories(uploadDir);
            String originalFileName = file.getOriginalFilename();
            String storedFileName = UUID.randomUUID() + "-" + originalFileName;

            Path storedPath = uploadDir.resolve(storedFileName);
            Files.copy(file.getInputStream(), storedPath);

            return new ReceiptImageUploadResponse(
                    originalFileName,
                    storedFileName,
                    storedPath.toString()
            );
        } catch (IOException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to store receipt image"
            );
        }
    }
}