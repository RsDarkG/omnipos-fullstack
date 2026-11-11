package com.omnipos.repository;

import com.omnipos.domain.SaleOrder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SaleOrderRepository extends JpaRepository<SaleOrder, Long> {
}
