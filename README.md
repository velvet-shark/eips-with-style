# EIP.directory

[![Website](https://img.shields.io/website?url=https%3A%2F%2Feip.directory)](https://eip.directory)
[![Twitter Follow](https://img.shields.io/twitter/follow/velvet_shark?style=social)](https://twitter.com/velvet_shark)

> **All your EIPs, ERCs, CAIPs, and RIPs in one place.**

EIP.directory is an open-source web application that aggregates Ethereum-related improvement proposals and presents them in a clean, searchable interface. The live site is at [eip.directory](https://eip.directory).

## 🧭 What this project is

- A public, read-only index of Ethereum improvement proposals (EIPs, ERCs, CAIPs, RIPs)
- A structured ingestion pipeline that pulls proposals from GitHub, normalizes metadata, and stores them in Convex
- A Next.js UI that preserves the current UX while adding enrichment copy ("In simple terms" / "Why is it important?")

## 🚀 Features

- **Comprehensive Coverage**: Browse all major Ethereum proposal types:

  - **EIPs** - Ethereum Improvement Proposals
  - **ERCs** - Ethereum Requests for Comments
  - **CAIPs** - Chain Agnostic Improvement Proposals
  - **RIPs** - Rollup Improvement Proposals

- **Enhanced Content**: Important proposals include a "Why is it important?" section explaining their significance in simple terms

- **Modern Interface**: Clean, responsive design with dark/light mode support

- **Smart Search**: Fast, intuitive search across all proposals

- **Automated Updates**: Syncs with upstream GitHub repositories via ingestion scripts

## 🧬 How it works (high level)

```
GitHub Repos → scripts/ingest_proposals.ts → Convex → Next.js UI
```

- Ingestion lists files via GitHub’s Git Trees API (no 1,000-file cap), skips files whose sha is unchanged, parses YAML front matter, normalizes links/authors, and upserts into Convex.
- Writes are protected: ingestion and the enrichment script send `INGEST_SECRET`; the admin UI writes as the signed-in admin.
- Proposal pages are cached (ISR, revalidated every 6 hours); the proposal list for search is served from the cached `/api/proposals` route.
- Enrichments are applied separately (script or admin UI) and never overwritten by ingestion.
- View events are recorded for analytics and popular proposals are computed on a schedule from those logs.

## 🛠 Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Component primitives
- **Zustand** - State management
- **React Markdown** - Markdown rendering with syntax highlighting

### Backend

- **Convex** - Database + admin enrichment workflow (Convex Auth)
- **TypeScript** - Proposal ingestion/enrichment scripts
- **GitHub API** - Source of truth for proposals

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js 24 and npm
- Convex account or local Convex dev deployment

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/velvet-shark/eips-with-style.git
   cd eips-with-style
   ```

2. **Install frontend dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   # Frontend (.env.local)
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
   # Optional for server-side fetches (Convex also writes this when running `npx convex dev`)
   CONVEX_URL=your_convex_deployment_url
   # Required by the ingestion and enrichment scripts; must match the deployment's INGEST_SECRET
   INGEST_SECRET=same_value_as_on_the_convex_deployment
   ```

   Set the same secret on the Convex deployment with `npx convex env set INGEST_SECRET <value>` (add `--prod` for production).

4. **Run Convex locally (required for data + admin UI)**

   ```bash
   npx convex dev
   ```

   This writes `CONVEX_URL` into `.env.local` automatically.

5. **Run the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

### Updating Proposals

To fetch and update proposals from GitHub:

```bash
npx tsx scripts/ingest_proposals.ts
```

Automated daily updates run via GitHub Actions (`.github/workflows/update-proposals.yml`). Unchanged proposals are skipped; run the workflow manually with `full_refresh` after changing how proposals are parsed. Configure repository secrets:
- `CONVEX_URL` (production Convex deployment URL)
- `INGEST_SECRET` (same value as the production Convex deployment's `INGEST_SECRET`)
- `GITHUB_TOKEN` (provided by Actions, for higher GitHub API rate limits)

### Applying Enrichments

To update "In simple terms" and "Why is it important?" copy from `backend/enrichments.json`:

```bash
npx tsx scripts/enrich_proposals.ts backend/enrichments.json --dry-run
npx tsx scripts/enrich_proposals.ts backend/enrichments.json
```

### Deploying Convex functions

Vercel production builds run `npx convex deploy` before `next build` when a `CONVEX_DEPLOY_KEY` environment variable is set for the Production environment (see `scripts/build.mjs`). Preview builds and local builds only run `next build`.

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── [proposalType]/     # Dynamic routes for proposal types
│   └── api/                # API routes
├── backend/                # Cached proposal files + enrichments
│   └── downloaded_proposals/ # Cached proposal files
├── components/             # React components
├── convex/                 # Convex schema, queries, mutations, auth, cron jobs
├── config/                 # Configuration files
├── contexts/              # React contexts
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
├── public/                # Static assets
└── scripts/               # Ingestion + enrichment tooling
```

## 🗺️ Sitemap

`/sitemap.xml` is generated by the Next.js App Router route in `app/sitemap.ts`. There are no static sitemap files in `public/`.

## 🤝 Contributing

Contributions are very welcome! Here's how you can help:

### Ways to Contribute

1. **Report bugs** - Found something broken? Open an issue
2. **Suggest features** - Have ideas for improvements? We'd love to hear them
3. **Improve content** - Help write "Why is it important?" sections for proposals
4. **Fix issues** - Browse open issues and submit pull requests
5. **Improve documentation** - Help make our docs clearer

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and ensure code quality
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- We use TypeScript for type safety
- Follow existing code patterns and conventions
- Use Prettier for code formatting
- Write meaningful commit messages

## 📞 Support

- **Website**: [eip.directory](https://eip.directory)
- **GitHub Issues**: [Report bugs or request features](https://github.com/velvet-shark/eips-with-style/issues)
- **Twitter**: [@velvet_shark](https://twitter.com/velvet_shark)

---

<div align="center">
  <p>Built with ❤️ for the Ethereum community</p>
  <p><a href="https://eip.directory">EIP.directory</a></p>
</div>
