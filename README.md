# 🧠 LLM Access Platform (AI Gateway + Admin Analytics)

A secure full-stack AI model access management platform designed to control, monitor, and route access to Large Language Models. 

This project demonstrates engineering maturity, system thinking, and clean abstractions as part of a technical evaluation.

---

## 🚀 Overview

This platform acts as an **AI Gateway**. Its primary objective is to provide a secure environment for AI model access with robust administrative oversight.

**Key Capabilities:**
* **Secure Access**: Users access AI models through a protected model wrapper.
* **Usage Control**: Strict per-user token usage limiting for daily and monthly quotas.
* **Proactive Rejection**: The system estimates token counts before calling the provider and rejects requests if the user is over their limit.
* **Admin Oversight**: A comprehensive portal to manage users and monitor usage history.

---

## 🏗 System Architecture


```text
Frontend (React )
       │
       ▼
Backend API (Node.js + Express)
       │
       ├── Authentication Layer (JWT + Refresh Tokens)
       ├── Model Wrapper Layer (Provider Agnostic)
       ├── Token Usage Limiter (Pre-flight estimation)
       ├── Admin Services & Analytics
       │
       ▼
PostgreSQL Database
```
## ✨ Core Features

### 🔐 Authentication & Authorization

**User Capabilities:**
* **Register, Login, and Logout**: Standard entry and session management.  
* **JWT Access Tokens**: Secure token-based access with optional refresh token mechanisms.  
* **Usage Summary**: Users can view a personal summary of their token consumption.  

**Admin Capabilities:**
* **Secure Admin Login**: Dedicated secure access for platform administrators.  
* **User Management**: View all users, activate/deactivate accounts, and revoke access.  
* **Usage Controls**: Set and modify per-user token usage limits.  
* **Usage Reset**: Ability to reset usage counters for specific users.  

**Security Implementations:**
* **Password Hashing**: Secure storage using `bcrypt` or `argon2`.  
* **RBAC & JWT**: Role-Based Access Control and JWT-based authentication.  
* **Protected Infrastructure**: Secure API routes, basic rate limiting, and strict input validation.  

---

### 🤖 Model Wrapper Layer

The platform implements a model abstraction layer to decouple user-facing requests from internal provider logic. When a user selects a model name, the backend maps it internally to the corresponding LLM provider.

**Key Mapping Design:**
* **Decoupled Logic**: Model mapping is not hardcoded in the controller; it resides in a config file, database, or service layer.  
* **Pre-flight Validation**: The wrapper validates the user's token limit before making the request.  
* **Usage Tracking**: Automatically tracks and logs input, output, and total tokens per user.  

| User Facing Model | Internal Mapping |
| :--- | :--- |
| `craftifai-gpt-5.2` | `gpt-5.2` |
| `craftifai-gpt-5-pro` | `gpt-5` |
| `craftifai-embedding-3` | `text-embedding-3-large` |

### 🤖 Wrapper Responsibilities
The model wrapper acts as the gatekeeper for all LLM interactions, ensuring the following steps are performed:
* **Pre-request Validation**: Validates user token limits prior to the request.
* **Provider Communication**: Handles the actual call to the LLM provider.
* **Token Tracking**: Precisely tracks input and output tokens from the provider response.
* **Persistence**: Logs and stores usage data per user for audit and analytics.

---

### 📊 Token Usage Limiting System
Every request to a model triggers the token usage limiter. The system records usage per user to ensure compliance with assigned quotas.

**Data points recorded per request:**
* `user_id`: Reference to the authenticated user.
* `model`: The internal model name used for the request.
* `input_tokens` / `output_tokens`: Exact counts from the provider.
* `total_tokens`: Sum of input and output.
* `timestamp`: Precise time of the transaction.

---

### 🛠 Admin Dashboard Analytics
The admin dashboard provides deep visibility into platform usage, utilizing data visualizations (Chart.js/Recharts) to help admins monitor system health:
* **Usage Plots**: Visualization of daily, weekly, and monthly token usage.
* **Granular Breakdowns**: Per-user and per-model usage analysis.

---

### 🧱 Database Schema (PostgreSQL)
PostgreSQL was selected for its robust support for relational data, ACID compliance for token counting, and efficient analytics queries.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  daily_limit INT DEFAULT 50000,
  monthly_limit INT DEFAULT 1000000,
  daily_used INT DEFAULT 0,
  monthly_used INT DEFAULT 0,
  daily_reset_at TIMESTAMP,
  monthly_reset_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE usage_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  model TEXT,
  input_tokens INT,
  output_tokens INT,
  total_tokens INT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  token TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 🔑 API Routes


| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/auth/register` | [cite_start]Register a new user[cite: 28] |
| **Auth** | `POST` | `/auth/login` | [cite_start]Authenticate and receive JWT[cite: 29, 31] |
| **Auth** | `POST` | `/auth/logout` | [cite_start]Invalidate session[cite: 30] |
| **Auth** | `POST` | `/auth/refresh` | [cite_start]Obtain new access token[cite: 38] |
| **User** | `GET` | `/user/usage` | [cite_start]Get current user's token usage summary[cite: 32] |
| **Model** | `GET` | `/model/models` | [cite_start]List available public models[cite: 62] |
| **Model** | `POST` | `/model/chat` | [cite_start]Send prompt to the model wrapper[cite: 55] |
| **Admin** | `GET` | `/admin/users` | [cite_start]List all registered users[cite: 42, 100] |
| **Admin** | `POST` | `/admin/limits` | [cite_start]Set or modify token limits for a user[cite: 44, 94] |
| **Admin** | `POST` | `/admin/reset` | [cite_start]Reset a user's usage counters[cite: 96] |
| **Admin** | `POST` | `/admin/toggle` | [cite_start]Enable or disable user access[cite: 43, 104] |
| **Analytics** | `GET` | `/admin/analytics/*` | [cite_start]Endpoints for dashboard charts and plots[cite: 106, 112] |

---

### ⚙️ Setup Instructions

#### 1. Clone repository
```bash
git clone [https://github.com/Ukriyte/LLM-Access-Platform.git](https://github.com/Ukriyte/LLM-Access-Platform.git)
cd LLM-Access-Platform
```
## ⚙️ Setup Instructions

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory to store sensitive configuration:

```env
ACCESS_SECRET=accessSecret
REFRESH_SECRET=refreshSecret
PORT=5000
DBPass=Your db password
DBPort=5432(generally)
OPENAI_API_KEY=api key
GEMINI_API_KEY=api key
```

Run the backend server:

```bash
npm start
```

## 3. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

Start the development server:

```bash
npm run dev
```
