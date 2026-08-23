# AutoGuard AI

AutoGuard AI is an intelligent, full-stack vehicle fleet maintenance and diagnostic platform that turns IoT sensor readings into real-time risk assessments, predictive fault explanations, and actionable repair recommendations. It is built for vehicle owners, fleet engineers, and enterprise administrators who need a centralized telemetry hub before minor mechanical anomalies become expensive breakdowns.

> 📄 For in-depth architectural specifications, technology breakdown, and reliability patterns, see [PROJECT_DETAILS.md](PROJECT_DETAILS.md).

---

## Key Features & Capabilities

- **Real-Time Telemetry & Sensor Tracking**: Ingests and monitors Engine Temperature, RPM, Oil Pressure, Vibration indices, and Diagnostic Trouble Codes (DTCs).
- **Dual-Mode AI Diagnostics**:
  - **Quick AI Analysis (`QUICK`)**: Sub-second operational risk scoring ($0-100$) and status summaries powered by Groq AI.
  - **Deep AI Diagnostic (`DEEP`)**: Exhaustive root-cause analysis powered by Retrieval-Augmented Generation (RAG).
- **Local RAG Knowledge Base**: Uses JVM-embedded ONNX Transformer models to convert maintenance manuals into vector embeddings for grounded AI repair guidance.
- **Modern High-Tech UI & Telemetry HUD**:
  - **Split-Screen Tech Authentication**: `100vh` viewport-fitted login and registration views with live feature showcases.
  - **Garage Card Grid System**: Interactive vehicle cards with live client-side search filtering by name, make, model, or VIN, with view switching to table layout.
  - **Telemetry Command Deck**: Vehicle HUD layout with specs, interactive Chart.js line graphs, warning threshold indicators, and maintenance timelines.
- **Role-Based Security**: Scoped access control for `OWNER`, `ENGINEER`, and `ADMIN` user accounts.

---

## Tech Stack

| Area | Technology |
| :--- | :--- |
| **Backend Framework** | Java 21 (LTS), Spring Boot 3.4.4, Spring MVC |
| **Security & Auth** | Spring Security, BCrypt Hashing, CSRF Protection, Role-Based Access Control |
| **Data & Persistence** | MySQL 8.0, Spring Data JPA, Hibernate 6.6, HikariCP Connection Pool |
| **AI Integration** | Spring AI (1.0.0-M6), Groq API (`openai/gpt-oss-20b`) |
| **RAG & Embeddings** | Spring AI Transformers, Local ONNX Model, In-Memory Vector Store |
| **UI & Styling** | Thymeleaf 3, Bootstrap 5.3, Bootstrap Icons, Chart.js 4.4, Custom CSS (`app.css`) |
| **Build System** | Apache Maven |

---

## Quick Start (Run Locally)

1. **Database Setup**:
   Create a MySQL database named `autoguard_db`:
   ```sql
   CREATE DATABASE autoguard_db;
   ```
2. **Environment Configuration**:
   Copy `.env.example` to `.env` and set your MySQL password and Groq API key:
   ```properties
   AUTOGUARD_DB_URL=jdbc:mysql://localhost:3306/autoguard_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
   AUTOGUARD_DB_USERNAME=root
   AUTOGUARD_DB_PASSWORD=your_mysql_password
   AUTOGUARD_GROQ_API_KEY=your_groq_api_key
   ```
3. **Compile & Run**:
   ```bash
   ./mvnw spring-boot:run
   ```
   *(PowerShell on Windows: `./mvnw.cmd spring-boot:run`)*

4. **Access Web Application**:
   Navigate to `http://localhost:7070/auth/login`, register an account, and sign in.


## License

Developed for intelligent fleet monitoring & predictive vehicle maintenance.
