# HumanizeIt — AI Text Humanizer & Plagiarism Shield Backend

This is the production-ready Node.js & TypeScript backend for the **AI Text Humanizer & Plagiarism Shield** platform, built to the exact specifications outlined in [docs/Backend_README.md](file:///h:/plagiarism%20and%20ai%20detector/docs/Backend_README.md) and [docs/PRD_AI_Text_Humanizer.md](file:///h:/plagiarism%20and%20ai%20detector/docs/PRD_AI_Text_Humanizer.md).

---

## 🚀 Features

- **10-Step Rewrite Pipeline**:
  1. *Validate & Reserve* — validates word caps and reserves quotas atomically.
  2. *Protect Entities* — masks proper nouns, dates, numbers, citations, URLs into placeholders (`[[P1]]`, `[[P2]]`).
  3. *Chunking* — splits documents into 300–500 word semantically coherent blocks.
  4. *Style Analysis* — calculates average sentence length, passive voice frequency, and readability metrics.
  5. *LLM Rewrite* — dispatches chunks to Claude/OpenAI adapters with editorial prompts (Light, Balanced, Strong modes).
  6. *Restore Entities* — re-inserts protected entity placeholders back into the output without modification.
  7. *Clean Up* — strips robotic transitions (*"Moreover"*, *"Furthermore"*, *"In conclusion"*), fixes punctuation and spacing.
  8. *Quality Gates*:
     - **Meaning-Lock Gate**: Computes cosine similarity of vector embeddings (original vs. rewritten). Auto-retries in Light mode if similarity < 0.85.
     - **AI Score Gate**: Scans with the AI detector adapter. Retries up to 2 extra passes if AI probability remains high.
  9. *Save Output* — persists document records, scan scores, and finished status to the database.
  10. *Settle Usage* — finalizes token usage and quota counters.
- **Dual-Mode Data Layer**: Seamlessly connects to PostgreSQL 16 (via connection pool) with an automated in-memory storage fallback for local development or disconnected testing.
- **Full API Suite (14 Endpoints)**: Full implementation of all Humanize, Detection, Plagiarism, Sentence Rewrite, Citation, Voice Matching, File Upload, Document History, Auth, and Billing endpoints.
- **Provider Adapters**: Modular, vendor-agnostic adapters with automatic simulation fallbacks when API keys are not supplied.
- **Containerization**: Includes multi-stage production [Dockerfile](file:///h:/plagiarism%20and%20ai%20detector/backend/Dockerfile) and [docker-compose.yml](file:///h:/plagiarism%20and%20ai%20detector/backend/docker-compose.yml) spinning up PostgreSQL 16, Redis 7, and the backend server.
- **Automated Verification**: Built-in 30-assertion integration test suite (`npm test`).

---

## 📁 Project Structure

```
backend/
├── Dockerfile                  # Multi-stage production Docker build
├── docker-compose.yml          # PostgreSQL 16 + Redis 7 + API stack
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript compiler configuration
├── test-suite.ts               # End-to-end integration test suite
├── .env.example                # Sample environment configuration
├── src/
│   ├── server.ts               # Express application entry point
│   ├── config/
│   │   └── index.ts            # Environment variables & tier limit configurations
│   ├── db/
│   │   ├── index.ts            # PostgreSQL pool and connectivity health
│   │   ├── migrate.ts          # Schema migrations for all 7 tables
│   │   ├── repositories.ts     # Resilient dual-mode repository layer
│   │   └── seed.ts             # Development database seed script
│   ├── middleware/
│   │   ├── auth.ts             # JWT authentication & guest cookie sessions
│   │   ├── rateLimiter.ts      # Sliding window rate limiting & quota checks
│   │   ├── validation.ts       # Zod request validation schemas
│   │   └── index.ts            # Middleware barrel export
│   ├── pipeline/
│   │   ├── entities.ts         # Regex entity masking & placeholder restoration
│   │   ├── prompts.ts          # Tone/mode system rewrite prompts
│   │   ├── rewrite.ts          # Core 10-step background rewrite engine
│   │   └── index.ts            # Pipeline barrel export
│   ├── providers/
│   │   ├── llm.ts              # Claude / OpenAI LLM adapter
│   │   ├── detector.ts         # AI probability detector adapter
│   │   ├── plagiarism.ts       # Plagiarism scan adapter
│   │   ├── embedding.ts        # Vector embedding adapter
│   │   └── index.ts            # Provider barrel export
│   ├── routes/
│   │   ├── auth.ts             # POST /register, /login, GET /me
│   │   ├── humanize.ts         # POST /v1/humanize (asynchronous rewrite job)
│   │   ├── jobs.ts             # GET /v1/jobs/:id (job status & result polling)
│   │   ├── detect.ts           # POST /v1/detect (standalone AI likelihood score)
│   │   ├── plagiarism.ts       # POST /v1/plagiarism (web similarity scan)
│   │   ├── rewriteSentence.ts  # POST /v1/rewrite-sentence (in-context sentence)
│   │   ├── citations.ts        # POST /v1/citations (APA, MLA, Chicago formatting)
│   │   ├── usage.ts            # GET /v1/usage (word quota & tier information)
│   │   ├── documents.ts        # GET /v1/documents, GET /:id, DELETE /:id
│   │   ├── voiceProfile.ts     # POST & GET /v1/voice-profile (custom writing style)
│   │   ├── uploads.ts          # POST /v1/uploads (.docx, .pdf, .txt extraction)
│   │   ├── billing.ts          # POST /v1/billing/checkout, /portal, /webhooks
│   │   ├── health.ts           # GET /health (service & dependency health)
│   │   └── index.ts            # Routes barrel export
│   ├── types/
│   │   └── index.ts            # Shared TypeScript interfaces & types
│   └── utils/
│       └── index.ts            # Logger, word counter, cosine similarity, helpers
```

---

## 🛠️ Getting Started

### 1. Installation

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Key environment variables:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | API server listen port | `4000` |
| `NODE_ENV` | Environment mode (`development` or `production`) | `development` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/humanizer_db` |
| `REDIS_URL` | Redis cache and queue connection | `redis://localhost:6379/0` |
| `LLM_API_KEY` | Anthropic Claude or OpenAI API key | *(Simulated fallback if blank)* |
| `DETECTOR_API_KEY` | AI Detection provider API key | *(Simulated fallback if blank)* |
| `PLAGIARISM_API_KEY`| Plagiarism check provider API key | *(Simulated fallback if blank)* |
| `AUTH_JWT_SECRET` | Secret key for signing authentication JWTs | `dev_secret_change_me` |

### 3. Run Development Server

```bash
npm run dev
```

The server boots on `http://localhost:4000`.

### 4. Run Integration Tests

```bash
npm test
```

Runs the 30-assertion test suite verifying all 14 API routes, job processing, and authentication flows.

### 5. Build for Production

```bash
npm run build
npm start
```

---

## 🐳 Docker & Docker Compose

To start PostgreSQL 16, Redis 7, and the Backend API together:

```bash
docker compose up -d --build
```

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Server and dependency health check |
| `POST` | `/v1/auth/register` | Register a new user account |
| `POST` | `/v1/auth/login` | Authenticate and retrieve Bearer JWT |
| `GET` | `/v1/auth/me` | Fetch authenticated user profile |
| `POST` | `/v1/humanize` | Submit rewrite job (`text`, `mode`, `tone`) |
| `GET` | `/v1/jobs/:id` | Poll job status (`queued`, `running`, `done`, `failed`) and result |
| `POST` | `/v1/detect` | Standalone AI likelihood detection with sentence flags |
| `POST` | `/v1/plagiarism` | Web plagiarism similarity scan |
| `POST` | `/v1/rewrite-sentence` | In-context single sentence rewrite |
| `POST` | `/v1/citations` | Generate APA, MLA, or Chicago academic citations |
| `GET` | `/v1/usage` | Fetch word quota usage and reset schedules |
| `GET` | `/v1/documents` | List document history |
| `GET` | `/v1/documents/:id` | Fetch specific document with scan results |
| `DELETE`| `/v1/documents/:id` | Delete document |
| `POST` | `/v1/voice-profile` | Build custom style profile from text samples |
| `GET` | `/v1/voice-profile` | List user voice profiles |
| `POST` | `/v1/uploads` | Extract text from `.docx`, `.pdf`, or `.txt` files |
| `POST` | `/v1/billing/checkout` | Create checkout session |
| `POST` | `/v1/billing/portal` | Open customer billing portal |
| `POST` | `/v1/webhooks/billing` | Ingest signed payment provider webhooks |
