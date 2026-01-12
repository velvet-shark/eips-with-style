# Repository Guidelines

## Project Structure & Module Organization
- `app/` holds the Next.js App Router routes (including `[proposalType]` dynamic pages and `api/`).
- `components/`, `contexts/`, `hooks/`, `lib/`, and `utils/` contain shared UI, state, and helper logic.
- `backend/` contains the Python ETL that fetches proposals and writes to Supabase; cached markdown lives in `backend/downloaded_proposals/`.
- `database/` stores schema artifacts; `public/` and `assets/` hold static files.

## Build, Test, and Development Commands
```bash
npm run dev          # local Next.js dev server (http://localhost:3000)
npm run build        # production build (runs next-sitemap postbuild)
npm start            # serve the production build

cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python proposal_updater.py            # update proposals
python proposal_updater.py --download # force full re-download
python enrich_proposals.py enrichments.json --dry-run
```

## Coding Style & Naming Conventions
- TypeScript + React with 2-space indentation and semicolons; follow existing formatting in nearby files.
- Component files in `components/` are kebab-case (e.g., `search-command.tsx`); contexts use PascalCase (e.g., `ProposalContext.tsx`).
- Tailwind CSS is the primary styling approach; use `lib/utils.ts` helpers (e.g., `cn`) for class composition.

## Testing Guidelines
- No automated test suite is configured in this repo yet.
- Verify changes by running `npm run dev` and `npm run build` for a quick smoke test.
- For backend changes, run `python proposal_updater.py` against a local env and confirm Supabase updates.

## Commit & Pull Request Guidelines
- Commit messages are short, sentence-case, and direct (e.g., "Update dependencies", "Improve search results").
- PRs should include a clear summary, testing notes (commands run), and screenshots/GIFs for UI changes.
- Note any schema or data-shape changes and update `database/` artifacts when applicable.

## Configuration & Data Flow
- Frontend config lives in `.env.local` (Supabase URL/anon key, site URL); backend config uses `backend/.env` with service role keys. Never commit secrets.
- Data flows GitHub → `backend/proposal_updater.py` → Supabase → Next.js frontend.
