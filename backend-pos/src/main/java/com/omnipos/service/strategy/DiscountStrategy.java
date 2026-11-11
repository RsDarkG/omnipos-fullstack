package com.omnipos.service.strategy;

import java.math.BigDecimal;

public interface DiscountStrategy {
    String getStrategyCode();
    BigDecimal calculateDiscount(BigDecimal subtotal);
}
