package com.divvi.backend.receiptitem;

import com.divvi.backend.receiptitem.dto.CreateReceiptItemRequest;
import com.divvi.backend.receiptitem.dto.ReceiptItemResponse;
import com.divvi.backend.receiptitem.dto.UpdateReceiptItemRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sessions/{shareCode}/items")
@CrossOrigin(origins = "http://localhost:5173")
public class ReceiptItemController {
    private final ReceiptItemService receiptItemService;

    public ReceiptItemController(ReceiptItemService receiptItemService) {
        this.receiptItemService = receiptItemService;
    }

    @PostMapping
    public ReceiptItemResponse createReceiptItem(
            @PathVariable String shareCode,
            @RequestBody CreateReceiptItemRequest request
    ) {
        return receiptItemService.createReceiptItem(shareCode, request);
    }

    @GetMapping
    public List<ReceiptItemResponse> getItems(
            @PathVariable String shareCode
    ) {
        return receiptItemService.getItems(shareCode);
    }

    @PutMapping("/{itemId}")
    public ReceiptItemResponse updateItem(
            @PathVariable String shareCode,
            @PathVariable UUID itemId,
            @RequestBody UpdateReceiptItemRequest request
    ) {
        return receiptItemService.updateReceiptItem(shareCode, itemId, request);
    }

    @DeleteMapping("/{itemId}")
    public void deleteItem(
            @PathVariable String shareCode,
            @PathVariable UUID itemId
    ) {
        receiptItemService.deleteReceiptItem(shareCode, itemId);
    }
}