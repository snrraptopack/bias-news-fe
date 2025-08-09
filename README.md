# Bias Lab – Media Bias Intelligence UI

Exploratory interface for analyzing news media bias across five core dimensions. You can browse narrative clusters (groups of related articles across different outlets), open any individual article, run your own ad‑hoc analysis on pasted text or a URL, and bulk‑fetch fresh news from GNews for instant scoring.

> Backend Base URL (default): `https://bias-news-backend.onrender.com/api` (override via `VITE_API_BASE`)
>
> IMPORTANT: The backend runs on a **free Render instance**. If it has been idle it must “cold start” (usually 20–60s). First request may show a temporary network error. Just wait a little and press Refresh / reload; once awake everything is fast.

---

## 1. Core Concepts (Read First)

| Concept | What It Is | Where You See It | Data Returned |
|---------|------------|------------------|---------------|
| Narrative (Cluster) | A grouped set of related articles about the same emerging story, collected across multiple sources/outlets. | Home (`/`) list & Narrative Detail (`/narratives/:id`). | Cluster metadata + the full list of its member articles (each article object). |
| Article | A single news article (may belong to a narrative cluster or stand alone). | Articles list (`/articles`) & Article Detail (`/articles/:id`). | Full article fields + optional biasScores (5 dimensions, phrases, reasoning, confidence). |
| Analyze | Ad‑hoc on‑the‑fly scoring for text you paste OR a URL you provide (scraped then analyzed). Not stored permanently. | `/analyze` | One transient Article-shaped result with biasScores. |
| Fetch | Bulk fetch via GNews: we query a topic, retrieve up to 10 recent articles, then run bias analysis for each (creating new analyzed articles + adding them to any forming narratives). | `/fetch` | Array of newly analyzed Article objects + any cluster relationships assigned. |

Summary:
* Narratives come bundled with their articles (so you don’t need a second call for the members).
* The Articles list shows the universe of analyzed articles (from clusters, fetches, or prior ingestion) – essentially a flat view.
* Analyze is for “bring your own content” (BYOC) one‑off inspection; no persistence.
* Fetch seeds the system with fresh real‑world articles (topic search → up to 10 → AI scoring → immediately visible in lists & clusters).
* Expect a short delay after deployment inactivity due to free hosting cold start.

## 2. Purpose & Vision

Bias Lab helps users:
1. See how different outlets frame the *same* story (narrative clustering).
2. Inspect any single article’s bias signature (dimension scores + highlighted phrases + confidence indicators).
3. Compare sources inside a narrative (heatmap + distinctive phrases).
4. Run quick “what if” / personal content analyses (Analyze).
5. Rapidly ingest fresh topical coverage (Fetch → GNews → instant scoring).

---

## 3. Current Feature Set

### 3.1 Core Data & Analysis
| Area | Features |
|------|----------|
| Articles | Listing, detail view with 5 bias dimensions, highlighted phrases (in detail page), radar visualization, primary sources, analysis status (ai / fallback-*), confidence included internally. |
| Narrative Clusters | Cluster list (home), detail view: bias distribution bar, average scores, representative article + radar, phrase frequency, source distribution, framing evolution timeline, source analysis (distinctive phrases). |
| Ad-hoc Analysis | Form allowing raw text (≥50 chars) or URL-only submission (auto scrape & normalization, extended timeout). Ephemeral result with radar + metadata. |
| Bulk Fetch | Topic + optional sources triggers a GNews search; up to 10 related articles are fetched, normalized, then each is AI‑scored across the five bias dimensions (results returned immediately). |
| Diagnostics (API) | Hook support for analysis status summary (not yet surfaced in UI widget). |

### 3.2 User Interface / UX
* Responsive layout with sticky header and background grid aesthetic.
* Global navigation: Narratives, Articles, Analyze (ad‑hoc), Fetch (bulk ingestion).
* Async state components: loading & error states with retry.
* Lazy‑loaded radar chart to reduce initial bundle size.
* Tailwind utility design system + extended bias dimension color tokens.
* Accessible semantic structure (headings, lists, time elements) – further a11y polish planned.

### 3.3 Technical Stack
| Layer | Choice | Notes |
|-------|--------|-------|
| Build | Vite + TypeScript | Fast HMR & production bundling. |
| State / Data | React Query | Caching, retries, stale time tuning. |
| Routing | React Router v6 | Nested layout architecture. |
| Styling | Tailwind CSS (v3) | Custom palette for bias dims. |
| Charts | Recharts | Radar chart (bias + confidence). |
| Fetch | Native fetch + abort + custom timeouts | 30s for long AI analyses. |
| Quality | Strict TS (verbatimModuleSyntax), ESLint | Avoids `any` usage. |

---

## 4. Architecture Overview

```
src/
  api/            // API client + query hooks
  components/     // Reusable UI (charts, layout, async states, cards)
  routes/         // Page-level route components
  utils/          // Text highlighting logic
  types.ts        // Shared domain models & constants
```

Data flow:
1. Route component mounts → React Query hook (e.g., `useNarratives`) triggers fetch.
2. API client (`fetchJSON`) adds timeout & error shaping.
3. Response normalized as strongly-typed objects.
4. UI components (e.g., `BiasRadar`) map typed data to visuals.

Abort & Timeout: Analyze requests extended to 30s (scrape + AI). Aborted requests display actionable message.

---

## 5. Key Domain Models (Frontend)

See `API_DOCUMENTATION.md` for full backend schema. Frontend tracks:
* `Article` (includes optional `biasScores` & `primarySources`).
* `BiasScores` with 5 `BiasDimension` objects + overall bias & analysis status.
* `NarrativeCluster` plus optional `sourceAnalysis` & `framingEvolution` for detail route.

Bias Dimensions: ideologicalStance, factualGrounding, framingChoices, emotionalTone, sourceTransparency.

---

## 6. Implemented Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Home (Narratives) | Lists narrative clusters (preview). |
| `/narratives/:id` | NarrativeDetail | Deep dive into one cluster. |
| `/articles` | ArticlesList | Recent analyzed articles + mini dimension summary. |
| `/articles/:id` | ArticleDetail | Full article view, radar, highlighted phrases & sources. |
| `/analyze` | Analyze | Ad-hoc single article analysis (content or URL). |
| `/fetch` | FetchArticles | Bulk ingestion + immediate results listing. |
| `*` | NotFound | Fallback. |

---

## 7. UI Highlights
* **Radar Chart**: Dual polygon (score + derived confidence band).
* **Highlighted Phrases**: Token-level marking shows phrase influence (on article detail; can be extended to other views).
* **Bias Distribution Bar**: Quick view of ideological distribution inside cluster.
* **Framing Evolution Timeline**: Chronological framing shifts with tag markers.
* **Source Analysis List**: Distinctive phrases per source.
* **Ad-hoc Form Enhancements**: URL normalization (`https://` inject), validation, extended timeout, structured error parsing.

---

## 8. Environment & Configuration

Frontend env var:
* `VITE_API_BASE` – override backend API base (default `https://bias-news-backend.onrender.com/api`).

Backend (see server docs) expects `GOOGLE_AI_KEY`, `GNEWS_API_KEY`, etc.

---

## 9. Development Setup

Prerequisites: Node 18+ recommended.

Install deps & run dev server:
```
npm install
npm run dev
```

Production build:
```
npm run build
npm run preview
```

Code quality (type check only):
```
npx tsc --noEmit
```

---

## 10. Error Handling Strategy
* Centralized `fetchJSON` throws errors with HTTP status & payload snippet.
* React Query displays `ErrorState` with retry.
* 404 responses do not retry (custom retry gate in QueryClient setup).
* Timeout / Abort surfaced distinctly (“Client timeout exceeded…”)

---

## 11. Performance & Bundle
* Lazy load radar chart to keep initial route fast.
* Stale times: articles (15s), narratives (30s), individual article/narrative (60s) – reduces refetch churn.
* Potential next step: prefetch related narrative when hovering a cluster card.

---

## 12. Security & Privacy Considerations
* Ad-hoc analysis not persisted; sensitive pasted text remains client-side + transient server processing.
* No auth yet – future: API key gating or user roles for ingestion endpoints.
* CORS: Ensure backend configured for allowed origin in deployment.

---

## 13. Testing (Planned)
Currently minimal. Proposed layers:
1. Unit: highlight tokenizer, bias radar data mapping.
2. Integration: mock fetch for article & narrative queries.
3. E2E: Cypress / Playwright flows (analyze article, navigate cluster, open article detail).

---

## 14. Roadmap (Near-Term)
| Priority | Item | Notes |
|----------|------|-------|
| High | Diagnostics widget | Surface `/articles/diagnostics/status` in UI. |
| High | Phrase legend / dimension color key | Improve highlight interpretability. |
| High | Confidence interval UI | Display interval (lower–upper) per dimension (bars or tooltips). |
| Med | Source filter + topic filter for Articles list | Narrow exploration. |
| Med | Skeleton loaders | Pre-content shimmer to reduce layout shift. |
| Med | Prefetch narrative detail on hover | Snappier transitions. |
| Med | Dark mode toggle | Use Tailwind dark variant + CSS variables. |
| Low | Save ad-hoc analysis session (localStorage) | Quick recall of last result. |
| Low | Export bias report (PDF/JSON) | Share analysis externally. |
| Low | WebSocket / SSE progress for long analysis | Show scrape vs model phases. |

---

## 15. Potential Backend Enhancements
* **Queued / async job model** for heavy analysis (push -> poll status) instead of long HTTP request.
* **Model confidence calibration service** to better map confidence → interval width.
* **Narrative clustering upgrade** (embedding-based with incremental updates).
* **Auth & rate limiting** (JWT / API keys) for public deployment.
* **Usage analytics** (anonymous) for feature prioritization.
* **Batch ad-hoc multi-URL analysis** endpoint.
* **Streaming structured output** to progressively populate UI (SSE).

---

## 16. Potential Frontend Enhancements
* **Interactive bias dimension toggles** (show/hide radar layers or highlight categories).
* **Phrase highlight legend & filtering** (toggle phrases by dimension, intensity scale).
* **Confidence visualization** (radial translucent band or separate bar chart).
* **Source comparison matrix** (rows: sources, columns: dimensions – heatmap).
* **Timeline bias drift sparkline** for framing evolution snapshots.
* **Accessibility pass** (tab order, ARIA labels, contrast audits).
* **Offline caching / PWA shell** for previously fetched content.
* **Shareable deep links** including highlight selection state.

---

## 17. Deployment Notes
* Cold Start: First request after inactivity can take up to a minute; wait and retry.
* Consider adding a lightweight `/health` ping on load to proactively wake backend.
* Ensure backend base URL configured via `VITE_API_BASE` at build time.
* Serve over HTTPS to avoid mixed-content issues when scraping external pages.
* Consider reverse proxy (NGINX) to unify frontend & backend under single origin.

---

## 18. Contributing
1. Create a feature branch.
2. Add / update tests for behavioral changes.
3. Run type check + build before PR.
4. Provide succinct PR description with screenshots for UI changes.

---

## 19. License
Internal / TBD – add a proper LICENSE file before open sourcing.

---

## 20. Quick Start (TL;DR)
```
npm install
npm run dev   # open http://localhost:5173
```
Set backend URL if different:
```
VITE_API_BASE=https://your-api.example.com/api npm run dev
```

---

## 21. Status
MVP feature set implemented; ongoing: clearer confidence visualization & improved cold-start UX.

---

Feel free to open an issue / request (internally) for any enhancement listed above or propose new analysis dimensions.

