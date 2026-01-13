import { promises as fs, existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { ConvexHttpClient } from "convex/browser";
import { config as loadEnv } from "dotenv";
import { api } from "../convex/_generated/api";

type ProposalType = "EIP" | "ERC" | "CAIP" | "RIP";

type EnrichmentInput = {
  proposal_type?: unknown;
  number?: unknown;
  title_descriptive?: unknown;
  why_important?: unknown;
};

type NormalizedEnrichment = {
  proposal_type: ProposalType;
  number: number;
  title_descriptive?: string;
  why_important?: string;
};

type EnrichmentFile = {
  enrichments?: unknown;
};

type EnrichmentCounts = {
  total: number;
  validated: number;
  updated: number;
  dryRun: number;
  failed: number;
};

type ParsedArgs = {
  filePath: string;
  dryRun: boolean;
};

const DEFAULT_ENRICHMENTS_PATH = path.join("backend", "enrichments.json");

const envLocalPath = path.join(process.cwd(), ".env.local");
const envPath = path.join(process.cwd(), ".env");
if (existsSync(envLocalPath)) {
  loadEnv({ path: envLocalPath });
} else if (existsSync(envPath)) {
  loadEnv({ path: envPath });
}

if (!process.env.CONVEX_URL && process.env.NEXT_PUBLIC_CONVEX_URL) {
  process.env.CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
}

const USAGE = `Usage: npx tsx scripts/enrich_proposals.ts [json_file] [options]

Options:
  --dry-run       Preview changes without applying updates.
  --file <path>   Path to enrichment JSON file.
  --help          Show this help message.

Defaults:
  json_file       ${DEFAULT_ENRICHMENTS_PATH}

Environment variables:
  CONVEX_URL   Required Convex deployment URL.
`;

function parseArgs(argv: string[]): ParsedArgs {
  const options: ParsedArgs = {
    filePath: DEFAULT_ENRICHMENTS_PATH,
    dryRun: false
  };

  let fileOverride: string | null = null;
  const positionals: string[] = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }
    if (arg === "--file") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("--file requires a path.");
      }
      fileOverride = value;
      index += 1;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      console.log(USAGE);
      process.exit(0);
    }
    if (arg.startsWith("--")) {
      throw new Error(`Unknown arg: ${arg}`);
    }
    positionals.push(arg);
  }

  if (fileOverride && positionals.length > 0) {
    throw new Error("Provide either a positional json_file or --file, not both.");
  }
  if (positionals.length > 1) {
    throw new Error("Only one positional json_file is supported.");
  }

  if (fileOverride) {
    options.filePath = fileOverride;
  } else if (positionals.length === 1) {
    options.filePath = positionals[0];
  }

  return options;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeProposalType(value: unknown): ProposalType | null {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim().toUpperCase();
  if (normalized === "EIP" || normalized === "ERC" || normalized === "CAIP" || normalized === "RIP") {
    return normalized;
  }
  return null;
}

function parseNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Number.isInteger(value) ? value : null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    if (/^\d+$/.test(trimmed)) {
      const parsed = Number(trimmed);
      return Number.isFinite(parsed) ? parsed : null;
    }
  }
  return null;
}

function normalizeText(field: string, value: unknown): { value?: string; error?: string } {
  if (value === undefined || value === null) {
    return {};
  }
  if (typeof value !== "string") {
    return { error: `${field} must be a string.` };
  }
  const trimmed = value.trim();
  return trimmed ? { value: trimmed } : {};
}

function validateEnrichment(item: EnrichmentInput): { ok: true; value: NormalizedEnrichment } | { ok: false; reason: string } {
  const proposalType = normalizeProposalType(item.proposal_type);
  if (!proposalType) {
    return { ok: false, reason: `Invalid proposal_type: ${String(item.proposal_type)}` };
  }

  const number = parseNumber(item.number);
  if (number === null) {
    return { ok: false, reason: `Invalid number: ${String(item.number)}` };
  }

  const titleResult = normalizeText("title_descriptive", item.title_descriptive);
  if (titleResult.error) {
    return { ok: false, reason: titleResult.error };
  }

  const whyResult = normalizeText("why_important", item.why_important);
  if (whyResult.error) {
    return { ok: false, reason: whyResult.error };
  }

  if (!titleResult.value && !whyResult.value) {
    return { ok: false, reason: "At least one of title_descriptive or why_important must be provided." };
  }

  return {
    ok: true,
    value: {
      proposal_type: proposalType,
      number,
      title_descriptive: titleResult.value,
      why_important: whyResult.value
    }
  };
}

function previewText(value?: string): string {
  if (!value) {
    return "";
  }
  return value.length > 80 ? `${value.slice(0, 77)}...` : value;
}

async function readEnrichmentFile(filePath: string): Promise<EnrichmentFile> {
  const contents = await fs.readFile(filePath, "utf-8");
  return JSON.parse(contents) as EnrichmentFile;
}

async function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    const convexUrl = process.env.CONVEX_URL;
    if (!convexUrl) {
      throw new Error("CONVEX_URL is required to run enrichments.");
    }

    const resolvedPath = path.resolve(options.filePath);
    if (!existsSync(resolvedPath)) {
      throw new Error(`Enrichment file not found: ${resolvedPath}`);
    }

    const data = await readEnrichmentFile(resolvedPath);
    if (!isRecord(data)) {
      throw new Error("Enrichment file is not a valid JSON object.");
    }

    const enrichments = Array.isArray(data.enrichments) ? data.enrichments : null;
    if (!enrichments) {
      throw new Error("Enrichment file must include an 'enrichments' array.");
    }

    const client = new ConvexHttpClient(convexUrl);
    const counts: EnrichmentCounts = {
      total: enrichments.length,
      validated: 0,
      updated: 0,
      dryRun: 0,
      failed: 0
    };

    console.log(`Processing ${counts.total} enrichments from ${resolvedPath}`);
    if (options.dryRun) {
      console.log("(DRY RUN - no changes will be made)\n");
    } else {
      console.log("");
    }

    for (let index = 0; index < enrichments.length; index += 1) {
      const rawItem = enrichments[index];
      if (!isRecord(rawItem)) {
        counts.failed += 1;
        console.warn(`Skipping entry ${index + 1}: item is not an object.`);
        continue;
      }

      const validation = validateEnrichment(rawItem as EnrichmentInput);
      if (!validation.ok) {
        counts.failed += 1;
        console.warn(`Skipping entry ${index + 1}: ${validation.reason}`);
        continue;
      }

      counts.validated += 1;
      const { proposal_type, number, title_descriptive, why_important } = validation.value;

      const existing = await client.query(api.proposals.getProposalIngestionInfo, {
        proposal_type,
        number
      });

      if (!existing) {
        counts.failed += 1;
        console.warn(`Missing proposal ${proposal_type}-${number}; skipping.`);
        continue;
      }

      if (options.dryRun) {
        counts.dryRun += 1;
        console.log(`DRY RUN: ${proposal_type}-${number}`);
        if (title_descriptive) {
          console.log(`  title_descriptive: ${previewText(title_descriptive)}`);
        }
        if (why_important) {
          console.log(`  why_important: ${previewText(why_important)}`);
        }
        continue;
      }

      try {
        const payload: {
          proposalType: ProposalType;
          number: number;
          title_descriptive?: string;
          why_important?: string;
        } = {
          proposalType: proposal_type,
          number
        };

        if (title_descriptive !== undefined) {
          payload.title_descriptive = title_descriptive;
        }
        if (why_important !== undefined) {
          payload.why_important = why_important;
        }

        await client.mutation(api.enrichments.updateEnrichment, payload);
        counts.updated += 1;
        console.log(`Updated ${proposal_type}-${number}`);
      } catch (error) {
        counts.failed += 1;
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`Failed ${proposal_type}-${number}: ${message}`);
      }
    }

    console.log("\nEnrichment run complete.");
    console.log(JSON.stringify(counts, null, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    console.log(USAGE);
    process.exit(1);
  }
}

main();
