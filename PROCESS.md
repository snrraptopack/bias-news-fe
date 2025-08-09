# Bias Lab – Frontend Work Sample (≈7 Hours) – Process & Decisions

_Last updated: 2025-08-09_

## 1. Intent & Framing
**Objective:** In a single focused sprint (about seven hours total), ship a working exploratory UI that makes media bias *tangible* (not just numbers). I prioritized end‑to‑end functional depth (narratives → article detail → explainable bias → ad‑hoc + bulk ingestion) over polish, theming, and tests.

Guiding principles:
- **Show, don't tell:** Working radar, heatmap, highlights > static mockups.
- **Explainability over aesthetics:** Users should see *why* a score exists (phrases + reasoning) early.
- **Fast first content:** Lazy load heavy/chart code; keep initial route lightweight.
- **Resilience to flaky backend (free tier):** Clear error surfaces + cold start messaging.

## 2. Condensed Timeline (Real ~7h)
| Slice | Duration | What Happened |
|-------|----------|---------------|
| Scaffold + Models | ~1h 10m | Vite + TS + Tailwind + Router + React Query; Article / Narrative / Bias types; base layout + navigation. |
| Core Data / Lists | ~1h 15m | Hooks (narratives, articles, article detail), Home narrative cards, Articles list & detail skeleton. |
| Bias Visualization | ~1h 20m | Radar (scores + confidence polygon), dimension toggles, mini confidence bars. |
| Explainability | ~55m | Phrase highlight builder, per‑dimension filtering, ExplainScore popovers (phrases + reasoning). |
| Analyze + Fetch Flows | ~55m | Ad‑hoc analyze form (URL or text), GNews fetch (topic→10→analysis), integration into lists/clusters. |
| Source & Comparison UI | ~40m | Source comparison heatmap + distinctive phrases panel, sparkline trend. |
| Resilience & Docs | ~45m | Enhanced error handling (timeout, cold start message), cold start modal, README + Process doc. |

Buffer/context switching, minor responsive tweaks and overflow fixes interleaved during the above.

## 3. Key Decisions & Why
| Area | Decision | Rationale |
|------|----------|-----------|
| Data Fetching | React Query hooks per domain object | Auto caching + retries; simpler than bespoke global store. |
| Model Transport | Include article list inside narrative cluster response | Eliminates N+1 fetch on cluster detail; faster perceived load. |
| Explainability | Store phrases per dimension and rebuild highlights client-side | Avoid server sending HTML; flexible for toggling active dimensions. |
| Chart Choice | Radar (Recharts) + dual polygon (score vs confidence) | Immediate visual gestalt; low config overhead vs D3 custom. |
| Error Handling | Enhanced network error text + fallback removing `/api` | Free-tier cold starts + path mismatches are the most common early failure. |
| Ad‑Hoc Analyze | 30s timeout; do not persist result | Balances user patience vs free-tier limits; ephemeral clarity. |
| Bulk Fetch | Cap at 10 GNews articles | Predictable latency + keeps UI manageable. |
| Styling | Tailwind utility first | Velocity + consistent spacing without bespoke design system overhead. |
| Performance | Lazy-load heavy radar bundle | Cut initial JS for Home view; improves first paint with sleeping backend. |
| Cold Start UX | One-time modal + inline error instructions | Prevent user abandonment on first 60s “Failed to fetch” moment. |

## 4. Domain Modeling Snapshot
```
NarrativeCluster
  id, topic, title, framingType
  articles[] (Article objects)
  biasDistribution { left, center, right }
  avgScores { five dims }
  sourceAnalysis { per source aggregates }
  framingEvolution[] (timeline snapshots)

Article
  id, headline, content, source, publishedAt, url
  biasScores? (5 BiasDimension objects + overall, status, intervals)
  narrativeCluster? (cluster id)

BiasDimension
  score (0–100), confidence (0–1), highlightedPhrases[], reasoning, confidenceInterval?
```
Aggregation is intentionally denormalized for quicker UI assembly.

## 5. Phrase Highlight Approach
- **Input:** For each dimension, backend supplies phrases (or raw terms); I treat them as case-insensitive tokens.
- **Processing:** Split text into segments; annotate segments carrying one or more dimensions.
- **Display:** Filter set toggles; choose first visible dimension for color. Semi‑transparent background + outline for legibility.
- **Why not mark all simultaneously with gradients?** Complexity & cognitive overload in early iteration.

## 6. Confidence Visualization Choice
- Confidence polygon (score * confidence) instead of opaque error bars inside chart.
- Separate linear mini-bars beneath provide interval numerics (lower / upper) for analytical users.
- This dual representation balances “at a glance” and “exact range”.

## 7. Performance & Resilience Techniques
- Lazy import radar (largest visual dependency).
- Query retry gate: no retries on obvious 404s (wasteful), limited on network errors.
- Prefetch narrative on hover of cluster card (optimistic navigation feel).
- Timeout for analyze to prevent indefinite spinner during slow scrape or cold model spin-up.
- Fallback base (strip `/api`) for edge deployment differences.

## 8. Responsive & Overflow Strategy
- Primary offenders: wide gradient background, heatmap table, long source names, fixed grid counts.
- Solutions: container overflow isolation, truncation with ellipsis for source column, auto‑wrapping grids, min-w-0 on flexible children, dynamic chart radius under small breakpoints.
- Avoid global `overflow-x:hidden` (removed after testing) to prevent content clipping.

## 9. Error UX
States distinguished:
- **Network / Cold Start:** Custom message advising wait + refresh.
- **Timeout:** Specific wording (“Request timeout after waiting”).
- **HTTP Failure:** Status surfaced with small body snippet.
- **Fallback Attempt:** Silent except for final enriched error if both bases fail.

## 10. Analyze vs Fetch Clarified
| Feature | Persistence | Input | Max Items | Primary Use |
|---------|------------|-------|-----------|-------------|
| Analyze | Ephemeral | Text or single URL | 1 | Quick, personal bias check |
| Fetch | Persistent (adds to corpus) | Topic (and optional source filter) | 10 (GNews batch) | Seeding fresh narratives |

## 11. Time Distribution (≈7h Total)
- Scaffold + models + layout: ~1.1h
- Data hooks & list/detail wiring: ~1.1h
- Radar + confidence & toggles: ~1.0h
- Phrase highlight + explain popovers: ~0.9h
- Analyze + Fetch flows (incl. timeout logic): ~0.9h
- Heatmap + sparkline + source phrases: ~0.7h
- Error handling, cold start UX, docs: ~0.9h
- Misc responsive / overflow fixes: ~0.4h

Light AI pair assistance throughout (see section 12) kept velocity high.

## 12. AI Tool Usage Transparency
- Used an AI pair assistant for: generating some boilerplate (React Query hook shells), refining wording for error messages, quick Tailwind class suggestions.
- All model outputs were manually reviewed & adapted; no wholesale copy of large unverified blocks.
- Design & architectural choices (data model, error strategy, visualization selection) were human decisions.

## 13. What I Deferred (Consciously)
| Item | Reason for Deferral |
|------|---------------------|
| Automated test suite | Time trade-off; documented intended structure instead. |
| Dark mode | Focused on core analytical clarity first (removed interim attempt). |
| Detailed accessibility polish | Semantics in place; ARIA & keyboard iteration next step. |
| Streaming progress (SSE) | Requires backend adaptation; future vertical slice. |
| Export / share report | Nice-to-have once core flows validated. |
| Auth & rate limiting | Not essential for evaluation context. |

## 14. If I Had Another Week
1. Add full test pyramid (unit highlight tokenizer, integration fetch mocks, Playwright flows).
2. Introduce SSE for real-time analyze progress stages (scrape, parse, model, aggregate).
3. Improve statistical representation (true confidence intervals with whiskers + calibration legend).
4. Add persistent session history for ad‑hoc analyses.
5. A11y pass: focus trapping in modals/popovers, better color contrast mapping.
6. Server-driven clustering version tags (to understand shifts across model updates).
7. Light/dark theme with CSS custom properties + system preference.

## 15. Risks & Mitigations
| Risk | Impact | Mitigation Implemented |
|------|--------|------------------------|
| Cold backend latency | User perceives site as broken | Explicit modal + enriched error message + manual retry guidance |
| Overfetching / wasted calls | Slower UX / rate limits | Caching + limited retries + narrative prefetch only on intent (hover) |
| Visual clutter in phrase highlights | Cognitive overload | Toggle buttons + single primary color per token |
| Horizontal overflow on mobile | Broken layout | Targeted truncation, min-w-0, responsive grid tweaks |

## 16. Personal Evaluation
In ~7 hours the goal was functional depth over finish: clustering, per‑article explainability, ad‑hoc + bulk ingestion, comparative source view, and resilience messaging are all live. I deliberately skipped automated tests, advanced a11y, theme variants, and design polish. The result demonstrates architectural judgment (typed data layer, resilient fetch wrapper) and UX emphasis on *why* behind scores.

## 17. Submission Links
- Live Frontend: https://bias-news-fe.vercel.app
- Backend (API base – may cold start): https://bias-news-backend.onrender.com/api
- Repo (frontend): <ADD_REPO_LINK>

## 18. Quick Reviewer Walkthrough (1 minute)
1. Open Home → narrative clusters load.
2. Click a cluster → view distribution + heatmap + phrases.
3. Open an article → radar + phrase highlights + reasoning (Explain icons).
4. Analyze your own text (paste) → see ephemeral result.
5. Fetch a topic (e.g., "election") → new scored articles appear → clusters update.

---
_Thanks for reviewing. Happy to dive deeper into design trade-offs or extend with tests / streaming if advanced to next stage._
