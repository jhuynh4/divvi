package com.divvi.backend.summary;

import com.divvi.backend.summary.dto.SessionSummaryResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sessions/{shareCode}/summary")
public class SummaryController {

    private final SummaryService summaryService;

    public SummaryController(SummaryService summaryService) {
        this.summaryService = summaryService;
    }

    @GetMapping
    public SessionSummaryResponse getSummary(
            @PathVariable String shareCode
    ) {
        return summaryService.getSummary(shareCode);
    }
}