package com.omnipos.controller;

import com.omnipos.domain.SaleOrder;
import com.omnipos.dto.SaleRequestDTO;
import com.omnipos.service.SaleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/sales")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SaleController {

    private final SaleService saleService;

    @PostMapping
    public ResponseEntity<?> createSale(@Valid @RequestBody SaleRequestDTO request) {
        try {
            SaleOrder savedOrder = saleService.processSale(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "orderNumber", savedOrder.getOrderNumber(),
                "total", savedOrder.getFinalTotal(),
                "status", "COMPLETED"
            ));
        } catch (OptimisticLockingFailureException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "error", "CONCURRENCY_CONFLICT",
                "message", "Otro cajero o cliente web acaba de modificar el stock de uno de los productos. Intenta de nuevo."
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "error", "BUSINESS_ERROR",
                "message", e.getMessage()
            ));
        }
    }
}
