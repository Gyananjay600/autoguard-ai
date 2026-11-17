# AutoGuard AI — Technical Architecture & Project Specifications

## 1. Executive Summary

**AutoGuard AI** is an intelligent, decoupled full-stack vehicle fleet maintenance and diagnostic platform. It connects raw IoT vehicle telemetry streams—such as Engine RPM, Temperature, Oil Pressure, Vibration index, and DTC Error Codes—with generative AI diagnostics and Retrieval-Augmented Generation (RAG). 

By evaluating sensor telemetry against historical operational thresholds and vector-indexed maintenance manuals, AutoGuard AI enables fleet owners, service technicians, and enterprise administrators to transition from reactive breakdowns to proactive predictive care.

---

## 2. Decoupled Architecture

```
┌────────────────────────────────────────────────────────┐
│                   React 18 SPA (Vite)                  │
│   Landing Page • Fleet HUD • Garage Grid • Admin Desk  │
└───────────────────────────┬────────────────────────────┘
                            │ REST / JSON (CORS)
                            │ Bearer JWT Authentication
┌───────────────────────────▼────────────────────────────┐
│                  Express.js (Node.js)                  │
│    Routes • Controllers • Services • Middleware        │
├───────────────────────────┬────────────────────────────┤
│      Database Layer       │       AI & RAG Layer       │
│  MySQL 8.0 Connection     │  Groq API (LLaMA 3.3)      │
│  Pool (mysql2/promise)    │  Semantic RAG Grounding    │
└───────────────────────────┴────────────────────────────┘
```

---

## 3. Technology Stack

### 3.1 Backend Architecture
- **Node.js (v20+ LTS)**: High-throughput asynchronous event-driven JavaScript runtime.
- **Express.js (v4.21)**: RESTful API router with structured ES modules (`server.js`, `routes/`, `controllers/`, `services/`, `middleware/`).
- **Security & Authorization**:
  - Stateless JSON Web Tokens (`jsonwebtoken`) with expiration and payload verification.
  - BCrypt password hashing (`bcryptjs`, 10 rounds).
  - Role-Based Access Control (`OWNER`, `ENGINEER`, `ADMIN`).
  - Strict vehicle ownership validation middleware.
  - CORS middleware configured for `http://localhost:5173`.
- **Database Persistence**:
  - MySQL 8.0 relational database with Foreign Key cascades and indexing.
  - `mysql2/promise` connection pooling with auto-reconnect.
  - Auto-initialization script (`backend/config/db.js` & `backend/schema.sql`).

### 3.2 AI & Retrieval-Augmented Generation (RAG)
- **Groq API Inference**: Low-latency OpenAI-compatible endpoints executing `llama-3.3-70b-versatile`.
- **Dual-Mode Inference Engine**:
  - `QUICK`: Plain-language risk scoring and high-level health advisory for vehicle owners.
  - `DEEP`: Exhaustive multi-point mechanical diagnostic with root-cause analysis and step-by-step repair checklist.
- **RAG Knowledge Base**: Semantic search and technical bulletin grounding preventing hallucinations.
- **Automated Fallback**: Graceful offline heuristic engine ensures uninterrupted system reliability.

### 3.3 Frontend Single Page Application
- **React 18 & Vite**: Lightning-fast HMR and optimized production bundling.
- **React Router DOM v6**: Protected client-side routing with role verification guards.
- **Axios**: Configured client with automatic Bearer token injection and 401 unauthenticated redirect interceptor.
- **Chart.js 4.4 & React-Chartjs-2**: High-performance canvas line charts with threshold danger zones.
- **Design System**: Glassmorphism aesthetic, Plus Jakarta Sans & Outfit typography, responsive Garage Cards Grid.

---

## 4. Database Schema Specification

- **`users`**: User identity, hashed passwords, roles (`OWNER`, `ENGINEER`, `ADMIN`).
- **`vehicles`**: Fleet assets with make, model, year, mileage, engine specs, VIN, and owner foreign key.
- **`sensor_readings`**: High-frequency telemetry points (RPM, engine temperature, oil pressure, vibration, DTCs).
- **`fault_predictions`**: Algorithmic risk scores ($0 - 100$), risk levels (`LOW`, `MEDIUM`, `HIGH`), and fault signatures.
- **`ai_explanations`**: Generated AI diagnostic narratives, prompt summaries, and model metadata.
- **`ai_request_log`**: Audit history tracking inference latency (ms), model names, and risk metrics.
- **`knowledge_articles`**: Grounding technical bulletins indexed for RAG context extraction.
- **`maintenance_records`**: Chronological repair logs with completion toggles.
