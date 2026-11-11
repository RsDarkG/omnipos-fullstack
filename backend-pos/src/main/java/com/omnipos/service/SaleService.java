package com.omnipos.service;

import com.omnipos.domain.*;
import com.omnipos.dto.SaleRequestDTO;
import com.omnipos.repository.*;
import com.omnipos.service.strategy.DiscountStrategy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SaleService {

    private final ProductRepository productRepository;
    private final SaleOrderRepository saleOrderRepository;
    private final InventoryMovementRepository kardexRepository;
    private final List<DiscountStrategy> discountStrategies;

    @Transactional(rollbackFor = Exception.class)
    public SaleOrder processSale(SaleRequestDTO request) {
        SaleOrder order = new SaleOrder();
        order.setOrderNumber("FAC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setChannel(request.channel());

        BigDecimal subtotalAccumulator = BigDecimal.ZERO;
        BigDecimal taxAccumulator = BigDecimal.ZERO;

        for (SaleRequestDTO.SaleItemInput itemInput : request.items()) {
            Product product = productRepository.findById(itemInput.productId())
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado ID: " + itemInput.productId()));

            int previousStock = product.getStock();
            product.deductStock(itemInput.quantity());
            productRepository.save(product);

            InventoryMovement movement = new InventoryMovement(
                product, "SALE", itemInput.quantity(), previousStock, product.getStock()
            );
            kardexRepository.save(movement);

            BigDecimal qty = BigDecimal.valueOf(itemInput.quantity());
            BigDecimal lineSubtotal = product.getSalePrice().multiply(qty).setScale(2, RoundingMode.HALF_UP);
            BigDecimal lineTax = lineSubtotal.multiply(product.getTaxRate()).setScale(2, RoundingMode.HALF_UP);

            subtotalAccumulator = subtotalAccumulator.add(lineSubtotal);
            taxAccumulator = taxAccumulator.add(lineTax);

            SaleItem saleItem = new SaleItem();
            saleItem.setProduct(product);
            saleItem.setQuantity(itemInput.quantity());
            saleItem.setUnitCostSnapshot(product.getCostPrice());
            saleItem.setUnitPriceSnapshot(product.getSalePrice());
            saleItem.setSubtotal(lineSubtotal);
            order.addItem(saleItem);
        }

        Map<String, DiscountStrategy> strategyMap = discountStrategies.stream()
            .collect(Collectors.toMap(DiscountStrategy::getStrategyCode, Function.identity()));
        
        String code = request.discountCode() != null ? request.discountCode() : "NONE";
        DiscountStrategy strategy = strategyMap.getOrDefault(code, strategyMap.get("NONE"));
        BigDecimal discountTotal = strategy.calculateDiscount(subtotalAccumulator);

        BigDecimal finalTotal = subtotalAccumulator.add(taxAccumulator).subtract(discountTotal)
            .setScale(2, RoundingMode.HALF_UP);

        order.setSubtotal(subtotalAccumulator);
        order.setTaxTotal(taxAccumulator);
        order.setDiscountTotal(discountTotal);
        order.setFinalTotal(finalTotal);

        BigDecimal totalPaid = BigDecimal.ZERO;
        for (SaleRequestDTO.PaymentInput paymentInput : request.payments()) {
            totalPaid = totalPaid.add(paymentInput.amount());
            Payment payment = new Payment(paymentInput.method(), paymentInput.amount(), paymentInput.reference());
            order.addPayment(payment);
        }

        if (totalPaid.compareTo(finalTotal) < 0) {
            throw new IllegalArgumentException(
                "El monto pagado ($" + totalPaid + ") es menor al total de la factura ($" + finalTotal + ")"
            );
        }

        return saleOrderRepository.save(order);
    }
}
