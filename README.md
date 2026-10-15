# HumanizeIt — AI Text Humanizer & Plagiarism Shield

A full-stack, enterprise-grade writing platform that transforms robotic, AI-generated drafts into natural, human-sounding prose with real-time AI likelihood scoring, Meaning-Lock semantic verification, and integrated plagiarism scanning.

---

## 📁 Repository Structure

```text
plagiarism and ai detector/
├── docs/                             # Product & architectural specifications
│   ├── PRD_AI_Text_Humanizer.md      # Master Product Requirements Document (PRD)
│   ├── FRONTEND_README.md            # Frontend Architecture & UI specifications
│   └── Backend_README.md             # Backend Architecture, DB Schema & API spec
├── frontend/                         # Next.js 14+ (App Router) Web Application
│   ├── src/
│   │   ├── app/                      # App router pages (Landing, Tool, Pricing, History, etc.)
│   │   ├── components/               # UI components (Editor, Scores, Controls, Layout)
│   │   ├── hooks/                    # Custom React hooks (useHumanize, usePlagiarism, useUsage)
│   │   ├── lib/                      # API client, plan limits, analytics helpers
│   │   ├── store/                    # Zustand state management
│   │   └── types/                    # TypeScript interfaces
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── backend/                          # Express.js + TypeScript REST API Server
│   ├── src/
│   │   ├── config/                   # Environment & runtime configurations
│   │   ├── controllers/              # Request handlers (rewrite, detect, plagiarism, etc.)
│   │   ├── middleware/               # Auth, rate-limiting, and error handling
│   │   ├── providers/                # LLM (Claude/OpenAI), Detector, Plagiarism adapters
│   │   ├── routes/                   # v1 API endpoints
│   │   └── server.ts                 # Server entry point
│   ├── package.json
│   └── tsconfig.json
└── README.md                         # Main repository guide (This file)
```

---

## ✨ Key Platform Features

- **Zero-Barrier Access:** Guests can paste drafts and get humanized output immediately with zero sign-up friction.
- **Side-by-Side Canvas:** Split-screen layout displaying original text, real-time word counter, rewrite controls, and output.
- **Dual AI Gauges:** Fast, lightweight SVG gauges showing Before vs After AI likelihood estimates.
- **Meaning-Lock Verification:** Vector embedding checks ensure the rewrite preserves the original arguments and facts without semantic distortion (warns if drift exceeds 15%).
- **Interactive Diff View:** Word-by-word visual comparison with green added words and strikethrough red removals.
- **Sentence-Level Rewriting:** Soft-underlines high-probability AI sentences with one-click single-sentence rewriting.
- **Plagiarism & Citation Helper:** Scans web & academic sources and generates instant citations in APA, MLA, and Chicago formats.
- **Voice Match Studio:** Upload authentic writing samples (200–500 words) to clone unique personal sentence rhythms and vocabularies.
- **Document History:** Review past revisions, compare before/after AI scores, and permanently delete records on demand.
- **Flexible Subscription Plans:** Free/Guest tier, Pro Writer ($9.99), Unlimited Master ($19.99), and Team & Agency ($49.99).

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- **Node.js** v20+ (recommended v24)
- **npm** or **pnpm**
- **PostgreSQL** database (optional for backend persistence)
- **Redis** server (optional for backend asynchronous job queuing)

---

### 1. Frontend Setup (Next.js 14)

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be live at: **`http://localhost:3000`**

#### Frontend Environment Variables (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_POSTHOG_KEY=phc_demo_key_placeholder
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAdemo
NEXT_PUBLIC_SENTRY_DSN=https://demo@sentry.io/123456
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_demo
```
*(If connecting to an external backend service, point `NEXT_PUBLIC_API_URL=http://localhost:5000/api`)*

---

### 2. Backend Setup (Node.js / Express)

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
# Copy or edit backend/.env with your API keys and database credentials

# Run database migrations (optional if PostgreSQL is connected)
npm run migrate

# Start the backend development server
npm run dev

# Run automated integration tests
npm test
```

The backend API runs at: **`http://localhost:4000`**

### 3. Docker Compose (Full Stack)

To run PostgreSQL 16, Redis 7, and the Backend API together with a single command:

```bash
cd backend
docker compose up -d --build
```

---

## 📖 Detailed Documentation

All detailed architectural documentation, specifications, and design requirements are located in the [`docs/`](./docs) directory:

- 📄 [**Product Requirements Document (PRD)**](./docs/PRD_AI_Text_Humanizer.md) — Product vision, target personas, ethical positioning, and feature matrix.
- 🎨 [**Frontend Specification**](./docs/FRONTEND_README.md) — Next.js architecture, component breakdown, design aesthetic, and state flows.
- ⚙️ [**Backend Specification**](./docs/Backend_README.md) — API endpoints, database schema, rewrite pipeline, and third-party integrations.

---

## ⚖️ Ethical Use & AI Detector Disclaimer

1. **Estimate Only:** Detector scores (GPTZero, Turnitin, Copyleaks, etc.) are probabilistic estimates, not definitive proof of AI generation. HumanizeIt is an editing and writing improvement tool.
2. **Academic Integrity:** Users remain solely responsible for adhering to their institutional, university, or employer policies regarding AI tools and proper source citations.
3. **Zero Data Training Policy:** User text is processed transiently and is never used to train public foundation models.

---

## 🛠️ Scripts Reference

| Directory | Command | Action |
| :--- | :--- | :--- |
| **`frontend/`** | `npm run dev` | Starts Next.js dev server on port `3000` |
| **`frontend/`** | `npm run build` | Builds optimized production bundle |
| **`frontend/`** | `npm run start` | Starts Next.js production server |
| **`backend/`** | `npm run dev` | Starts Express server on port `4000` with hot-reloading |
| **`backend/`** | `npm test` | Runs 30-assertion API integration test suite |
| **`backend/`** | `npm run build` | Compiles TypeScript to `dist/` |
| **`backend/`** | `npm run migrate` | Runs PostgreSQL database migrations |
| **`backend/`** | `npm run seed` | Seeds database with development test accounts |
