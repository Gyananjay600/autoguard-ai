# AutoGuard AI — Technical Architecture & Project Specifications

## 1. Executive Summary

**AutoGuard AI** is an intelligent, full-stack vehicle fleet maintenance and diagnostic platform. It bridges raw IoT vehicle telemetry streams—such as Engine RPM, Temperature, Oil Pressure, Vibration index, and DTC Error Codes—with generative AI diagnostics and Retrieval-Augmented Generation (RAG). 

By evaluating sensor telemetry against historical operational thresholds and vector-indexed maintenance manuals, AutoGuard AI enables fleet owners, service technicians, and enterprise administrators to transition from reactive breakdowns to proactive predictive care.

---

## 2. Problem Statement

Modern fleet operations face significant operational friction:

1. **Reactive Maintenance Pitfalls**: Vehicle repairs traditionally happen *after* a critical component fails or an engine warning light illuminates, leading to costly downtime, towing expenses, and secondary component damage.
2. **Telemetry Data Overload**: Connected vehicles generate continuous streams of high-frequency sensor readings (RPM, temperature, oil pressure, vibration). Raw numerical readings are difficult for non-technical operators to translate into actionable repair steps.
3. **Unanchored & Hallucinated AI Insights**: Standalone generative AI models lack context regarding specific mechanical specs, service history, and manufacturer-recommended repair workflows, often generating generic or unsafe recommendations.
4. **Data Isolation & Visibility Gaps**: Individual vehicle owners lack real-time visibility into engine metrics, while fleet engineers and managers lack a centralized telemetry hub to monitor fleet health, scope authorizations, and audit diagnostic requests.

---

## 3. The AutoGuard AI Solution

AutoGuard AI addresses these challenges through a modular micro-architecture:

- **Real-Time Telemetry Ingestion & Simulation**: Streams continuous vehicle sensor readings, flags parameter anomalies (e.g., Engine Temp $> 100^\circ\text{C}$, Oil Pressure $< 20\text{ PSI}$, Vibration $> 1.0$), and records diagnostic trouble codes (DTCs).
- **Dual-Mode AI Risk Assessment**:
  - **Quick Analysis (`QUICK`)**: Instant operational risk scoring ($0 - 100$) and high-level health summaries.
  - **Deep Diagnostic (`DEEP`)**: Exhaustive root-cause reports powered by RAG, embedding relevant local knowledge base articles to deliver precise repair procedures.
- **RAG Knowledge Base Integration**: Converts internal technical bulletins and repair manuals into vector embeddings using a local ONNX Transformer model, ensuring AI recommendations are grounded in verified documentation.
- **Role-Based Telemetry Command Deck**: Provides a responsive visual workspace featuring real-time Chart.js telemetry graphs, a garage grid card system, and granular access controls for `OWNER`, `ENGINEER`, and `ADMIN` user roles.

---

## 4. Deep-Dive Technology Stack

### 4.1 Backend Architecture
- **Java 21 (LTS)**: Leverages modern language capabilities, pattern matching, virtual thread readiness, and strong type safety.
- **Spring Boot 3.4.4**: Serves as the web application foundation, managing dependency injection, auto-configurations, component scanning, and application lifecycle.
- **Spring MVC**: Handles RESTful controller mappings, request routing, view resolution, and Thymeleaf model attribute binding.
- **Spring Security**: Enforces enterprise-grade security including:
  - Role-Based Access Control (`ROLE_OWNER`, `ROLE_ENGINEER`, `ROLE_ADMIN`).
  - Strict resource authorization rules (e.g., vehicle ownership verification on `/vehicles/{id}`).
  - CSRF token verification for all standard state-mutating HTTP requests (`POST`, `PUT`, `DELETE`).
  - BCrypt password hashing ($10+$ char policy with uppercase, lowercase, and numeric enforcement).
- **Spring Data JPA & Hibernate 6.6**: Object-Relational Mapping layer providing type-safe database queries, entity relationship management, transaction boundaries, and automatic database updates.

### 4.2 AI & Retrieval-Augmented Generation (RAG)
- **Spring AI (v1.0.0-M6)**: Unified AI abstraction layer for seamless model integration and prompt template engineering.
- **Groq API (`openai/gpt-oss-20b`)**: High-speed, OpenAI-compatible LLM inference engine providing low-latency diagnostic generation.
- **Spring AI Transformers (Local ONNX Model)**: Local HuggingFace Transformer ONNX embedding model running directly within the JVM. Generates dense vector representations of knowledge base articles on startup without external API dependencies.
- **In-Memory Vector Store**: Stores semantic embeddings of knowledge base content, allowing similarity searches during `DEEP` diagnostic requests to inject exact maintenance manual context into prompts.

### 4.3 Database & Data Persistence
- **MySQL 8.0**: Production relational database for persistent storage of users, vehicles, sensor readings, maintenance logs, knowledge articles, and AI audit request records.
- **HikariCP Connection Pool**: High-performance JDBC connection pooling ensuring minimum latency during concurrent database operations.

### 4.4 Frontend & UI Design System
- **Thymeleaf 3**: Server-side Java template engine providing clean, reactive HTML rendering with Spring Security dialect integration.
- **Custom Design System (`app.css`)**: Modern visual language featuring:
  - Dark mode/glassmorphism aesthetics with frosted card elements (`backdrop-filter: blur()`).
  - Sleek **Plus Jakarta Sans** and **Outfit** Google Fonts.
  - Interactive **Garage Cards Grid System** with live client-side search filtering.
  - Split-screen high-tech authentication views fitted cleanly to `100vh` viewports.
- **Bootstrap 5.3 & Bootstrap Icons**: Responsive grid system, modal containers, and icons.
- **Chart.js 4.4**: Dynamic client-side line graphs rendering historical sensor telemetry (Engine Temp, RPM, Oil Pressure, Vibration) with warning threshold indicators.

### 4.5 Build & Verification Pipeline
- **Apache Maven**: Dependency management, build automation, and lifecycle packaging.
- **JUnit 5 & Spring Boot Starter Test**: Framework for unit, integration, and security authorization testing.

---

## 5. System Reliability, Security & Resiliency

| Architectural Pillar | Implementation Details |
| :--- | :--- |
| **Data Isolation & Security** | Strict ownership scoping prevents unauthorized access. Vehicle endpoints check logged-in user credentials; `OWNER` users can only view their registered assets, while `ENGINEER`/`ADMIN` manage the entire fleet. |
| **AI Reliability & Failover** | Automatic fallback handling prevents service outages if external Groq AI APIs experience latency or rate limits. Structured JSON logging records all AI requests, token latencies, and risk scores into audit tables. |
| **Local RAG Fallback** | ONNX transformer embeddings execute locally in-memory, ensuring semantic knowledge retrieval works even under offline network conditions. |
| **Telemetry Anomaly Thresholds** | Real-time threshold validation flags out-of-spec readings immediately (Engine Temp $>100^\circ\text{C}$, Oil Pressure $<20\text{ PSI}$, Vibration $>1.0$, DTC DTC presence). |
| **Database Transaction Safety** | `@Transactional` boundary enforcement ensures data integrity across multi-step operations (e.g., saving sensor data and updating vehicle health scores simultaneously). |

---

## 6. How to Run & Verify

1. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and set MySQL credentials & Groq API key:
   ```properties
   AUTOGUARD_DB_URL=jdbc:mysql://localhost:3306/autoguard_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
   AUTOGUARD_DB_USERNAME=root
   AUTOGUARD_DB_PASSWORD=your_password
   AUTOGUARD_GROQ_API_KEY=your_groq_api_key
   ```
2. **Build Project**:
   ```bash
   ./mvnw.cmd compile
   ```
3. **Launch Application**:
   ```bash
   ./mvnw.cmd spring-boot:run
   ```
4. **Access Web Application**:
   Open `http://localhost:7070/auth/login` in your web browser.
