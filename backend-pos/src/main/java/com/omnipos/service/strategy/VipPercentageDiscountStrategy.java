package com.omnipos.service.strategy;

import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
public class VipPercentageDiscountStrategy implements DiscountStrategy {
    private static final BigDecimal TEN_PERCENT = new BigDecimal("0.10");

    @Override
    public String getStrategyCode() { return "VIP10"; }

    @Override
    public BigDecimal calculateDiscount(BigDecimal subtotal) {
        return subtotal.multiply(TEN_PERCENT).setScale(2, RoundingMode.HALF_UP);
    }
}
