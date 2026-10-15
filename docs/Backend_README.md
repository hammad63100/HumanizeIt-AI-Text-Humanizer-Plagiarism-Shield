# Backend Specification: AI Text Humanizer

This document outlines the backend architecture, API endpoints, database schema, rewrite pipeline, external service integrations, security policies, and build roadmap for the **AI Text Humanizer** platform. It complements the main [Product Requirements Document (PRD)](file:///h:/plagiarism%20and%20ai%20detector/PRD_AI_Text_Humanizer.md).

---

## 1. Backend Goals

- **Fidelity & Quality:** Run the rewrite pipeline reliably while strictly preserving the original meaning and factual content of the text.
- **Cost Efficiency:** Keep cost per rewrite low, predictable, and strictly controlled.
- **Access Control:** Enforce subscription plans, word limits, rate limits, and billing tiers accurately.
- **Data Privacy & Security:** Protect user text, ensure zero data training by third-party LLMs, and maintain private, transient storage.

---

## 2. Tech Stack

| Area | Choice | Why |
| :--- | :--- | :--- |
| **Language & Framework** | Python 3.12 with FastAPI *(or Node.js with NestJS)* | FastAPI offers native async support, high performance, and seamless NLP integration |
| **Database** | PostgreSQL (Supabase or Neon) | Reliable, ACID-compliant, easy to manage and host |
| **Cache & Queue** | Redis with Celery / RQ *(or BullMQ for Node)* | Asynchronous background processing for long-running rewrite tasks & rate-limiting |
| **Object Storage** | S3-compatible (Cloudflare R2) | Fast, cost-efficient storage for uploaded files (.docx, .pdf, .txt) with zero egress fees |
| **Authentication** | Supabase Auth or Clerk (JWT tokens) | Turnkey authentication, Google OAuth, short-lived secure JWTs |
| **LLM Provider** | Anthropic Claude / OpenAI via adapter pattern | Modular interface allowing zero-downtime model switching |
| **Embeddings** | OpenAI Embeddings / sentence-transformers | Vector similarity verification for the Meaning-Lock score |
| **Payments** | Paddle, Lemon Squeezy, or Stripe | Global subscriptions, tax handling, and webhook integration |
| **Hosting** | Railway, Render, or Fly.io (Docker-based) | Simple deployment, elastic scalability, reproducible container environments |
| **Monitoring** | Sentry, structured JSON logs, uptime monitors | Fast triage of system failures and performance bottlenecks |

---

## 3. Architecture & Workflow

```text
[ Client ] 
    │
    ▼ (1. Check limits, auth & rate limit)
[ FastAPI Server ] ────► [ PostgreSQL ] (Save Job & State)
    │
    ▼ (2. Enqueue Job)
[ Redis Queue ]
    │
    ▼ (3. Dequeue & Process)
[ Worker Pipeline ] ◄───► [ External APIs (LLM, Detector, Plagiarism) ]
    │
    ▼ (4. Save Results & Meaning Score)
[ PostgreSQL / S3 ]
    │
    ▼ (5. Polling / WebSocket)
[ Client Receives Finished Job ]
```

1. **Intake & Validation:** The API server receives a request, authenticates the user (or guest session), verifies plan limits, and checks rate limits.
2. **Job Persistence:** A job record is created in PostgreSQL and pushed onto the Redis queue.
3. **Worker Execution:** A dedicated worker process picks up the job and executes the multi-stage rewrite pipeline.
4. **Result Storage:** The worker persists rewritten content, scans, and quality metrics to the database and marks the job status as `done`.
5. **Client Retrieval:** The frontend polls `GET /v1/jobs/{id}` (or listens to a stream) until the job completes.

> **Note:** Keeping rewrites in background worker jobs ensures the API remains responsive and long-running LLM calls do not block client threads.

---

## 4. API Endpoints (v1)

All endpoints accept and return JSON. Authenticated users send a Bearer JWT token; guests use a signed anonymous session cookie.

| Method | Path | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/v1/humanize` | Create a rewrite job (`text`, `mode`, `tone`, optional `voice_profile_id`) | Guest / User |
| `GET` | `/v1/jobs/{id}` | Retrieve job status (`queued`, `running`, `done`, `failed`) and result | Owner |
| `POST` | `/v1/detect` | Analyze text and return AI probability score with sentence flags | Guest / User |
| `POST` | `/v1/plagiarism` | Create a plagiarism scan job | Guest (limited) / User |
| `POST` | `/v1/rewrite-sentence`| Rewrite a single sentence in context | Guest / User |
| `POST` | `/v1/citations` | Generate academic citation from a provided source URL/text | User |
| `GET` | `/v1/usage` | Get word counts used, current plan limits, and reset date | Guest / User |
| `GET` | `/v1/documents` | List user document history | User |
| `GET` | `/v1/documents/{id}` | Retrieve a specific document history item | User |
| `DELETE`| `/v1/documents/{id}` | Permanently delete a document history item | User |
| `POST` | `/v1/voice-profile` | Upload sample texts to construct a custom writing style profile | User |
| `POST` | `/v1/uploads` | Upload `.docx`, `.pdf`, or `.txt` file for text extraction | User |
| `POST` | `/v1/billing/checkout` | Create a payment checkout session | User |
| `POST` | `/v1/billing/portal` | Open the billing customer management portal | User |
| `POST` | `/v1/webhooks/billing`| Ingest signed provider billing webhooks | Signed Provider |
| `GET` | `/health` | Server and dependency health check | Public |

### Standard Error Codes

| Code | Meaning | Reason |
| :--- | :--- | :--- |
| **400** | Bad Request | Empty payload, invalid parameters, or unknown mode |
| **401** | Unauthorized | Missing or expired authentication token |
| **402** | Payment Required | Plan word limit reached; tier upgrade required |
| **413** | Payload Too Large | Text exceeds max word length per request for current plan |
| **422** | Unprocessable Entity| Request validation failure (malformed JSON, invalid types) |
| **429** | Too Many Requests | Rate limit exceeded |
| **500** | Internal Server Error| Server bug; logged and dispatched to Sentry |
| **502** | Bad Gateway | External upstream failure (LLM, AI detector, or plagiarism provider down) |

---

## 5. Database Schema (PostgreSQL)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    plan TEXT NOT NULL DEFAULT 'free', -- 'free', 'pro', 'premium', 'team'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    original_text TEXT NOT NULL,
    rewritten_text TEXT,
    mode TEXT NOT NULL,                -- 'light', 'balanced', 'strong'
    tone TEXT,
    word_count INT NOT NULL,
    meaning_score NUMERIC,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL for guests
    session_id TEXT,                                      -- For guest sessions
    type TEXT NOT NULL,                                   -- 'humanize', 'plagiarism', 'detect'
    status TEXT NOT NULL,                                 -- 'queued', 'running', 'done', 'failed'
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMPTZ
);

CREATE TABLE scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    ai_score_before NUMERIC,
    ai_score_after NUMERIC,
    plagiarism_percent NUMERIC,
    sources JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE voice_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    style JSONB NOT NULL,              -- sentence length, vocab level, stylistic habits
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE usage_daily (
    user_id UUID NOT NULL,
    day DATE NOT NULL,
    words_used INT NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, day)
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,            -- 'stripe', 'paddle', 'lemonsqueezy'
    provider_customer_id TEXT NOT NULL,
    status TEXT NOT NULL,
    renews_at TIMESTAMPTZ
);

-- Recommended Indexes
CREATE INDEX idx_documents_user_created ON documents(user_id, created_at DESC);
CREATE INDEX idx_jobs_status_created ON jobs(status, created_at);
CREATE INDEX idx_usage_daily_lookup ON usage_daily(user_id, day);
CREATE INDEX idx_jobs_session ON jobs(session_id) WHERE session_id IS NOT NULL;
```

> **Guest Data Policy:** Guest jobs and temporary documents are tied to a session ID and pruned after **24 hours** via a scheduled cleanup worker.

---

## 6. Rewrite Pipeline (Worker)

The background worker executes the rewrite task through a 10-step pipeline:

```text
[1. Validate & Reserve] ──► [2. Protect Entities] ──► [3. Chunking] ──► [4. Style Analysis]
          ▲                                                                   │
          │                                                                   ▼
[10. Settle Usage / Release] ◄── [9. Save Output] ◄── [8. Quality Gates] ◄── [5. LLM Rewrite]
                                                                              │
                                                                              ▼
                                                    [7. Clean Up] ◄── [6. Restore Entities]
```

1. **Validate & Reserve:** Check word counts against current plan limits and daily allowance. Atomically reserve words in Redis/DB.
2. **Protect Entities:** Detect and protect proper nouns, numbers, dates, quotes, URLs, citations, and domain terminology with placeholders (e.g. `[[P1]]`, `[[P2]]`).
3. **Split / Chunking:** Divide input into coherent chunks of 300–500 words at natural paragraph/sentence boundaries, carrying small contextual overlap.
4. **Analyze:** Compute baseline readability metrics (average sentence length, passive voice frequency, repetitive openers).
5. **Rewrite:** Transmit chunks to the LLM adapter with the system rewrite prompt and chosen tone/mode settings.
6. **Restore:** Reinsert protected placeholder terms (`[[P1]]`, `[[P2]]`) precisely into the rewritten text.
7. **Clean Up:** Normalize whitespace, fix punctuation, remove repetitive transition phrases, and enforce grammar rules.
8. **Quality Gates:**
   - **Meaning-Lock Gate:** Generate vector embeddings for original vs. rewritten text. If cosine similarity is below `0.85`, auto-retry once using `Light` mode constraints.
   - **AI Score Gate:** Evaluate the result with the AI detector adapter. If score is still excessively high, execute an alternate pass (maximum 2 extra passes).
9. **Save:** Write document and scan records to PostgreSQL and mark job status as `done`.
10. **Bill Words:** Finalize reserved words against user account. On pipeline failure, release the reserved quota automatically.

### Timeouts & Resiliency
- LLM Call Timeout: **60 seconds** with up to 2 retries using exponential backoff.
- Total Job Timeout: **3 minutes**.
- Unhandled errors safely mark the job as `failed` with sanitized client errors.

---

## 7. Rewrite Prompt Guidelines

The system prompt enforces strict editorial constraints:

- **Persona:** Professional human editor rewriting text for clarity, cadence, and natural flow.
- **Factual Integrity:** Every fact, datum, figure, proper name, and core assertion must remain unchanged. No hallucinations or added claims.
- **Syntactic Variety:** Intentionally vary sentence lengths (mix punchy short sentences with balanced complex sentences).
- **Tone & Idiom:** Eliminate boilerplate robotic transitions (e.g., *"Moreover"*, *"Furthermore"*, *"In conclusion"*, *"Delve"*).
- **Placeholder Preservation:** Strict preservation of protected markers (e.g. `[[P1]]`).
- **Modes:**
  - `Light`: Conservative synonym and phrasing adjustments.
  - `Balanced`: Sentence restructuring for rhythm and readability.
  - `Strong`: Deeper paragraph restructuring and complete stylistic rework.
- Version-controlled prompt templates are stored in dedicated configuration files.

---

## 8. External Service Adapters

All external integrations sit behind modular abstractions for vendor portability:

- **`LlmProvider`**: `generate(prompt: str, settings: dict) -> (text: str, tokens: int)`
- **`DetectorProvider`**: `score(text: str) -> (ai_percentage: float, flags: list[dict])`
- **`PlagiarismProvider`**: `scan(text: str) -> (similarity_percentage: float, sources: list[dict])`
- **`EmbeddingProvider`**: `embed(text: str) -> list[float]`

> **Fault Isolation:** Operational costs, token usage, and latency are recorded per invocation. If non-critical secondary services fail (e.g., detector or plagiarism), the core rewrite still completes successfully with appropriate partial status warnings.

---

## 9. Limits, Rate Limiting & Usage

| Tier | Max Words / Request | Words / Period | Plagiarism Scans |
| :--- | :--- | :--- | :--- |
| **Guest** | 300 words | 1,000 / day | 1 / day |
| **Free** | 300 words | 1,000 / day | 1 / day |
| **Pro** | 3,000 words | 50,000 / month | Included (fair use) |
| **Premium** | 10,000 words | 200,000 / month | Included (fair use) |

- **Rate Limits:** Enforced via Redis sliding window (e.g. 10 req/min for authenticated users, 5 req/min per IP for guests).
- **Quota Reservation:** Words are reserved prior to job dispatch and settled upon completion; aborted or failed jobs incur zero charge.
- **Abuse Prevention:** Cloudflare Turnstile CAPTCHA triggered for guests upon suspicious activity or repeated requests.

---

## 10. Billing & Subscriptions

1. **Checkout Initiation:** Frontend triggers `POST /v1/billing/checkout` specifying the target plan.
2. **Session Creation:** Backend creates a secure provider checkout session and returns the checkout redirect URL.
3. **Webhook Ingestion:** Payment gateway dispatches signed webhooks to `POST /v1/webhooks/billing`.
4. **Idempotent Handling:** Backend checks the unique webhook event ID to prevent duplicate credit additions, updates the `subscriptions` table, and applies the upgraded plan tier.
5. **Lifecycle Coverage:** Handles subscription created, renewed, past-due, canceled, and refunded events.

---

## 11. Security & Privacy

- **Token Security:** Verify JWTs on all private routes with short expiration periods.
- **Input Validation:** Strict Pydantic / class-validator schemas on all incoming payloads; enforce maximum character/byte caps.
- **Zero-Training LLM Policy:** Ensure enterprise data-privacy flags are configured on LLM vendor accounts (data opt-out).
- **PII & Text Protection:** Do not log full user text bodies; log only job IDs, token counts, character lengths, and latencies.
- **Data Retention:** Automatically purge guest records after 24 hours. Delete user-requested deletions within 30 days.
- **Document Sandboxing:** Parse and extract uploaded files (`.docx`, `.pdf`) inside isolated worker sandboxes.
- **Secret Management:** Never store credentials in source control; read all configuration from environment variables.

---

## 12. Admin & Ops Capabilities

- **User & Plan Management:** Inspect user accounts, active subscription tiers, and consumption metrics.
- **Cost Auditing:** Daily aggregated breakdown of LLM token costs, detector credits, and plagiarism scans.
- **Job Observability:** Filter failed jobs, inspect sanitized stack traces, and measure failure rates.
- **Account Actions:** Ability to ban abusive IPs/accounts or trigger refunds.
- **Dynamic Config:** Update plan word allowances without redeploying via a dynamic database config table.

---

## 13. Observability & Monitoring

- **Structured Logging:** JSON logs carrying `request_id`, `user_id`, and `job_id`.
- **Key Metrics:**
  - Throughput (jobs/min)
  - P95 / P99 rewrite turnaround latency
  - Queue lag and active worker counts
  - Cost per rewrite transaction
- **Alerting Thresholds:**
  - Overall pipeline failure rate > 5%
  - Queue latency > 2 minutes
  - Cost spikes exceeding daily budgetary thresholds
- **Error Tracking:** Real-time Sentry alerting for both API server and background workers.

---

## 14. Testing Plan

- **Unit Tests:** Regex entity protection and placeholder re-insertion, chunk splitting boundaries, usage limit checks.
- **Integration Tests:** Endpoint verification with an isolated test database and mocked LLM/detector adapters.
- **Pipeline Benchmarks:** Regression test suite using standardized writing samples to verify Meaning-Lock scores exceed `0.85` and entity retention is 100%.
- **Load Testing:** Concurrent simulation (e.g. 50 simultaneous users submitting 1,000-word payloads).
- **Webhook Replay Testing:** Ensure idempotency by re-broadcasting identical billing webhook payloads.

---

## 15. Environment Variables

```env
# Database & Cache
DATABASE_URL=postgresql://user:password@localhost:5432/humanizer_db
REDIS_URL=redis://localhost:6379/0

# LLM Configuration
LLM_API_KEY=your_llm_api_key
LLM_MODEL=claude-3-5-sonnet-20241022

# External Services
DETECTOR_API_KEY=your_detector_api_key
PLAGIARISM_API_KEY=your_plagiarism_api_key
EMBEDDING_API_KEY=your_embedding_api_key

# Authentication
AUTH_JWT_SECRET=your_jwt_secret_key

# Billing & Payments
BILLING_API_KEY=your_billing_api_key
BILLING_WEBHOOK_SECRET=your_billing_webhook_signing_secret

# Object Storage (S3 / Cloudflare R2)
STORAGE_BUCKET=humanizer-documents
STORAGE_KEY=your_storage_access_key
STORAGE_SECRET=your_storage_secret_key
STORAGE_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com

# Bot Protection & Observability
TURNSTILE_SECRET=your_turnstile_secret
SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
```

---

## 16. Build Checklist (MVP Order)

- [ ] Project setup, Docker containerization, and database migrations
- [ ] Authentication system and guest session cookie handler
- [ ] Database tables: `users`, `documents`, `jobs`, and `usage_daily`
- [ ] LLM adapter abstraction and basic `POST /v1/humanize` with background worker
- [ ] Entity protection (`[[P1]]`), restoration engine, and text chunking
- [ ] Job status polling endpoint (`GET /v1/jobs/{id}`)
- [ ] Detector adapter and `POST /v1/detect`
- [ ] Plagiarism adapter and `POST /v1/plagiarism`
- [ ] Rate limiting, word quota reservation, and usage tracking
- [ ] Billing checkout session generation and webhook ingestion
- [ ] History endpoints (`GET /v1/documents`) and data deletion
- [ ] Meaning-Lock embedding validation and retry rules
- [ ] Structured logging, cost tracking, and Sentry integration
- [ ] Admin panel baseline features
- [ ] Voice Match style profiles, file uploads, and citations *(Post-MVP)*
- [ ] Comprehensive load testing and security review prior to production launch
