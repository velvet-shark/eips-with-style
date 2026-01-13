# Repository Guidelines

## Project Structure & Module Organization
- `app/` holds the Next.js App Router routes (including `[proposalType]` dynamic pages and `api/`).
- `components/`, `contexts/`, `hooks/`, `lib/`, and `utils/` contain shared UI, state, and helper logic.
- `backend/` contains cached markdown plus `enrichments.json`.
- `scripts/` contains TypeScript ingestion/enrichment tooling (Convex-backed).
- `convex/` contains Convex functions and auth config.
- `database/` stores schema artifacts; `public/` and `assets/` hold static files.

## Build, Test, and Development Commands
```bash
npm run dev          # local Next.js dev server (http://localhost:3000)
npm run build        # production build
npm start            # serve the production build
npx convex dev       # run Convex dev deployment (required for Convex Auth/admin)

npx tsx scripts/ingest_proposals.ts              # update proposals
npx tsx scripts/ingest_proposals.ts --download   # force full re-download
npx tsx scripts/enrich_proposals.ts backend/enrichments.json --dry-run
```

## Coding Style & Naming Conventions
- TypeScript + React with 2-space indentation and semicolons; follow existing formatting in nearby files.
- Component files in `components/` are kebab-case (e.g., `search-command.tsx`); contexts use PascalCase (e.g., `ProposalContext.tsx`).
- Tailwind CSS is the primary styling approach; use `lib/utils.ts` helpers (e.g., `cn`) for class composition.

## Testing Guidelines
- No automated test suite is configured in this repo yet.
- Verify changes by running `npm run dev` and `npm run build` for a quick smoke test.
- For ingestion changes, run `npx tsx scripts/ingest_proposals.ts` against a Convex dev deployment.

## Commit & Pull Request Guidelines
- Commit messages are short, sentence-case, and direct (e.g., "Update dependencies", "Improve search results").
- PRs should include a clear summary, testing notes (commands run), and screenshots/GIFs for UI changes.
- Note any schema or data-shape changes and update `database/` artifacts when applicable.

## Configuration & Data Flow
- Frontend config lives in `.env.local` (`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CONVEX_URL`, optional `CONVEX_URL`). Never commit secrets.
- Convex Auth config (GitHub OAuth + JWT keys) lives in the Convex deployment env via `npx convex env set` or the dashboard.
- Data flows GitHub → `scripts/ingest_proposals.ts` → Convex → Next.js frontend + admin/enrichment workflow.
- `/sitemap.xml` is served by `app/sitemap.ts`; do not add static sitemap files in `public/`.
