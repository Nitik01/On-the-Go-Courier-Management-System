-- ============================================================================
-- On-the-Go Courier Management System - Database Schema (PostgreSQL)
-- Fully Normalised (3NF) Relational Database Schema
-- ============================================================================

-- Drop existing views and tables if rebuilding
DROP VIEW IF EXISTS v_daily_summary;
DROP VIEW IF EXISTS v_courier_stats;
DROP VIEW IF EXISTS v_orders_full;

DROP TABLE IF EXISTS delivery_feedback CASCADE;
DROP TABLE IF EXISTS order_tracking_events CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS couriers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ----------------------------------------------------------------------------
-- 1. USERS TABLE
-- Holds core identity and authentication data for Customers, Couriers, and Admins
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'courier', 'admin')),
    phone VARCHAR(30),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ----------------------------------------------------------------------------
-- 2. COURIERS TABLE
-- 1-to-1 extension of users who operate as delivery couriers (avoids nullable columns in users)
-- ----------------------------------------------------------------------------
CREATE TABLE couriers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_type VARCHAR(50) NOT NULL CHECK (vehicle_type IN ('Bicycle', 'Motorcycle', 'Van', 'Truck')),
    vehicle_plate VARCHAR(50) NOT NULL,
    license_number VARCHAR(100) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    current_city VARCHAR(100) DEFAULT 'Logistics Center',
    current_latitude DECIMAL(10, 7) DEFAULT 40.7128000,
    current_longitude DECIMAL(10, 7) DEFAULT -74.0060000,
    rating DECIMAL(3, 2) DEFAULT 4.90 CHECK (rating >= 1.00 AND rating <= 5.00),
    total_deliveries INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_couriers_user_id ON couriers(user_id);
CREATE INDEX idx_couriers_available ON couriers(is_available);

-- ----------------------------------------------------------------------------
-- 3. ORDERS TABLE
-- Represents booked parcel shipments with full sender, recipient, pricing & status
-- ----------------------------------------------------------------------------
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    tracking_number VARCHAR(30) UNIQUE NOT NULL,
    customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    courier_id INTEGER REFERENCES couriers(id) ON DELETE SET NULL,
    parcel_type VARCHAR(50) NOT NULL CHECK (parcel_type IN ('Document', 'Box/Parcel', 'Fragile/Glass', 'Electronics', 'Perishable', 'Heavy Cargo')),
    weight_kg DECIMAL(6, 2) NOT NULL CHECK (weight_kg > 0),
    dimensions VARCHAR(50), -- e.g. '30x20x15 cm'
    description TEXT,
    declared_value DECIMAL(10, 2) DEFAULT 0.00,
    priority VARCHAR(20) NOT NULL DEFAULT 'standard' CHECK (priority IN ('standard', 'express', 'overnight')),
    
    -- Pickup Details
    pickup_name VARCHAR(100) NOT NULL,
    pickup_phone VARCHAR(30) NOT NULL,
    pickup_address TEXT NOT NULL,
    pickup_city VARCHAR(100) NOT NULL,
    pickup_postal_code VARCHAR(20) NOT NULL,
    
    -- Delivery Details
    delivery_name VARCHAR(100) NOT NULL,
    delivery_phone VARCHAR(30) NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_city VARCHAR(100) NOT NULL,
    delivery_postal_code VARCHAR(20) NOT NULL,
    delivery_instructions TEXT,
    
    -- Financial Breakdown
    base_fee DECIMAL(10, 2) NOT NULL,
    weight_fee DECIMAL(10, 2) NOT NULL,
    priority_fee DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'paid' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    payment_method VARCHAR(50) DEFAULT 'credit_card',
    
    -- Status Lifecycle
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled')),
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_tracking ON orders(tracking_number);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_courier ON orders(courier_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- ----------------------------------------------------------------------------
-- 4. ORDER_TRACKING_EVENTS TABLE
-- Historical audit trail for real-time delivery tracking checkpoint updates
-- ----------------------------------------------------------------------------
CREATE TABLE order_tracking_events (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL CHECK (status IN ('pending', 'assigned', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled')),
    location VARCHAR(150) NOT NULL,
    notes TEXT,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    created_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tracking_order_id ON order_tracking_events(order_id);
CREATE INDEX idx_tracking_created_at ON order_tracking_events(created_at);

-- ----------------------------------------------------------------------------
-- 5. DELIVERY_FEEDBACK TABLE
-- Post-delivery customer ratings and reviews
-- ----------------------------------------------------------------------------
CREATE TABLE delivery_feedback (
    id SERIAL PRIMARY KEY,
    order_id INTEGER UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    courier_id INTEGER REFERENCES couriers(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_feedback_courier ON delivery_feedback(courier_id);

-- ============================================================================
-- 6. VIEWS DEMONSTRATING RELATIONAL JOINS & AGGREGATIONS
-- ============================================================================

-- View: Full Order details with Customer info, Courier info and Rating
CREATE VIEW v_orders_full AS
SELECT 
    o.id,
    o.tracking_number,
    o.parcel_type,
    o.weight_kg,
    o.priority,
    o.status,
    o.total_price,
    o.payment_status,
    o.created_at,
    o.estimated_delivery,
    o.delivered_at,
    
    -- Customer details
    u_cust.id AS customer_id,
    u_cust.full_name AS customer_name,
    u_cust.email AS customer_email,
    u_cust.phone AS customer_phone,
    
    -- Pickup & Delivery locations
    o.pickup_name,
    o.pickup_phone,
    o.pickup_address,
    o.pickup_city,
    o.delivery_name,
    o.delivery_phone,
    o.delivery_address,
    o.delivery_city,
    
    -- Courier details (via Couriers JOIN Users)
    c.id AS courier_id,
    u_cour.full_name AS courier_name,
    u_cour.phone AS courier_phone,
    c.vehicle_type,
    c.vehicle_plate,
    c.rating AS courier_rating,
    
    -- Customer Feedback
    df.rating AS feedback_rating,
    df.comments AS feedback_comments
FROM orders o
INNER JOIN users u_cust ON o.customer_id = u_cust.id
LEFT JOIN couriers c ON o.courier_id = c.id
LEFT JOIN users u_cour ON c.user_id = u_cour.id
LEFT JOIN delivery_feedback df ON df.order_id = o.id;

-- View: Courier Performance Summary with Aggregates
CREATE VIEW v_courier_stats AS
SELECT 
    c.id AS courier_id,
    u.full_name AS courier_name,
    u.email AS courier_email,
    u.phone AS courier_phone,
    c.vehicle_type,
    c.vehicle_plate,
    c.is_available,
    c.rating,
    c.total_deliveries,
    COUNT(CASE WHEN o.status IN ('assigned', 'picked_up', 'in_transit', 'out_for_delivery') THEN 1 END) AS active_orders_count,
    COUNT(CASE WHEN o.status = 'delivered' THEN 1 END) AS completed_orders_count,
    COALESCE(SUM(CASE WHEN o.status = 'delivered' THEN o.total_price ELSE 0 END), 0.00) AS total_revenue_delivered
FROM couriers c
INNER JOIN users u ON c.user_id = u.id
LEFT JOIN orders o ON o.courier_id = c.id
GROUP BY c.id, u.full_name, u.email, u.phone, c.vehicle_type, c.vehicle_plate, c.is_available, c.rating, c.total_deliveries;

-- View: Operational Summary for Management Reporting
CREATE VIEW v_daily_summary AS
SELECT 
    DATE(o.created_at) AS order_date,
    COUNT(*) AS total_orders,
    COUNT(CASE WHEN o.status = 'pending' THEN 1 END) AS pending_orders,
    COUNT(CASE WHEN o.status = 'delivered' THEN 1 END) AS delivered_orders,
    COUNT(CASE WHEN o.status = 'cancelled' THEN 1 END) AS cancelled_orders,
    COALESCE(SUM(o.total_price), 0.00) AS total_revenue
FROM orders o
GROUP BY DATE(o.created_at)
ORDER BY order_date DESC;
