# On-the-Go Courier Management System

A full-stack, enterprise-grade web application that digitises courier and logistics operations. The platform enables customers to seamlessly book parcels and track shipments in real time, couriers to accept assignments and log delivery checkpoints, and administrators to orchestrate orders, monitor fleet performance, and view consolidated reports from a unified command dashboard.

---

## 🌟 Technologies & Stack

- **Frontend**: Next.js 14, React.js 18, Tailwind CSS, Lucide React Icons
- **Backend**: Node.js, Express.js, REST API architecture, Morgan, CORS, Helmet
- **Database**: PostgreSQL (3NF Normalised Relational Schema, Foreign Keys, Indexes, Composite Views, Joins), with intelligent development engine support
- **Authentication & Security**: JSON Web Tokens (JWT), Role-Based Access Control (RBAC), bcryptjs password hashing, strict input validation
- **Version Control**: Git & GitHub

---

## 🚀 Key Modules & Capabilities

### 1. Customer Module
- **Self-Service Parcel Booking**: Multi-step booking wizard with real-time dynamic pricing based on parcel weight, package type (Document, Box, Fragile, Electronics, Perishable, Heavy Cargo), and speed priority (Standard, Express, Overnight).
- **Public & Authenticated Tracking**: Enter any tracking number (e.g. `OTG-202611-94812`) to view the interactive stage progression, live simulated GPS corridor map, and full historical checkpoint audit trail.
- **Shipment Management**: Complete order history, status filtering (Pending, In Transit, Delivered, Cancelled), cancellation for uncollected parcels, and official printable waybill generation.
- **Customer Feedback & Ratings**: Submit 1–5 star reviews and delivery feedback for fulfilled parcels that dynamically update courier performance ratings.

### 2. Delivery Module (Courier Portal)
- **Courier Job Board**: View active assigned deliveries, or browse the pool of unassigned pending parcels to accept new runs.
- **Status Lifecycle Progression**: Advance shipments step-by-step (`assigned` &rarr; `picked_up` &rarr; `in_transit` &rarr; `out_for_delivery` &rarr; `delivered`) with timestamped checkpoint notes and location tags.
- **Fleet Availability Control**: Couriers can toggle their status between **Online (Accepting Jobs)** and **Offline**.
- **Driver Performance**: Real-time tracker for completed shipments, active package load, and customer rating metrics.

### 3. Administrator Dashboard
- **Executive Operations Center**: High-level KPIs tracking total shipments, active deliveries, pending dispatch, revenue totals, online couriers, and on-time fulfillment rates.
- **Orders Dispatch**: Comprehensive order table with search and filtering by status, priority, and assigned driver. Features a 1-click modal for manual or automated courier assignment.
- **Fleet Management**: Courier roster detailing vehicle types (Van, Motorcycle, Bicycle, Truck), license plates, active workloads, and driver ratings.
- **User Directory & RBAC**: View all customer, courier, and administrator accounts with one-click account activation / deactivation controls.
- **Summary Reporting**: Consolidated billing summaries, volume distribution, top courier leaderboards, and 1-click CSV export.

---

## 🔑 Demo Accounts (Instant 1-Click Evaluation)

The application is pre-seeded with realistic data across all operational stages:

| Role | Email | Password | Access / Portal |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@onthego.com` | `Admin@123` | [Admin Dashboard](/admin) |
| **Courier (Van)** | `courier.alex@onthego.com` | `Courier@123` | [Courier Portal](/courier) |
| **Courier (Motorcycle)** | `courier.maria@onthego.com` | `Courier@123` | [Courier Portal](/courier) |
| **Customer** | `customer.john@example.com` | `Customer@123` | [Customer Dashboard](/customer) |
| **Customer** | `customer.sarah@example.com` | `Customer@123` | [Customer Dashboard](/customer) |

> **Pro Tip**: The login page includes **Instant 1-Click Demo Buttons** for Admin, Courier, and Customer personas.

---

## 🗄️ Relational Database Architecture (PostgreSQL)

The database is built on strict **Third Normal Form (3NF)** principles:
- `users`: Core identity, authentication credentials, and contact info.
- `couriers`: 1-to-1 extension storing vehicle specifications, plate number, availability, and rating.
- `orders`: Parcel specifications, sender/recipient addresses, itemized pricing, and status.
- `order_tracking_events`: 1-to-many audit trail logging every checkpoint change, location, and notes.
- `delivery_feedback`: Post-delivery ratings and reviews.
- **Relational Views with Joins**: `v_orders_full`, `v_courier_stats`, and `v_daily_summary`.

See the complete diagram and schema design in [docs/ERD.md](docs/ERD.md).

---

## 📦 Getting Started & Running the Application

### Prerequisites
- Node.js (v18 or higher)
- npm

### 1. Start the Backend API Server
```bash
cd backend
npm install
npm start
```
The backend starts at `http://localhost:5000`. Database tables and demo data will be initialized automatically on first run.

*(Optional PostgreSQL configuration)*: To connect to an external PostgreSQL instance, configure your credentials in `backend/.env`:
```env
USE_POSTGRES=true
DATABASE_URL=postgresql://postgres:<password>@localhost:5432/courier_db
```

### 2. Start the Next.js Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 📚 Technical Documentation

- **[Entity-Relationship Diagram & 3NF Normalisation](docs/ERD.md)**: Visual Mermaid ERD, normalisation breakdown, and join queries.
- **[REST API Specifications](docs/API_DOCUMENTATION.md)**: Endpoints, request bodies, response payloads, and status codes.
- **[System Architecture & Security](docs/ARCHITECTURE.md)**: Component architecture, RBAC authorization matrix, and shipment lifecycle state machine.
