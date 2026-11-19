# End-to-End System Design & Architecture
## On-the-Go Courier Management System

### 1. High-Level System Architecture

```mermaid
flowchart TD
    subgraph Client ["Frontend (Next.js & React 18)"]
        UI_Home["Landing Page & Tracking Bar"]
        UI_Customer["Customer Module (Booking, Orders, Reviews)"]
        UI_Courier["Delivery Module (Job Board, Checkpoint Updates)"]
        UI_Admin["Admin Operations (Fleet, Dispatch, Analytics)"]
    end

    subgraph API ["REST API Layer (Node.js & Express)"]
        AuthM["JWT & RBAC Middleware"]
        ValM["Schema Validation Middleware"]
        Router["Express Modular Routers"]
        Ctrl["Business Logic Controllers"]
    end

    subgraph Data ["Relational Storage Layer"]
        PG["PostgreSQL Database (3NF)"]
        Pool["pg.Pool Connection Pool"]
        Views["Relational Views & Multi-Table Joins"]
        Audit["Checkpoint Activity Audit Log"]
    end

    Client -->|HTTP/REST /api/*| AuthM
    AuthM --> ValM
    ValM --> Router
    Router --> Ctrl
    Ctrl --> Pool
    Pool --> PG
    PG --> Views
    PG --> Audit
```

---

### 2. Role-Based Access Control (RBAC) Matrix

| Resource / Capability | Public | Customer | Courier | Administrator |
| :--- | :---: | :---: | :---: | :---: |
| Public Tracking by Number | ✅ | ✅ | ✅ | ✅ |
| Register Account | ✅ | ✅ | ✅ | ✅ |
| Book Delivery with Live Pricing | ❌ | ✅ | ❌ | ✅ |
| View Own Order History | ❌ | ✅ | ❌ | ✅ |
| Rate Delivered Order | ❌ | ✅ | ❌ | ❌ |
| Accept Unassigned Delivery | ❌ | ❌ | ✅ | ✅ |
| Advance Status Checkpoints | ❌ | ❌ | ✅ | ✅ |
| Toggle Fleet Online/Offline | ❌ | ❌ | ✅ | ✅ |
| View Global Operational KPIs | ❌ | ❌ | ❌ | ✅ |
| Manually Dispatch / Assign Order | ❌ | ❌ | ❌ | ✅ |
| Toggle User Account Activation | ❌ | ❌ | ❌ | ✅ |
| Export Summary Reports | ❌ | ❌ | ❌ | ✅ |

---

### 3. Parcel Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> pending: Customer Books Parcel
    pending --> assigned: Courier or Admin Assigns
    pending --> cancelled: Customer/Admin Cancels
    assigned --> picked_up: Courier Collects Package
    assigned --> cancelled: Order Cancelled
    picked_up --> in_transit: Routed via Logistics Hub
    in_transit --> out_for_delivery: Final Delivery Run
    out_for_delivery --> delivered: Recipient Receives & Signs
    delivered --> [*]: Audit Completed & Feedback Enabled
    cancelled --> [*]
```

---

### 4. Security & Data Protection Measures
1. **Password Hashing**: Cryptographic salt rounds (10) using `bcryptjs`.
2. **Stateless JWT Tokens**: Signed using `HS256` with expiration and user payload verification.
3. **CORS Isolation**: Controlled cross-origin resource sharing restricted to authorized client origins.
4. **Input Sanitation & Strict Checks**: Validation of incoming coordinates, weights, email patterns, and enum state constraints.
5. **State Progression Enforcement**: Backward state transitions (e.g., delivered &rarr; pending) are rejected by controller verification.
