package com.omnipos.domain;

import com.omnipos.exception.InsufficientStockException;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Getter @Setter @NoArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String barcode;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "cost_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal costPrice;

    @Column(name = "sale_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal salePrice;

    @Column(name = "tax_rate", nullable = false, precision = 5, scale = 4)
    private BigDecimal taxRate;

    @Column(nullable = false)
    private Integer stock;

    @Version
    private Long version;

    public void deductStock(int quantityToDeduct) {
        if (quantityToDeduct <= 0) {
            throw new IllegalArgumentException("La cantidad a descontar debe ser mayor a cero.");
        }
        if (this.stock < quantityToDeduct) {
            throw new InsufficientStockException(
                "Stock insuficiente para '" + this.name + "'. Disponible: " + this.stock + ", Solicitado: " + quantityToDeduct
            );
        }
        this.stock -= quantityToDeduct;
    }
}
