# REST API Documentation
## On-the-Go Courier Management System

Base URL: `http://localhost:5000/api`

### Authentication & Authorization
All secured endpoints require the `Authorization` header containing the JWT token:
```http
Authorization: Bearer <jwt_token>
```

---

### 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new Customer or Courier account |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile & courier details |
| `PUT` | `/api/auth/profile` | Authenticated | Update user contact and address information |

#### Request: `POST /api/auth/register`
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "Password@123",
  "role": "customer",
  "phone": "+1 555-019-1029",
  "city": "New York",
  "postal_code": "10001",
  "address": "123 Main Street"
}
```

---

### 2. Orders & Tracking Endpoints (`/api/orders`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/orders/track/:trackingNumber` | Public | Retrieve public tracking history and checkpoint timeline |
| `POST` | `/api/orders` | Customer, Admin | Book a new parcel shipment with live pricing |
| `GET` | `/api/orders/my-orders` | Customer | List all orders booked by the logged-in customer |
| `GET` | `/api/orders/:id` | Customer, Admin | Retrieve complete order details & tracking history |
| `PUT` | `/api/orders/:id/cancel` | Customer, Admin | Cancel pending or assigned order |
| `POST` | `/api/orders/:id/feedback` | Customer | Submit 1-5 star review and comments for delivered parcel |

#### Request: `POST /api/orders`
```json
{
  "parcel_type": "Box/Parcel",
  "weight_kg": 3.5,
  "dimensions": "30x20x15 cm",
  "declared_value": 150.00,
  "priority": "express",
  "pickup_name": "Alice Smith",
  "pickup_phone": "+1 555-123-4567",
  "pickup_address": "742 Evergreen Terrace",
  "pickup_city": "New York",
  "pickup_postal_code": "10003",
  "delivery_name": "Bob Cooper",
  "delivery_phone": "+1 555-987-6543",
  "delivery_address": "500 Atlantic Ave",
  "delivery_city": "Brooklyn",
  "delivery_postal_code": "11217",
  "delivery_instructions": "Leave at front desk"
}
```

---

### 3. Delivery / Courier Endpoints (`/api/courier`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/courier/profile` | Courier, Admin | Get courier fleet profile, rating, and active workload stats |
| `GET` | `/api/courier/deliveries` | Courier, Admin | Get assigned deliveries (supports `?status=active` or `delivered`) |
| `GET` | `/api/courier/available` | Courier, Admin | Get unassigned pending shipments waiting for pickup |
| `POST` | `/api/courier/deliveries/:orderId/accept` | Courier, Admin | Claim an unassigned shipment from available pool |
| `PUT` | `/api/courier/deliveries/:orderId/status` | Courier, Admin | Advance lifecycle status (`picked_up`, `in_transit`, `out_for_delivery`, `delivered`) |
| `PUT` | `/api/courier/availability` | Courier, Admin | Switch driver status between Online and Offline |

---

### 4. Administrator Endpoints (`/api/admin`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard-stats` | Admin | High-level KPIs (Total, In-Transit, Delivered, Revenue, Success Rate) |
| `GET` | `/api/admin/analytics` | Admin | Distribution breakdowns by status, priority, and 7-day volume |
| `GET` | `/api/admin/orders` | Admin | Complete order directory with filters and search |
| `POST` | `/api/admin/orders/:orderId/assign` | Admin | Manually or automatically assign a courier to an order |
| `GET` | `/api/admin/couriers` | Admin | Fleet roster with vehicle plates, ratings, and current workload |
| `GET` | `/api/admin/users` | Admin | User directory across all roles with search |
| `PUT` | `/api/admin/users/:userId/toggle-status` | Admin | Toggle account activation (Active / Deactivated) |
| `GET` | `/api/admin/reports` | Admin | Summary financial and courier performance reporting |
