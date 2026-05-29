package com.divvi.backend.receiptimage;

import com.divvi.backend.receiptimage.dto.ReceiptImageUploadResponse;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@CrossOrigin(origins = "http://localhost:5173")
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
}