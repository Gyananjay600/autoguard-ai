# AutoGuard AI — Intelligent Predictive Fleet Maintenance Platform

AutoGuard AI is an enterprise-grade vehicle fleet monitoring and predictive diagnostic platform. It connects real-time IoT vehicle telemetry streams—including Engine RPM, Temperature, Oil Pressure, Vibration indices, and Diagnostic Trouble Codes (DTCs)—with generative AI models and Retrieval-Augmented Generation (RAG).

By continuously analyzing raw sensor data against operational anomaly thresholds and vector-indexed service manuals, AutoGuard AI enables vehicle owners, service technicians, and fleet administrators to transition from costly reactive breakdowns to proactive predictive care.

---

## 🛠️ Modern Decoupled Technology Stack

| Layer | Technology & Frameworks |
| :--- | :--- |
| **Backend Core** | Node.js (v20+ LTS), Express.js (ES Modules), MySQL2 (Promise Connection Pool) |
| **Security & Auth** | Stateless JWT (`jsonwebtoken`), BCrypt Password Hashing, CORS, Role-Based Access Control (`OWNER`, `ENGINEER`, `ADMIN`), Resource Ownership Scoping |
| **Database** | MySQL 8.0, Relational schema with Foreign Keys and Indexes (`schema.sql`) |
| **AI Integration** | Groq API (`llama-3.3-70b-versatile` / OpenAI-compatible endpoint) |
| **RAG & Knowledge Base** | In-memory semantic keyword & vector search grounded in verified OEM technical bulletins |
| **Frontend SPA** | React 18, Vite, React Router DOM v6, Axios (with auth interceptors) |
| **Visuals & Charts** | Chart.js 4.4, React-Chartjs-2, Bootstrap 5.3, Bootstrap Icons, Custom Glassmorphism Theme |
| **Typography** | Google Fonts (**Plus Jakarta Sans**, **Outfit**) |

---

## ⚡ Core Platform Capabilities

- **Interactive Public Home / Landing Page**: High-tech showcase with real-time interactive risk engine calculator.
- **Continuous IoT Telemetry Ingestion & Simulation**: Streams live sensor parameters every 30 seconds with instant anomaly detection.
- **Interactive Anomaly Injector**: Trigger real-world fault scenarios on-demand (Overheating $>105^\circ\text{C}$, Low Oil $<15\text{ PSI}$, Vibration $>1.8\text{ G}$, ECU Trouble Codes).
- **Dual-Mode AI Risk Assessment**:
  - **Quick AI Analysis (`QUICK`)**: Fast operational health summaries and immediate risk scoring ($0 - 100$).
  - **Deep Diagnostic (`DEEP`)**: Exhaustive root-cause reports powered by RAG similarity retrieval across vector-indexed service manuals.
- **Dynamic Telemetry HUD**: Interactive Chart.js graphs tracking historical trends for Engine Temperature, RPM, Oil Pressure, and Vibration against danger thresholds.
- **Garage Grid & Tabular Roster**: Real-time client-side search filtering by name, make, model, or VIN, plus risk level filter chips.
- **Integrated Maintenance Timeline**: Comprehensive service logging correlated with fault predictions and completion status.
- **Admin Control Center**: RAG knowledge article authoring, user role authorizations, and AI audit trail with inference latency metrics.

---

## 🚀 Quick Start (Run Locally)

### Prerequisites
- **Node.js v20+** installed.
- **MySQL 8.0** server running locally on port `3306`.
- **Groq API Key** (optional, automatic heuristic fallback included if offline).

### 1. Database Setup
Create and initialize the MySQL database using `backend/schema.sql`:
```bash
mysql -u root -p < backend/schema.sql
```
*(Or let `backend` automatically initialize the database schema on first boot).*

### 2. Launch Express Backend
```bash
cd backend
npm install
npm run dev
```
- Server starts on: **`http://localhost:5000`**
- Health check: **`http://localhost:5000/api/health`**

### 3. Launch React (Vite) Frontend
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
- Frontend starts on: **`http://localhost:5173`**

---

## 🔑 Pre-Seeded Demo Credentials

| Role | Email | Password | Scope & Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@autoguard.ai` | `Password@1234` | Full access to Admin Panel, Knowledge Base & Audit Logs |
| **Engineer** | `engineer@autoguard.ai` | `Password@1234` | Fleet-wide vehicle monitoring, diagnostics & service logging |
| **Owner** | `driver@autoguard.ai` | `Password@1234` | Scoped strictly to registered personal vehicles |
