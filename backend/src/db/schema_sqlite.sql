-- SQLite equivalent schema for local development and demonstration

DROP TABLE IF EXISTS delivery_feedback;
DROP TABLE IF EXISTS order_tracking_events;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS couriers;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('customer', 'courier', 'admin')),
    phone TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

CREATE TABLE couriers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('Bicycle', 'Motorcycle', 'Van', 'Truck')),
    vehicle_plate TEXT NOT NULL,
    license_number TEXT NOT NULL,
    is_available INTEGER DEFAULT 1,
    current_city TEXT DEFAULT 'Logistics Center',
    current_latitude REAL DEFAULT 40.7128000,
    current_longitude REAL DEFAULT -74.0060000,
    rating REAL DEFAULT 4.90,
    total_deliveries INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_couriers_user_id ON couriers(user_id);

CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tracking_number TEXT UNIQUE NOT NULL,
    customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    courier_id INTEGER REFERENCES couriers(id) ON DELETE SET NULL,
    parcel_type TEXT NOT NULL,
    weight_kg REAL NOT NULL,
    dimensions TEXT,
    description TEXT,
    declared_value REAL DEFAULT 0.00,
    priority TEXT NOT NULL DEFAULT 'standard',
    pickup_name TEXT NOT NULL,
    pickup_phone TEXT NOT NULL,
    pickup_address TEXT NOT NULL,
    pickup_city TEXT NOT NULL,
    pickup_postal_code TEXT NOT NULL,
    delivery_name TEXT NOT NULL,
    delivery_phone TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_city TEXT NOT NULL,
    delivery_postal_code TEXT NOT NULL,
    delivery_instructions TEXT,
    base_fee REAL NOT NULL,
    weight_fee REAL NOT NULL,
    priority_fee REAL NOT NULL,
    total_price REAL NOT NULL,
    payment_status TEXT DEFAULT 'paid',
    payment_method TEXT DEFAULT 'credit_card',
    status TEXT NOT NULL DEFAULT 'pending',
    estimated_delivery DATETIME,
    delivered_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_tracking ON orders(tracking_number);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_courier ON orders(courier_id);
CREATE INDEX idx_orders_status ON orders(status);

CREATE TABLE order_tracking_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    location TEXT NOT NULL,
    notes TEXT,
    latitude REAL,
    longitude REAL,
    created_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tracking_order_id ON order_tracking_events(order_id);

CREATE TABLE delivery_feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    courier_id INTEGER REFERENCES couriers(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL,
    comments TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
