package com.omnipos.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.List;

public record SaleRequestDTO(
    @NotNull String channel,
    String discountCode,
    @NotEmpty List<SaleItemInput> items,
    @NotEmpty List<PaymentInput> payments
) {
    public record SaleItemInput(@NotNull Long productId, @Positive int quantity) {}
    public record PaymentInput(@NotNull String method, @Positive BigDecimal amount, String reference) {}
}
