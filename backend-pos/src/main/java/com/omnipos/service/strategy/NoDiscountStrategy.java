package com.omnipos.service.strategy;

import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
public class NoDiscountStrategy implements DiscountStrategy {
    @Override
    public String getStrategyCode() { return "NONE"; }

    @Override
    public BigDecimal calculateDiscount(BigDecimal subtotal) {
        return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
    }
}
