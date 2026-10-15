# PRD: AI Text Humanizer Website
**Date:** 14 Oct 2026 · **Author:** @Hammad Khan  
**Working Name:** HumanizeIt (change it later)

---

## 1. Reality Check
No tool can promise to beat every AI detector or plagiarism checker, so this product will not promise it.
- **[Certain]** No humanizer can guarantee a 100% bypass of detectors such as GPTZero, Turnitin, or Originality.ai. Detectors update every few months. Text that scores 'human' today can be flagged next month.
- **[Certain]** AI detectors make mistakes too. Text written by a real person is sometimes flagged as AI (a false positive). This is one reason the market for this product exists.
- **[Likely]** The market is already crowded (Undetectable AI, QuillBot, StealthWriter, WriteHuman, and others). A plain 'rewrite my text' feature will not make you stand out. You need something they do not have (see Section 5).
- **[Certain]** 'Removing plagiarism' really means rewriting in your own words and giving credit to the source when needed. Only swapping words is still treated as plagiarism ('mosaic plagiarism') by many universities.
- **[Likely]** If the product is sold openly as a way to cheat, payment processors, hosting companies, and ad platforms can close your accounts. Selling it as a writing improvement tool is safer and more likely to last.

> **Decision:** The product rewrites AI-generated or stiff text into a natural, clear, human-sounding voice, and shows the user an AI score and a plagiarism check so they can decide for themselves.

---

## 2. Product Overview

### 2.1 Vision
A user pastes text, and in a few seconds gets a natural, original-sounding version, plus an AI-likelihood score and a plagiarism report on the same page.

### 2.2 One-line Pitch
*"Turn robotic text into your own voice, and see how original it sounds."*

### 2.3 Problem Statement
1. People write drafts with ChatGPT or Claude, but the output has repeated patterns, same-length sentences, and an 'AI-like' tone.
2. People who write English as a second language often have their own real writing flagged as AI by detectors.
3. Students, freelancers, marketers, and bloggers want rewrite, AI check, and plagiarism check in one place.
4. Current tools are expensive, give very low word limits, or damage the meaning of the text.

### 2.4 Goals
- **G1:** Rewrite text so it sounds natural while keeping the meaning.
- **G2:** Show an AI score before and after every rewrite.
- **G3:** Show a plagiarism similarity report and let the user rewrite only the flagged parts.
- **G4:** Reach 10,000 registered users and 3-5% paid conversion in the first 90 days.
- **G5:** Page loads in under 2 seconds. A 1,000-word rewrite finishes in under 10 seconds.

### 2.5 Non-Goals (What We Will Not Do)
- We will not promise 'undetectable' or '100% human'.
- We will not write a full essay or assignment ready to hand in. That is the job of an AI writer, not this tool.
- We will not sell or reuse other people's work.
- No mobile app in V1, only a responsive website.
- English only in V1. Urdu and Hindi come later.

---

## 3. Target Users

- **Persona 1: Ayesha, University Student:** She drafts an outline with AI and wants to rewrite it in her own words.  
  *Needs:* Affordable plan, simple screen, citation help.
- **Persona 2: Bilal, Freelance Content Writer:** He delivers articles of 1,500+ words to clients.  
  *Needs:* Bulk processing, tone control, SEO-friendly output.
- **Persona 3: Sara, Non-Native English Writer:** Her own emails and reports get flagged as AI.  
  *Needs:* Make text more natural without changing the meaning.
- **Persona 4: Marketing Team Lead:** The team makes social posts with AI and needs a consistent brand voice.  
  *Needs:* Tone presets and team accounts.

---

## 4. Positioning and Ethical Use
- **Positioning:** 'Turn an AI draft into your own voice' (a writing assistant), not 'fool the detector'.
- **Terms of Service:** The user is responsible for following their school, university, or employer rules. Using the tool for academic dishonesty is not allowed.
- **Honest messaging:** Never write 'guaranteed bypass' on the website. It creates legal risk, refund fights, and chargebacks.
- **Built-in citation helper:** When the plagiarism report finds a source, let the user add a citation.
- **Transparency:** Next to every result, show a short note: *'Detector scores are estimates, not final answers.'*

---

## 5. Unique Value (How We Are Different)
1. **Voice Match:** The user uploads a sample of their own writing (200-500 words). The tool copies their style: sentence length, word choice, and tone. Personal style is not generic and breaks standard detector patterns.
2. **All-in-one dashboard:** Rewrite, AI score, plagiarism check, and citations on one page.
3. **Meaning-Lock:** Output compared with original (semantic similarity score) so rewrites don't distort facts.
4. **Simple, cheap pricing:** Generous free tier and sensible paid limits.
5. **Sentence-level control:** Click any sentence to rewrite just that one again.

---

## 6. Core Features

### 6.1 Humanizer Engine (P0)
- Text box to paste or type. Limit in V1: free 300 words/request, paid 3,000 words/request.
- Modes:
  - *Light* (small changes, same meaning)
  - *Balanced* (default, natural flow)
  - *Strong* (more rewriting, new sentence structure)
- Tone presets: Casual, Professional, Academic, Friendly, Blog/Marketing.
- Language: English in V1.
- Output buttons: Copy, Download (.txt / .docx), Regenerate.
- Side-by-side view: original on the left, rewrite on the right, with changes highlighted.

### 6.2 AI-Likelihood Checker (P0)
- Show AI score (0-100%) before and after rewrite.
- Highlight sentences flagged as AI-like.
- Third-party API wrapper (GPTZero, Copyleaks, or Originality.ai).
- Always show disclaimer note: *'This score is an estimate.'*

### 6.3 Plagiarism Checker (P0/P1)
- Similarity percentage and list of matched source URLs.
- Highlight matched text parts.
- 'Rewrite this part' button to rewrite only flagged sentences.

### 6.4 Citation Helper (P1)
- Generate APA, MLA, or Chicago citations from sources or pasted URLs.

### 6.5 Voice Match (P1 - Key Feature)
- Upload 1-3 writing samples to build an author style profile.

### 6.6 Meaning-Lock Score (P1)
- Embedding-based comparison score (0-100). Warns user if score falls below 85.

### 6.7 History and Projects (P1)
- Save and organize past rewrites with full user deletion control.

### 6.8 Bulk and Document Upload (P1)
- Upload .docx, .pdf, and .txt files with chunked processing.

### 6.9 API and Chrome Extension (P2)
- Developer REST API and in-browser rewrite extension.

### 6.10 Team Plan (P2)
- Shared workspaces, brand voice guidelines, and usage dashboards.

---

## 7. User Flows

### 7.1 Main Flow (Guest User)
1. Land on homepage &rarr; paste text into box immediately (no login required).
2. Select Mode and Tone &rarr; click 'Humanize'.
3. Real-time progress bar shows, followed by rewritten text and Before/After AI scores.
4. If word limit exceeded &rarr; sign-up prompt appears.

### 7.2 Plagiarism Flow
1. Press 'Check Plagiarism'.
2. Report shows similarity %, sources, and highlighted text.
3. Click 'Rewrite flagged parts' &rarr; targeted sentences rewritten.
4. Auto re-scan validates original result.

---

## 8. Functional Requirements Matrix

| ID | Requirement | Priority |
| :--- | :--- | :--- |
| **FR-1** | Guest access without login for short text (300 words) | **P0** |
| **FR-2** | 3 modes (Light, Balanced, Strong) and 5 tone presets | **P0** |
| **FR-3** | Show AI score before and after | **P0** |
| **FR-4** | Show plagiarism percentage and sources | **P0** |
| **FR-5** | Rewrite only the flagged sentences | **P1** |
| **FR-6** | Email and Google signup | **P0** |
| **FR-7** | Enforce word limits for free and paid plans | **P0** |
| **FR-8** | Payments & subscription management (Stripe / Paddle) | **P0** |
| **FR-9** | Save and delete history | **P1** |
| **FR-10** | Voice Match sample upload and style profile | **P1** |
| **FR-11** | Meaning-Lock score (<85 warning) | **P1** |
| **FR-12** | Upload and download .docx / .pdf | **P1** |
| **FR-13** | Citation generator (APA / MLA / Chicago) | **P1** |
| **FR-14** | Admin dashboard: users, usage, revenue, abuse | **P0** |
| **FR-15** | Rate limiting and bot protection (Turnstile captcha) | **P0** |
| **FR-16** | Dark and light mode, mobile responsive | **P1** |

---

## 9. Humanization Pipeline
1. **Pre-processing:** Split into sentences/paragraphs. Protect names, numbers, quotes, and technical terms.
2. **Analysis:** Compute sentence length variance, repeated transition markers, and passive voice ratio.
3. **LLM Rewrite:** Controlled prompt enforcing burstiness, natural transitions, selected tone, and zero hallucinated facts.
4. **Post-processing:** Rule-based cleanup, restore protected entities, verify grammar.
5. **Quality Gates:** Meaning-Lock check (&ge;85%), AI detector check (max 2 passes).
6. **Output:** Render final prose with highlighted change diffs and verified metric scores.

---

## 10. Technical Architecture

- **Frontend:** Next.js (React) + Tailwind CSS.
- **Backend:** Node.js (Next.js API routes) / Python FastAPI.
- **Database:** PostgreSQL (Supabase / Neon).
- **Auth:** Supabase Auth or Clerk.
- **Queue:** Redis + BullMQ for asynchronous document jobs.
- **LLM:** Anthropic Claude / OpenAI API with modular configuration.
- **Payments:** Paddle / Lemon Squeezy (Merchant of Record).
- **Security:** User text is **never** used to train AI models. Guests purged after 24h. GDPR/CCPA compliant deletion.

---

## 11. Pricing and Monetization

| Plan | Price | Limits & Features |
| :--- | :--- | :--- |
| **Free** | $0 | 300 words/request, 1,000 words/day, basic modes, 1 plagiarism scan/day |
| **Pro** | $9 - $12 / mo | 3,000 words/request, 50,000 words/mo, all modes, Voice Match, plagiarism scans |
| **Premium** | $24 - $29 / mo | 10,000 words/request, 200,000 words/mo, bulk upload, priority processing |
| **Team** | Custom | Shared workspace, API access, team Voice Match |

> **Unit Economics Rule:** Every rewrite incurs API cost. Set prices to preserve **60-70% gross margins**. Keep the free tier tightly gated.

---

## 12. Success Metrics & Roadmap

### Success Metrics
- Visitor to tool usage: **25%+**
- Guest to signup: **10-15%**
- Free to paid conversion: **3-5%**
- Monthly churn: **<8%**
- Rewrite latency: **<10s** per 1,000 words
- Meaning-Lock average: **90+**

### Roadmap
- **Phase 0 (Weeks 1-2):** Competitor analysis, API cost benchmarking, user interviews.
- **Phase 1 (Weeks 3-8):** MVP launch (Humanizer, AI score, basic plagiarism, Auth, Payments).
- **Phase 2 (Weeks 9-11):** Beta cohort, Voice Match, Meaning-Lock, history.
- **Phase 3 (Weeks 12-14):** Public launch, SEO content, Product Hunt, affiliates.
- **Phase 4 (Months 4-6):** Bulk uploads, Citation helper, Chrome extension, Public API.

---

## 13. Risk Analysis & Mitigation

| Risk | Impact | Fix |
| :--- | :--- | :--- |
| Detector updates degrade scores | High | Never promise 100% bypass; focus on Voice Match personalization. |
| Academic dishonesty backlash | Critical | Frame as writing enhancer; enforce Acceptable Use Policy; built-in citations. |
| API costs exceed budget | High | Strict free limits, caching, 2-pass hard cap, cheaper model fallbacks. |
| Payment processor suspension | Critical | Use Merchant of Record (Paddle/Lemon Squeezy), transparent positioning. |
| Meaning distortion | High | Meaning-Lock score, protected entity locking, side-by-side diff review. |
| Free tier bot abuse | Medium | Cloudflare Turnstile, IP throttling, ephemeral guest storage. |

---

## 14. Open Questions & Immediate Next Steps

### Open Decisions
1. Primary initial target segment: Students vs. Freelancers vs. Marketing teams.
2. Third-party detector API vs. custom classifier training.
3. Merchant of Record setup and international entity structuring.

### Next Steps
1. Conduct teardown of 5-8 competing tools.
2. Establish API test keys (LLM, detector, plagiarism).
3. Build and test prototype with the 6-stage humanization pipeline.
4. Validate with 10 real writers before starting full MVP build.
