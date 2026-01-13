# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start Next.js dev server at localhost:3000
npm run build        # Build for production
npm start            # Start production server

# Ingestion (proposal updates)
npx tsx scripts/ingest_proposals.ts              # Update proposals from GitHub
npx tsx scripts/ingest_proposals.ts --download   # Force re-download all proposals

# Proposal enrichment (Convex)
npx tsx scripts/enrich_proposals.ts backend/enrichments.json           # Apply updates
npx tsx scripts/enrich_proposals.ts backend/enrichments.json --dry-run  # Preview only

# Convex (auth/admin)
npx convex dev
```

## Architecture Overview

EIP.directory is a Next.js 15 App Router application that aggregates Ethereum improvement proposals (EIPs, ERCs, CAIPs, RIPs) from GitHub repositories into a searchable interface.

### Data Flow

```
GitHub Repos → scripts/ingest_proposals.ts → Convex → Next.js Frontend
```

Additional Convex-backed workflow:

```
GitHub Repos → scripts/ingest_proposals.ts → Convex → Admin Enrichment UI
```

1. **Ingestion** (`scripts/ingest_proposals.ts`): Fetches markdown files from GitHub APIs (ethereum/EIPs, ethereum/ERCs, ChainAgnostic/CAIPs, ethereum/RIPs), parses YAML front matter, and upserts to Convex. Uses SHA tracking to only update changed files.
2. **ProposalProvider** (`contexts/ProposalContext.tsx`): Client-side context that fetches all proposals from Convex with 12-hour localStorage caching.
3. **View Tracking** (`lib/view-tracker.ts`): Logs proposal views to `proposal_views` via Convex. Popular proposals read from the Convex cache.

### Key Routes

- `/` - Home page with search and featured proposals
- `/[proposalType]/[slug]` - Proposal detail page (e.g., `/eips/eip-1`)
- `/api/og` - Open Graph image generation
- `/sitemap.xml` - Dynamic sitemap served by `app/sitemap.ts`

### Convex Collections

- `proposals` - All proposal metadata and content (proposal_type, number, slug, title, content, status, featured, etc.)
- `proposal_views` - View tracking for trending calculations
- `popular_cache` - Aggregated popular proposal snapshots

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

## Environment Variables

```bash
# Frontend (.env.local)
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_CONVEX_URL=
CONVEX_URL=

# Convex deployment env (via `npx convex env set` or dashboard)
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
SITE_URL=
CONVEX_SITE_URL=
JWT_PRIVATE_KEY=
JWKS=
```

## Enriching Proposals

To add `title_descriptive` and `why_important` content to proposals:

1. Provide EIP/ERC numbers to Claude Code
2. Claude reads proposal content from `backend/downloaded_proposals/{type}/`
3. Claude generates descriptions and outputs JSON
4. Review the generated content
5. Claude writes JSON and runs `scripts/enrich_proposals.ts` to update Convex

Alternatively, use the admin UI at `/admin/enrichments` (GitHub OAuth gated to `mail@velvetshark.com`).

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
