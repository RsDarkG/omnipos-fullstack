# OmniPOS — Sistema de Punto de Venta (POS) e Inventario Multicanal

Arquitectura Full Stack diseñada para resolver concurrencia de inventario en tiempo real, trazabilidad financiera mediante Kardex inmutable y pagos divididos (Split Payments).

## Características de Ingeniería
- **Control de Concurrencia (`@Version` Optimistic Locking):** Previene el *double-selling* cuando múltiples cajas o clientes web compran el último artículo simultáneamente.
- **Kardex Inmutable (Append-Only):** Cada variación de stock genera un registro auditable con el estado previo y posterior.
- **Snapshots Financieros:** Congela el costo y precio unitario en el momento exacto de la venta (`BigDecimal` + `NUMERIC(12,2)`).
- **Polimorfismo (Patrón Strategy):** Motor extensible de descuentos e impuestos desacoplado de la lógica de orden.

## Stack Tecnológico
- **Backend:** Java 21, Spring Boot 3, Spring Data JPA, Hibernate, Bean Validation.
- **Base de Datos:** PostgreSQL 16 en contenedor Docker.
- **Frontend:** React, TypeScript, Tailwind CSS.

## Ejecución Rápida
```bash
docker compose up -d
cd backend-pos && ./mvnw spring-boot:run
```
