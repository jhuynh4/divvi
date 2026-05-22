package com.divvi.backend.itemassignment;

import com.divvi.backend.itemassignment.dto.CreateItemAssignmentRequest;
import com.divvi.backend.itemassignment.dto.ItemAssignmentResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
@RestController
@RequestMapping("/api/sessions/{shareCode}")
public class ItemAssignmentController {
    private final ItemAssignmentService itemAssignmentService;

    public ItemAssignmentController(
            ItemAssignmentService itemAssignmentService
    ) {
        this.itemAssignmentService = itemAssignmentService;
    }

    @PostMapping("/items/{itemId}/assignments")
    public ItemAssignmentResponse assignParticipantToItem(
            @PathVariable String shareCode,
            @PathVariable UUID itemId,
            @RequestBody CreateItemAssignmentRequest request
    ) {
        return itemAssignmentService.assignParticipantToItem(shareCode, itemId, request);
    }

    @GetMapping("/assignments")
    public List<ItemAssignmentResponse> getAssignmentsForSession(
            @PathVariable String shareCode
    ) {
        return itemAssignmentService.getAssignmentsForSession(shareCode);
    }

    @DeleteMapping("/assignments/{assignmentId}")
    public void removeAssignment(
            @PathVariable String shareCode,
            @PathVariable UUID assignmentId
    ) {
        itemAssignmentService.removeAssignment(shareCode, assignmentId);
    }
}