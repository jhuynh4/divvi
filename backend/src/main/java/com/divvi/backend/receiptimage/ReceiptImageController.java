package com.divvi.backend.receiptimage;

import com.divvi.backend.receiptimage.dto.ReceiptImageResponse;
import com.divvi.backend.receiptimage.dto.ReceiptImageUploadResponse;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("api/sessions")
public class ReceiptImageController {

    private final ReceiptImageService receiptImageService;
    public ReceiptImageController(
            ReceiptImageService receiptImageService
    ){
        this.receiptImageService = receiptImageService;
    }

    @PostMapping(
            value = "/{shareCode}/receipt-image",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ReceiptImageUploadResponse uploadReceiptImage(
            @PathVariable String shareCode,
            @RequestParam("file") MultipartFile file
    ) {
        return receiptImageService.uploadReceiptImage(shareCode, file);
    }

    @GetMapping("/{shareCode}/receipt-image")
    public ReceiptImageResponse getReceiptImage(
            @PathVariable String shareCode
    ) {
        return receiptImageService.getReceiptImage(shareCode);
    }

    @GetMapping("/{shareCode}/receipt-image/view")
    public ResponseEntity<Resource> viewReceiptImage(
            @PathVariable String shareCode
    ) {
        Resource resource =
                receiptImageService.getReceiptImageFile(shareCode);

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(resource);
    }
}