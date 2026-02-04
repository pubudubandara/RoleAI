# RoleAI

RoleAI is a full‑stack AI chat application that lets you:

- Create and manage Roles (custom personas/prompts)
- Save and manage Model configurations (e.g., Gemini) with encrypted API keys
- Chat with up to 3 roles sequentially and compare responses
- Persist chats with sessions and messages; friendly titles generated from first prompts
- View and manage chat history via a collapsible right sidebar
- Authenticate with JWT (login/signup, reset password flow)
- Render Markdown with code highlighting in chat

This repository is a monorepo containing a Spring Boot backend and a React + TypeScript frontend (Vite).

## Repository structure

```
backend/        # Spring Boot 3 (Java 21), JPA/Hibernate, PostgreSQL, JWT
frontend/       # React 19 + TypeScript + Vite + Tailwind CSS
```

## Prerequisites

- Java 21+
- Maven 3.9+
- Node.js 18+ (Node 20 recommended) and npm
- PostgreSQL 14+ (or compatible)

## Backend setup (Spring Boot)

### Option 1: Docker (Recommended)

1) Copy the environment file and configure secrets:

```powershell
cd backend
cp .env.example .env
# Edit .env with your actual values (JWT_SECRET, ENCRYPTION_SECRET, API keys, etc.)
```

2) Run with Docker Compose:

```powershell
docker-compose up -d
```

This will:
- Start PostgreSQL in a container
- Build and run the Spring Boot backend
- Create necessary volumes for database persistence

Backend will be available at http://localhost:8080

To view logs: `docker-compose logs -f backend`  
To stop: `docker-compose down`  
To rebuild after code changes: `docker-compose up -d --build`

### Option 2: Local Development

1) Create a PostgreSQL database and user (example):

```sql
CREATE DATABASE "RoleAI";
-- Optionally create a dedicated user and grant access
-- CREATE USER roleai WITH ENCRYPTED PASSWORD 'yourpassword';
-- GRANT ALL PRIVILEGES ON DATABASE "RoleAI" TO roleai;
```

2) Configure `backend/src/main/resources/application.properties`:

- Database URL/username/password
- JWT secret and expiration
- Encryption secret for API keys (use a strong value)
- Gemini API base URL and key (or manage via saved Model in the UI)
- Pinecone settings if using vector search

Note: Prefer not to commit real secrets. Use environment-specific config or CI secrets.

3) Build and run (Windows PowerShell):

```powershell
# From repo root
./mvnw -f backend/pom.xml -DskipTests package
./mvnw -f backend/pom.xml spring-boot:run
```

Backend will start at http://localhost:8080.

## Frontend setup (Vite + React)

1) Install dependencies and run dev server:

```powershell
cd frontend
npm install
npm run dev
```

Frontend dev server runs at http://localhost:5173 by default.

## Authentication flow

- Sign up (only one Sign Up page kept: `SignUpPageNew.tsx`)
- Login redirects to the latest chat, or creates a new one
- Buttons show loading and are disabled during submit

## Chat sessions and history

- Right sidebar shows chat history; toggle with the floating “History” handle on the right edge
- Create a new chat from the sidebar
- Delete a chat with a confirmation modal; if deleting the current chat, the app routes to the next or creates a fresh one

## Markdown rendering and code highlighting

- Messages render with Markdown, GitHub‑style tables/lists, and syntax highlighting
- Newlines are preserved; excessive blank lines are normalized (no more than two in a row)

## Model management

- Add model configurations (e.g., Gemini provider and model ID)
- API keys are encrypted at rest using AES‑GCM
- Choose the saved model to use for chat; the backend uses either the global key or the selected model’s key

## Development notes

- Monorepo with separate backend/frontend; run both during development
- Spring Security stateless JWT, custom `JwtFilter`
- Entities: `User`, `Role`, `ChatSession` (string ID), `ChatMessage`, `ModelConfig`
- Controllers: Auth, Roles, Chat (generate replies), ChatSessions (list/create/messages/delete), ModelConfig
- UI: Role and Model management with add/edit/delete modals and confirmations; consistent dark theme
