-- SQLite Seed Data

DELETE FROM delivery_feedback;
DELETE FROM order_tracking_events;
DELETE FROM orders;
DELETE FROM couriers;
DELETE FROM users;

-- 1. Insert Users
INSERT INTO users (id, full_name, email, password_hash, role, phone, address, city, postal_code) VALUES
(1, 'System Administrator', 'admin@onthego.com', '$2b$10$gsoikCDwrhT1J/ei26IOM.GWwSmZiDWqGutPuOLvGditulWb4XfE6', 'admin', '+1-800-555-0100', '100 Logistics Blvd, Suite 400', 'New York', '10001'),
(2, 'Alex Rivers', 'courier.alex@onthego.com', '$2b$10$icxKDMN.eF1/iw32I6LJbeqpSbPWkpoEf4uEnFnyl952Yma518qdW', 'courier', '+1-555-019-2831', '45 Delivery Lane', 'New York', '10012'),
(3, 'Maria Santos', 'courier.maria@onthego.com', '$2b$10$icxKDMN.eF1/iw32I6LJbeqpSbPWkpoEf4uEnFnyl952Yma518qdW', 'courier', '+1-555-019-9482', '88 Greenway Drive', 'Brooklyn', '11201'),
(4, 'David Kim', 'courier.david@onthego.com', '$2b$10$icxKDMN.eF1/iw32I6LJbeqpSbPWkpoEf4uEnFnyl952Yma518qdW', 'courier', '+1-555-019-7712', '12 Hudson Way', 'Queens', '11101'),
(5, 'John Smith', 'customer.john@example.com', '$2b$10$OrrLHV2lY6GPirnbt0sNqurCtYMiBz/sGqDC7x1dpQ659CR42bC22', 'customer', '+1-555-492-1102', '742 Evergreen Terrace', 'New York', '10003'),
(6, 'Sarah Connor', 'customer.sarah@example.com', '$2b$10$OrrLHV2lY6GPirnbt0sNqurCtYMiBz/sGqDC7x1dpQ659CR42bC22', 'customer', '+1-555-738-9901', '304 Cyberdyne Road', 'Brooklyn', '11215'),
(7, 'Emma Watson', 'customer.emma@example.com', '$2b$10$OrrLHV2lY6GPirnbt0sNqurCtYMiBz/sGqDC7x1dpQ659CR42bC22', 'customer', '+1-555-882-3341', '15 Baker Street', 'Manhattan', '10022');

-- 2. Insert Couriers Profiles
INSERT INTO couriers (id, user_id, vehicle_type, vehicle_plate, license_number, is_available, current_city, current_latitude, current_longitude, rating, total_deliveries) VALUES
(1, 2, 'Van', 'OTG-VAN-01', 'DL-NY-98214', 1, 'New York', 40.7128000, -74.0060000, 4.95, 142),
(2, 3, 'Motorcycle', 'OTG-MOTO-07', 'DL-NY-41902', 1, 'Brooklyn', 40.6782000, -73.9442000, 4.88, 98),
(3, 4, 'Bicycle', 'OTG-BIKE-12', 'DL-NY-22019', 0, 'Queens', 40.7282000, -73.7949000, 4.75, 45);

-- 3. Insert Orders
INSERT INTO orders (
    id, tracking_number, customer_id, courier_id, parcel_type, weight_kg, dimensions, description, declared_value, priority,
    pickup_name, pickup_phone, pickup_address, pickup_city, pickup_postal_code,
    delivery_name, delivery_phone, delivery_address, delivery_city, delivery_postal_code, delivery_instructions,
    base_fee, weight_fee, priority_fee, total_price, payment_status, payment_method, status,
    estimated_delivery, delivered_at, created_at
) VALUES
(
    1, 'OTG-202611-94812', 5, 1, 'Electronics', 3.50, '35x25x15 cm', 'MacBook Air and accessories', 1200.00, 'overnight',
    'John Smith', '+1-555-492-1102', '742 Evergreen Terrace', 'New York', '10003',
    'Michael Scott', '+1-555-901-2244', '1725 Slough Ave', 'Scranton', '18503', 'Please ring the reception bell upon delivery',
    15.00, 7.00, 15.00, 37.00, 'paid', 'credit_card', 'delivered',
    datetime('now', '-1 day'), datetime('now', '-2 hours'), datetime('now', '-2 days')
),
(
    2, 'OTG-202611-82014', 5, 2, 'Fragile/Glass', 2.00, '20x20x20 cm', 'Handcrafted ceramic tea set', 150.00, 'express',
    'John Smith', '+1-555-492-1102', '742 Evergreen Terrace', 'New York', '10003',
    'Alice Cooper', '+1-555-321-7788', '500 Atlantic Ave', 'Brooklyn', '11217', 'Handle with extreme care, fragile!',
    15.00, 4.00, 8.00, 27.00, 'paid', 'credit_card', 'out_for_delivery',
    datetime('now', '+2 hours'), NULL, datetime('now', '-18 hours')
),
(
    3, 'OTG-202611-73921', 6, 1, 'Document', 0.50, '30x22x2 cm', 'Confidential Legal Contracts', 50.00, 'standard',
    'Sarah Connor', '+1-555-738-9901', '304 Cyberdyne Road', 'Brooklyn', '11215',
    'Peter Parker', '+1-555-223-4411', '20 Ingram Street', 'Queens', '11375', 'Signature required on delivery',
    10.00, 1.00, 0.00, 11.00, 'paid', 'credit_card', 'in_transit',
    datetime('now', '+1 day'), NULL, datetime('now', '-12 hours')
),
(
    4, 'OTG-202611-61028', 6, 2, 'Box/Parcel', 5.20, '40x30x25 cm', 'Winter apparel and boots', 220.00, 'standard',
    'Sarah Connor', '+1-555-738-9901', '304 Cyberdyne Road', 'Brooklyn', '11215',
    'Clark Kent', '+1-555-889-1122', '344 Clinton St, Apt 3B', 'New York', '10002', 'Leave with doorman if unavailable',
    12.00, 10.40, 0.00, 22.40, 'paid', 'credit_card', 'assigned',
    datetime('now', '+2 days'), NULL, datetime('now', '-6 hours')
),
(
    5, 'OTG-202611-50291', 7, NULL, 'Perishable', 1.80, '25x20x15 cm', 'Fresh gourmet chocolate assortment', 80.00, 'express',
    'Emma Watson', '+1-555-882-3341', '15 Baker Street', 'Manhattan', '10022',
    'Diana Prince', '+1-555-667-8899', 'Gateway City Center, Suite 10', 'Jersey City', '07302', 'Perishable items, keep cool',
    15.00, 3.60, 8.00, 26.60, 'paid', 'credit_card', 'pending',
    datetime('now', '+1 day'), NULL, datetime('now', '-1 hour')
);

-- 4. Insert Order Tracking Events
INSERT INTO order_tracking_events (order_id, status, location, notes, latitude, longitude, created_by_user_id, created_at) VALUES
(1, 'pending', 'Customer Residence (New York, NY)', 'Parcel booking submitted and payment confirmed.', 40.7128, -74.0060, 5, datetime('now', '-2 days')),
(1, 'assigned', 'Regional Distribution Center', 'Assigned to courier Alex Rivers (Van OTG-VAN-01).', 40.7200, -74.0100, 1, datetime('now', '-1 day 20 hours')),
(1, 'picked_up', '742 Evergreen Terrace, New York', 'Package collected by Alex Rivers.', 40.7128, -74.0060, 2, datetime('now', '-1 day 16 hours')),
(1, 'in_transit', 'Interstate Distribution Hub', 'Parcel sorted and in transit via highway route.', 40.7580, -73.9855, 2, datetime('now', '-1 day 8 hours')),
(1, 'out_for_delivery', 'Scranton Local Delivery Hub', 'Out for final delivery to recipient.', 41.4089, -75.6624, 2, datetime('now', '-4 hours')),
(1, 'delivered', '1725 Slough Ave, Scranton', 'Delivered and signed by recipient: Michael Scott.', 41.4089, -75.6624, 2, datetime('now', '-2 hours')),

(2, 'pending', 'New York, NY', 'Parcel booking registered.', 40.7128, -74.0060, 5, datetime('now', '-18 hours')),
(2, 'assigned', 'Logistics Center Manhattan', 'Assigned to Maria Santos.', 40.7200, -74.0100, 1, datetime('now', '-14 hours')),
(2, 'picked_up', '742 Evergreen Terrace, New York', 'Package picked up from sender.', 40.7128, -74.0060, 3, datetime('now', '-10 hours')),
(2, 'in_transit', 'Brooklyn Bridge Crossing', 'Transiting to local Brooklyn sector.', 40.7061, -73.9969, 3, datetime('now', '-5 hours')),
(2, 'out_for_delivery', '500 Atlantic Ave Sector', 'Courier Maria Santos is en route to recipient.', 40.6865, -73.9822, 3, datetime('now', '-45 minutes')),

(3, 'pending', 'Brooklyn, NY', 'Parcel booked by Sarah Connor.', 40.6782, -73.9442, 6, datetime('now', '-12 hours')),
(3, 'assigned', 'Logistics Central', 'Courier Alex Rivers assigned.', 40.7200, -74.0100, 1, datetime('now', '-9 hours')),
(3, 'picked_up', '304 Cyberdyne Road, Brooklyn', 'Courier picked up package.', 40.6782, -73.9442, 2, datetime('now', '-6 hours')),
(3, 'in_transit', 'Midtown Express Highway', 'On route to Queens distribution hub.', 40.7484, -73.9857, 2, datetime('now', '-2 hours')),

(4, 'pending', 'Brooklyn, NY', 'Shipment created and awaiting pickup dispatch.', 40.6782, -73.9442, 6, datetime('now', '-6 hours')),
(4, 'assigned', 'Logistics Dispatch Center', 'Assigned to Maria Santos.', 40.7200, -74.0100, 1, datetime('now', '-3 hours')),

(5, 'pending', 'Manhattan, NY', 'Parcel order booked. Waiting for courier assignment.', 40.7831, -73.9712, 7, datetime('now', '-1 hour'));

-- 5. Insert Feedback for completed Order 1
INSERT INTO delivery_feedback (order_id, customer_id, courier_id, rating, comments, created_at) VALUES
(1, 5, 1, 5, 'Super fast overnight delivery! The package was in pristine condition and the courier was extremely polite.', datetime('now', '-1 hour'));
