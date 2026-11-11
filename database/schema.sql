CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    barcode VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    cost_price NUMERIC(12, 2) NOT NULL CHECK (cost_price >= 0),
    sale_price NUMERIC(12, 2) NOT NULL CHECK (sale_price >= 0),
    tax_rate NUMERIC(5, 4) NOT NULL DEFAULT 0.1900,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE inventory_movements (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id),
    movement_type VARCHAR(30) NOT NULL,
    quantity INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sales_orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(40) UNIQUE NOT NULL,
    channel VARCHAR(15) NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    tax_total NUMERIC(12, 2) NOT NULL,
    discount_total NUMERIC(12, 2) NOT NULL,
    final_total NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sale_items (
    id BIGSERIAL PRIMARY KEY,
    sale_order_id BIGINT NOT NULL REFERENCES sales_orders(id),
    product_id BIGINT NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_cost_snapshot NUMERIC(12, 2) NOT NULL,
    unit_price_snapshot NUMERIC(12, 2) NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL
);

CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    sale_order_id BIGINT NOT NULL REFERENCES sales_orders(id),
    payment_method VARCHAR(20) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    reference VARCHAR(80)
);

-- Datos iniciales de prueba
INSERT INTO products (barcode, name, cost_price, sale_price, tax_rate, stock) VALUES
('7701001', 'Cafe Molido Gourmet 500g', 18000.00, 28500.00, 0.0500, 15),
('7701002', 'Audifonos Inalambricos Pro', 95000.00, 145000.00, 0.1900, 4),
('7701003', 'Teclado Mecanico RGB', 140000.00, 210000.00, 0.1900, 2);
