# Frontend Specification & Development Guide: AI Text Humanizer

A modern, high-performance web frontend for **HumanizeIt** — turning stiff, AI-generated drafts into natural, human prose with real-time AI likelihood scoring and plagiarism reports.

---

## 1. Frontend Goals

- **Zero-Barrier Access:** Guests can paste text and get humanized results immediately with no login.
- **All-in-One Dashboard:** Side-by-side rewritten text, before/after AI scores, and plagiarism report on a single screen.
- **High Performance:** Page loads in under 2 seconds; optimized for mobile screens.
- **SEO Ready:** Static generation (SSG) for landing, pricing, and blog pages for high search ranking.

---

## 2. Tech Stack

| Area | Tool / Library | Purpose |
| :--- | :--- | :--- |
| **Framework** | **Next.js 14+ (App Router)** + TypeScript | SSR/SSG, file-based routing, SEO |
| **Styling** | **Tailwind CSS** | Utility-first, responsive, lightweight |
| **UI Components** | **shadcn/ui** (Radix UI) | Accessible, customizable components |
| **Server State** | **TanStack Query (React Query)** | Caching, polling job status, loading states |
| **Local State** | **Zustand** | Clean management for editor, mode, and tone |
| **Form Handling** | **React Hook Form + Zod** | Form validation & schema checking |
| **Diff Highlighting**| **diff-match-patch** or **jsdiff** | Visual added/removed word comparison |
| **Charts / Gauges** | Custom lightweight **SVG Gauge** | Fast AI score rendering without bulky libraries |
| **Authentication** | **Clerk** or **Supabase Auth** | Google OAuth & email login |
| **Analytics & Errors**| **PostHog** & **Sentry** | User funnels & crash monitoring |
| **Testing** | **Vitest** + **Playwright** | Unit and end-to-end user flow testing |

---

## 3. Project Folder Structure

```text
src/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx               # Landing page with instant tool
│   │   ├── pricing/page.tsx       # Pricing tiers & FAQ
│   │   └── blog/[slug]/page.tsx   # SEO blog articles
│   ├── (legal)/
│   │   ├── terms/page.tsx         # Terms of Service
│   │   └── privacy/page.tsx       # Privacy Policy
│   ├── tool/page.tsx              # Full standalone humanizer dashboard
│   ├── history/page.tsx           # Past humanized documents (Auth required)
│   ├── account/page.tsx           # Billing, usage, Voice Match settings
│   ├── login/page.tsx             # Login / Signup screen
│   └── api/                       # Thin proxies / Next.js route handlers
├── components/
│   ├── editor/                    # InputBox, OutputBox, DiffView
│   ├── scores/                    # AiScoreGauge, PlagiarismReport, MeaningBadge
│   ├── controls/                  # ModeSelector, ToneSelector, HumanizeButton
│   ├── layout/                    # Header, Footer, UpgradeModal, ThemeToggle
│   └── ui/                        # Reusable shadcn/ui primitives (Button, Modal, etc.)
├── hooks/
│   ├── useHumanize.ts             # Starts rewrite job & polls for completion
│   ├── usePlagiarism.ts           # Triggers plagiarism scan
│   └── useUsage.ts                # Tracks remaining word limits
├── lib/
│   ├── api-client.ts              # Typed Axios/Fetch client
│   ├── limits.ts                  # Client-side word count & plan guards
│   └── analytics.ts               # PostHog event logging (excludes text content)
├── store/
│   └── toolStore.ts               # Zustand store for input text, mode, tone, & results
└── types/
    └── api.ts                     # TypeScript interfaces for API requests/responses
```

---

## 4. Pages & Routing

| Route | Purpose | Render Type | Auth Required? |
| :--- | :--- | :--- | :--- |
| `/` | Landing page with instant humanizer tool | Static (SSG) | No |
| `/tool` | Dedicated full workspace dashboard | Client + Server | No (capped) / Yes |
| `/pricing` | Plan tiers, comparison table, and FAQ | Static (SSG) | No |
| `/history` | Search and manage past saved rewrites | Client | Yes |
| `/account` | Manage plan, invoices, and Voice Match profile | Client | Yes |
| `/login`, `/signup` | Authentication and Google OAuth | Client | No |
| `/blog`, `/blog/[slug]`| Educational and SEO content | Static (SSG) | No |
| `/terms`, `/privacy` | Legal policies, ethics, and refund terms | Static | No |

---

## 5. Main Tool Screen Specifications

### 5.1 Layout
- **Desktop:** Two-column split canvas.
  - **Left Pane:** Input text area, word counter, mode and tone controls.
  - **Right Pane:** Rewritten output, before/after AI gauges, and plagiarism report.
- **Mobile:** Single column flow with sticky `Humanize` action bar and tabbed output (Result / Changes / Scores).

### 5.2 Key Components
1. **InputBox:** Real-time word counter (e.g., `120 / 300 words`). Displays upgrade prompt when limit is near.
2. **ModeSelector:** Radio buttons:
   - `Light` (minor smoothing, exact structure)
   - `Balanced` (default natural rhythm)
   - `Strong` (reorganized syntax, maximum flow)
3. **ToneSelector:** Dropdown (`Casual`, `Professional`, `Academic`, `Friendly`, `Blog`).
4. **HumanizeButton:** Disabled when empty or over word limit. Shows spinner and `Rewriting...` while processing.
5. **OutputBox:** Features `Copy`, `Download (.txt / .docx)`, and `Regenerate` actions.
6. **DiffView:** Toggle between **Clean** text and **Show Changes** (green for additions, strikethrough red for deletions).
7. **AiScoreGauge:** Dual gauges showing **Before %** and **After %** with note: *"Estimate only"*.
8. **SentenceHighlight:** Soft-underlines sentences with high AI probability; clicking opens single-sentence rewrite.
9. **PlagiarismReport:** Similarity %, list of source URLs, and a `"Rewrite flagged parts"` action.
10. **MeaningScore:** Badge (e.g., `Meaning kept: 92%`). Turns amber below 85% with warning.
11. **UpgradeModal:** Appears when word quota is reached; presents plan checkout options.

### 5.3 Behavior Rules
- **Client-Side Word Check:** Validate and block submissions exceeding plan limit before calling backend.
- **Job Polling:** Poll `/v1/jobs/:id` every 1 second until status is `done` or `failed`.
- **Session Cache:** Persist guest input and results in `sessionStorage` to avoid data loss on accidental reload.
- **Privacy:** Never pass user text to analytics tools (only track counts, mode, and tone).
- **Mandatory Disclaimer:** Display: *"Detector scores are estimates, not definitive proof."*

---

## 6. Backend API Integration

| Method & Route | Frontend Action |
| :--- | :--- |
| `POST /v1/humanize` | Start rewrite job (returns `job_id`) |
| `GET /v1/jobs/:id` | Poll rewrite status and retrieve finished text & scores |
| `POST /v1/detect` | Standalone AI likelihood scan |
| `POST /v1/plagiarism` | Trigger deep similarity scan |
| `POST /v1/rewrite-sentence`| Rewrite an individual highlighted sentence |
| `GET /v1/usage` | Fetch current word usage and quota limits |
| `GET /v1/documents` | Fetch user's saved revision history |
| `DELETE /v1/documents/:id` | Delete revision entry |
| `POST /v1/voice-profile` | Upload writing samples for Voice Match |
| `POST /v1/billing/checkout` | Redirect user to Stripe/Paddle checkout |

---

## 7. Error & Empty States Handling

- **Empty Input:** Humanize button disabled with tooltip *"Paste some text to start"*.
- **Over Limit:** Word counter turns red; link to upgrade plan appears.
- **Rate Limit (429):** Show friendly banner: *"You're going a bit fast. Please try again in 1 minute."*
- **Failed Job:** Display *"Something went wrong. Your word balance was not charged."* with a **Retry** button.
- **Service Outage:** If AI detector or plagiarism scanner is down, output text is still delivered with score marked as *"Unavailable right now"*.

---

## 8. Environment Variables

Create a `.env.local` file in your root folder:

```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAxxxxxxxxxx
NEXT_PUBLIC_SENTRY_DSN=https://xxxxxxxx@sentry.io/xxxxxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxx
```

---

## 9. MVP Build Checklist

- [ ] Initialize Next.js 14 (App Router) + TypeScript + Tailwind CSS
- [ ] Install shadcn/ui primitives and Lucide icons
- [ ] Build Header, Footer, and Theme Toggle (Dark/Light mode)
- [ ] Implement Landing Page with hero instant text box
- [ ] Build `InputBox` with live word counter and client limit validation
- [ ] Build `ModeSelector` (Light, Balanced, Strong) and `ToneSelector`
- [ ] Set up typed API client & `useHumanize` hook with 1-second polling
- [ ] Build `OutputBox` with Copy, Download, and Regenerate buttons
- [ ] Build SVG `AiScoreGauge` (Before vs After)
- [ ] Build `DiffView` to show added/removed words
- [ ] Build `PlagiarismReport` card with *"Rewrite flagged parts"*
- [ ] Set up Auth screens (Email + Google OAuth)
- [ ] Build `UpgradeModal` and Pricing comparison table
- [ ] Connect History and Account pages
- [ ] Add SEO meta tags, OpenGraph images, and JSON-LD schema
- [ ] Run Playwright end-to-end tests for guest and upgrade flows
