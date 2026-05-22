package com.divvi.backend.session.dto;

import java.math.BigDecimal;

public record UpdateSessionRequest(
        BigDecimal taxAmount,
        BigDecimal tipAmount
) {}