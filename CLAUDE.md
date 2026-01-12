# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start Next.js dev server at localhost:3000
npm run build        # Build for production (runs next-sitemap after)
npm start            # Start production server

# Backend (proposal updates)
cd backend
source venv/bin/activate
python proposal_updater.py              # Update proposals from GitHub
python proposal_updater.py --download   # Force re-download all proposals

# Proposal enrichment (add title_descriptive and why_important)
python enrich_proposals.py enrichments.json          # Apply updates
python enrich_proposals.py enrichments.json --dry-run  # Preview only
```

## Architecture Overview

EIP.directory is a Next.js 15 App Router application that aggregates Ethereum improvement proposals (EIPs, ERCs, CAIPs, RIPs) from GitHub repositories into a searchable interface.

### Data Flow

```
GitHub Repos → Python ETL (proposal_updater.py) → Supabase → Next.js Frontend
```

1. **Backend ETL** (`backend/proposal_updater.py`): Fetches markdown files from GitHub APIs (ethereum/EIPs, ethereum/ERCs, ChainAgnostic/CAIPs, ethereum/RIPs), parses YAML front matter, and upserts to Supabase. Uses SHA tracking to only update changed files.

2. **ProposalProvider** (`contexts/ProposalContext.tsx`): Client-side context that fetches all proposals from Supabase with 12-hour localStorage caching. Paginates through results (1000 per request).

3. **View Tracking** (`lib/view-tracker.ts`): Logs proposal views to `view_logs` table. Popular proposals fetched via `get_popular_proposals()` RPC function.

### Key Routes

- `/` - Home page with search and featured proposals
- `/[proposalType]/[slug]` - Proposal detail page (e.g., `/eips/eip-1`)
- `/api/og` - Open Graph image generation

### Database Tables

- `proposals` - All proposal metadata and content (id, proposal_type, number, slug, title, content, status, featured, etc.)
- `view_logs` - View tracking for trending calculations

### State Management

- **React Context** (`ProposalProvider`): Global proposal data (allProposals, featuredProposals, popularProposals)
- **Zustand** (`hooks/use-search.tsx`): Search modal state

### Search System

`SearchCommand.tsx` uses weighted in-memory scoring:
- Exact slug match: 120 points
- Type-number match (e.g., "EIP-1"): 115 points
- Prefix match: 60 points
- Substring match: 30 points

### Utilities

- `lib/utils.ts`: `cn()` for Tailwind class merging, `replaceImageUrls()` for converting relative markdown images to GitHub raw URLs
- `utils/supabase/client.ts`: Browser Supabase client
- `utils/supabase/server.ts`: Server Supabase client (async, handles cookies)

## Environment Variables

```bash
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=

# Backend (.env)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

## Enriching Proposals

To add `title_descriptive` and `why_important` content to proposals:

1. Provide EIP/ERC numbers to Claude Code
2. Claude reads proposal content from `backend/downloaded_proposals/{type}/`
3. Claude generates descriptions and outputs JSON
4. Review the generated content
5. Claude writes JSON and runs `enrich_proposals.py` to update Supabase

JSON format for `enrichments.json`:
```json
{
  "enrichments": [
    {
      "proposal_type": "EIP",
      "number": 1559,
      "title_descriptive": "Plain-language explanation...",
      "why_important": "Why this matters..."
    }
  ]
}
```
