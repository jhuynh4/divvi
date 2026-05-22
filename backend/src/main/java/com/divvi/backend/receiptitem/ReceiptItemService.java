package com.divvi.backend.receiptitem;


import com.divvi.backend.itemassignment.ItemAssignmentRepository;
import com.divvi.backend.receiptitem.dto.CreateReceiptItemRequest;
import com.divvi.backend.receiptitem.dto.ReceiptItemResponse;
import com.divvi.backend.receiptitem.dto.UpdateReceiptItemRequest;
import com.divvi.backend.session.SplitSession;
import com.divvi.backend.session.SplitSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ReceiptItemService {
    private final ReceiptItemRepository receiptItemRepository;

    private final SplitSessionRepository splitSessionRepository;

    private final ItemAssignmentRepository itemAssignmentRepository;

    public ReceiptItemService(
            ReceiptItemRepository receiptItemRepository,
            SplitSessionRepository splitSessionRepository,
            ItemAssignmentRepository itemAssignmentRepository
    ) {
        this.receiptItemRepository = receiptItemRepository;
        this.splitSessionRepository = splitSessionRepository;
        this.itemAssignmentRepository = itemAssignmentRepository;
    }

    public ReceiptItemResponse createReceiptItem(String shareCode, CreateReceiptItemRequest request) {
        SplitSession session = splitSessionRepository
                .findByShareCode(shareCode)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        ReceiptItem savedItem = new ReceiptItem(
                request.name(),
                request.price(),
                session
        );
        receiptItemRepository.save(savedItem);

        return new ReceiptItemResponse(
                savedItem.getId(),
                savedItem.getName(),
                savedItem.getPrice()
        );
    }

    public List<ReceiptItemResponse> getItems(String shareCode) {
        List<ReceiptItem> receiptItems = receiptItemRepository.findBySessionShareCode(shareCode);
        return receiptItems.stream()
                .map(item -> new ReceiptItemResponse(
                        item.getId(),
                        item.getName(),
                        item.getPrice()
                ))
                .toList();
    }

    public ReceiptItemResponse updateReceiptItem(
            String shareCode,
            UUID receiptItemId,
            UpdateReceiptItemRequest request
    ) {
        ReceiptItem item = receiptItemRepository
                .findById(receiptItemId)
                .orElseThrow(() -> new RuntimeException("Receipt item not found"));

        if (!item.getSession().getShareCode().equals(shareCode)) {
            throw new RuntimeException("Receipt item does not belong to session");
        }

        item.setName(request.name());
        item.setPrice(request.price());

        ReceiptItem updatedItem = receiptItemRepository.save(item);

        return new ReceiptItemResponse(
                updatedItem.getId(),
                updatedItem.getName(),
                updatedItem.getPrice()
        );
    }

    @Transactional
    public void deleteReceiptItem(
            String shareCode,
            UUID receiptItemId
    ) {
        ReceiptItem item = receiptItemRepository
                .findById(receiptItemId)
                .orElseThrow(() -> new RuntimeException("Receipt item not found"));

        if (!item.getSession().getShareCode().equals(shareCode)) {
            throw new RuntimeException("Receipt item does not belong to session");
        }

        itemAssignmentRepository.deleteByReceiptItemId(receiptItemId);
        receiptItemRepository.delete(item);
    }
}