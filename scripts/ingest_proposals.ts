import { promises as fs, existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import matter from "gray-matter";
import { ConvexHttpClient } from "convex/browser";
import { config as loadEnv } from "dotenv";
import { api } from "../convex/_generated/api";

type ProposalType = "EIP" | "ERC" | "CAIP" | "RIP";

type RepoConfig = {
  proposalType: ProposalType;
  repo: string;
  contentsPath: string;
  assetsBaseUrl: string;
};

type IngestionCounts = {
  processed: number;
  inserted: number;
  updated: number;
  skipped: number;
  failed: number;
};

type IngestionEntry = {
  proposal_type: ProposalType;
  number?: number;
  filename: string;
  status: "inserted" | "updated" | "skipped" | "failed";
  reason?: string;
};

type IngestionReport = {
  startedAt: string;
  finishedAt: string;
  options: {
    download: boolean;
    cacheDir: string;
    reportDir: string;
    types?: ProposalType[];
  };
  totals: IngestionCounts;
  byType: Record<ProposalType, IngestionCounts>;
  entries: IngestionEntry[];
};

type ParsedArgs = {
  download: boolean;
  cacheDir: string;
  reportDir: string;
  types?: ProposalType[];
};

type ExistingProposalInfo = {
  id: string;
  sha?: string | null;
};

type ProposalMetaEntry = {
  proposal_type: ProposalType;
  number: number;
  sha?: string | null;
  id: string;
};

type ProposalMetaPage = {
  page: ProposalMetaEntry[];
  isDone: boolean;
  continueCursor: string | null;
};

type GitHubFile = {
  name: string;
  path: string;
  sha: string;
  html_url: string;
  download_url: string;
  type: string;
};

const REPOS: RepoConfig[] = [
  {
    proposalType: "EIP",
    repo: "ethereum/EIPs",
    contentsPath: "EIPS",
    assetsBaseUrl: "https://eips.ethereum.org"
  },
  {
    proposalType: "ERC",
    repo: "ethereum/ERCs",
    contentsPath: "ERCS",
    assetsBaseUrl: "https://eips.ethereum.org"
  },
  {
    proposalType: "CAIP",
    repo: "ChainAgnostic/CAIPs",
    contentsPath: "CAIPs",
    assetsBaseUrl: "https://raw.githubusercontent.com/ChainAgnostic/CAIPs/main"
  },
  {
    proposalType: "RIP",
    repo: "ethereum/RIPs",
    contentsPath: "RIPS",
    assetsBaseUrl: "https://raw.githubusercontent.com/ethereum/RIPs/master"
  }
];

const DEFAULT_CACHE_DIR = path.join("backend", "downloaded_proposals");
const DEFAULT_REPORT_DIR = path.join("backend", "ingestion_reports");
const GITHUB_API_BASE = "https://api.github.com/repos";

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

const USAGE = `Usage: npx tsx scripts/ingest_proposals.ts [options]

Options:
  --download         Force refresh of cached files and reprocess entries.
  --type <types>     Comma-separated proposal types (EIP,ERC,CAIP,RIP).
  --cache-dir <dir>  Override cache directory (default: ${DEFAULT_CACHE_DIR}).
  --report-dir <dir> Override report directory (default: ${DEFAULT_REPORT_DIR}).
  --help             Show this help message.

Environment variables:
  CONVEX_URL   Required Convex deployment URL.
  GITHUB_TOKEN Optional GitHub token for higher rate limits.
`;

function parseArgs(argv: string[]): ParsedArgs {
  const options: ParsedArgs = {
    download: false,
    cacheDir: DEFAULT_CACHE_DIR,
    reportDir: DEFAULT_REPORT_DIR
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--download") {
      options.download = true;
      continue;
    }
    if (arg === "--type") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("--type requires a comma-separated value.");
      }
      options.types = value.split(",").map((entry) => entry.trim().toUpperCase() as ProposalType);
      index += 1;
      continue;
    }
    if (arg === "--cache-dir") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("--cache-dir requires a value.");
      }
      options.cacheDir = value;
      index += 1;
      continue;
    }
    if (arg === "--report-dir") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("--report-dir requires a value.");
      }
      options.reportDir = value;
      index += 1;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      console.log(USAGE);
      process.exit(0);
    }
    throw new Error(`Unknown arg: ${arg}`);
  }

  return options;
}

function createCounts(): IngestionCounts {
  return { processed: 0, inserted: 0, updated: 0, skipped: 0, failed: 0 };
}

function normalizeFrontMatter(data: Record<string, unknown>): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    normalized[key.trim().toLowerCase()] = value;
  }
  return normalized;
}

function parseNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const match = value.match(/\d+/);
    if (match) {
      return Number(match[0]);
    }
  }
  return undefined;
}

function extractNumber(metadata: Record<string, unknown>, proposalType: ProposalType): number | undefined {
  const preferredKey = proposalType.toLowerCase();
  const candidates = [preferredKey, "number", "eip", "erc", "caip", "rip"];
  for (const key of candidates) {
    const value = metadata[key];
    const parsed = parseNumber(value);
    if (parsed !== undefined) {
      return parsed;
    }
  }
  return undefined;
}

function extractString(metadata: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = metadata[key];
    if (value === undefined || value === null) {
      continue;
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) {
        return trimmed;
      }
    }
    if (typeof value === "number") {
      return String(value);
    }
  }
  return undefined;
}

function normalizeAuthors(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (Array.isArray(value)) {
    const entries = value
      .map((entry) => String(entry).trim())
      .filter((entry) => entry.length > 0);
    return entries.length > 0 ? entries.join(", ") : undefined;
  }
  const raw = String(value).trim();
  if (!raw) {
    return undefined;
  }
  if (raw.startsWith("[") && raw.endsWith("]")) {
    return raw.slice(1, -1).trim();
  }
  return raw;
}

function normalizeUrl(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch (error) {
    return undefined;
  }
  return undefined;
}

function normalizeLinks(value: unknown): string[] | undefined {
  const values: string[] = [];
  const addCandidate = (candidate: unknown) => {
    if (candidate === undefined || candidate === null) {
      return;
    }
    const raw = String(candidate).trim();
    if (!raw) {
      return;
    }
    const parts = raw.split(",").map((part) => part.trim()).filter(Boolean);
    for (const part of parts) {
      const normalized = normalizeUrl(part);
      if (normalized) {
        values.push(normalized);
      }
    }
  };

  if (Array.isArray(value)) {
    value.forEach(addCandidate);
  } else {
    addCandidate(value);
  }

  const unique = Array.from(new Set(values));
  return unique.length > 0 ? unique : undefined;
}

function normalizeRequires(value: unknown): string[] | undefined {
  const results: string[] = [];
  const addNumbers = (input: string) => {
    const matches = input.match(/\d+/g);
    if (matches) {
      results.push(...matches);
    }
  };

  if (Array.isArray(value)) {
    value.forEach((entry) => {
      if (typeof entry === "number" && Number.isFinite(entry)) {
        results.push(String(entry));
        return;
      }
      if (entry !== undefined && entry !== null) {
        addNumbers(String(entry));
      }
    });
  } else if (typeof value === "number" && Number.isFinite(value)) {
    results.push(String(value));
  } else if (typeof value === "string") {
    addNumbers(value);
  }

  const unique = Array.from(new Set(results));
  return unique.length > 0 ? unique : undefined;
}

function normalizeDate(value: unknown): string | undefined {
  if (!value) {
    return undefined;
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }
  if (typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return new Date(`${trimmed}T00:00:00.000Z`).toISOString();
    }
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
  }
  return undefined;
}

function extractNumberFromFilename(filename: string): number | undefined {
  const match = filename.match(/(\d+)/);
  if (!match) {
    return undefined;
  }
  const parsed = Number(match[1]);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function rewriteRelativeAssetUrls(content: string, proposalType: ProposalType): string {
  const repo = REPOS.find((entry) => entry.proposalType === proposalType);
  const baseUrl = repo?.assetsBaseUrl ?? "https://eips.ethereum.org";

  const markdownRewritten = content.replace(/!\[(.*?)\]\((\.\.\/assets\/.*?)\)/g, (match, altText, relativePath) => {
    const fullUrl = `${baseUrl}${String(relativePath).slice(2)}`;
    return `![${altText}](${fullUrl})`;
  });

  return markdownRewritten.replace(/src=("|')(\.\.\/assets\/.*?)(\1)/g, (match, quote, relativePath) => {
    const fullUrl = `${baseUrl}${String(relativePath).slice(2)}`;
    return `src=${quote}${fullUrl}${quote}`;
  });
}

function pruneEmpty<T extends Record<string, unknown>>(input: T): Partial<T> {
  const output: Partial<T> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null) {
      continue;
    }
    if (typeof value === "string" && value.trim().length === 0) {
      continue;
    }
    if (Array.isArray(value) && value.length === 0) {
      continue;
    }
    output[key as keyof T] = value as T[keyof T];
  }
  return output;
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const contents = await fs.readFile(filePath, "utf-8");
    return JSON.parse(contents) as T;
  } catch (error) {
    return null;
  }
}

async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  const contents = JSON.stringify(data, null, 2);
  await fs.writeFile(filePath, contents, "utf-8");
}

async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

async function fetchGitHubJson<T>(url: string, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "eips-with-style-ingestion"
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API error ${response.status} for ${url}: ${body}`);
  }
  return (await response.json()) as T;
}

async function fetchRepoFiles(config: RepoConfig, token?: string): Promise<GitHubFile[]> {
  const url = `${GITHUB_API_BASE}/${config.repo}/contents/${config.contentsPath}`;
  const data = await fetchGitHubJson<GitHubFile[]>(url, token);
  if (!Array.isArray(data)) {
    throw new Error(`Unexpected GitHub API response for ${config.repo}.`);
  }
  return data.filter((file) => file.type === "file" && file.name.endsWith(".md"));
}

async function downloadFile(url: string, token?: string): Promise<string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.raw",
    "User-Agent": "eips-with-style-ingestion"
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status}`);
  }
  return await response.text();
}

const buildMetaKey = (proposalType: ProposalType, number: number) => `${proposalType}-${number}`;

async function loadProposalMetaMap(client: ConvexHttpClient) {
  const metaMap = new Map<string, ExistingProposalInfo>();
  let cursor: string | null = null;
  let done = false;

  while (!done) {
    const page = (await client.query(api.proposals.listProposalMetaPage, {
      cursor,
      limit: 500
    })) as ProposalMetaPage;

    page.page.forEach((meta) => {
      metaMap.set(buildMetaKey(meta.proposal_type, meta.number), {
        id: meta.id,
        sha: meta.sha ?? null
      });
    });

    done = page.isDone;
    cursor = page.continueCursor ?? null;
  }

  return metaMap;
}

async function ingestRepo(
  config: RepoConfig,
  options: ParsedArgs,
  client: ConvexHttpClient,
  report: IngestionReport,
  metaMap: Map<string, ExistingProposalInfo>,
  token?: string
) {
  const repoCounts = report.byType[config.proposalType];
  console.log(`\nProcessing ${config.proposalType} proposals from ${config.repo}/${config.contentsPath}`);

  const cacheDir = path.join(options.cacheDir, config.proposalType.toLowerCase());
  await ensureDir(cacheDir);

  const files = await fetchRepoFiles(config, token);
  console.log(`Found ${files.length} markdown files`);

  for (const file of files) {
    repoCounts.processed += 1;
    report.totals.processed += 1;

    const entry: IngestionEntry = {
      proposal_type: config.proposalType,
      filename: file.name,
      status: "failed"
    };

    try {
      const filenameNumber = extractNumberFromFilename(file.name);
      let existingInfo: ExistingProposalInfo | null = filenameNumber
        ? metaMap.get(buildMetaKey(config.proposalType, filenameNumber)) ?? null
        : null;

      if (!options.download && existingInfo?.sha && existingInfo.sha === file.sha) {
        repoCounts.skipped += 1;
        report.totals.skipped += 1;
        entry.status = "skipped";
        entry.number = filenameNumber;
        entry.reason = "sha unchanged";
        report.entries.push(entry);
        continue;
      }

      const cachePath = path.join(cacheDir, file.name);
      const infoPath = `${cachePath}.json`;
      let content: string | null = null;

      const cachedInfo = await readJsonFile<{ sha?: string }>(infoPath);
      if (!options.download && cachedInfo?.sha === file.sha) {
        try {
          content = await fs.readFile(cachePath, "utf-8");
        } catch (error) {
          content = null;
        }
      }

      if (!content) {
        content = await downloadFile(file.download_url, token);
        await fs.writeFile(cachePath, content, "utf-8");
        await writeJsonFile(infoPath, {
          name: file.name,
          sha: file.sha,
          html_url: file.html_url,
          download_url: file.download_url,
          path: file.path
        });
      }

      const parsed = matter(content);
      const metadata = normalizeFrontMatter(parsed.data as Record<string, unknown>);
      const frontMatterNumber = extractNumber(metadata, config.proposalType);
      const proposalNumber = frontMatterNumber ?? filenameNumber;

      if (!proposalNumber) {
        throw new Error("Missing proposal number in front matter and filename.");
      }

      if (!existingInfo || (filenameNumber && proposalNumber !== filenameNumber)) {
        existingInfo = metaMap.get(buildMetaKey(config.proposalType, proposalNumber)) ?? null;
      }

      const statusValue = extractString(metadata, ["status"]);
      if (statusValue?.toLowerCase() === "moved") {
        repoCounts.skipped += 1;
        report.totals.skipped += 1;
        entry.status = "skipped";
        entry.number = proposalNumber;
        entry.reason = "status moved";
        report.entries.push(entry);
        continue;
      }

      const title = extractString(metadata, ["title"]);
      if (!title) {
        throw new Error("Missing title in front matter.");
      }

      const createdAt = normalizeDate(metadata["created"] ?? metadata["created_at"] ?? metadata["created-at"]);
      const description = extractString(metadata, ["description", "summary"]);
      const type = extractString(metadata, ["type"]);
      const category = extractString(metadata, ["category"]);
      const authors = normalizeAuthors(metadata["author"] ?? metadata["authors"]);
      const discussionUrl = normalizeUrl(
        extractString(metadata, ["discussions-to", "discussions_to", "discussion", "discussion_url"])
      );
      const officialUrl = normalizeUrl(extractString(metadata, ["official-url", "official_url", "url"]));
      const links = normalizeLinks(metadata["link"] ?? metadata["links"]);
      const requires = normalizeRequires(metadata["requires"]);

      const cleanedContent = rewriteRelativeAssetUrls(parsed.content.trim(), config.proposalType);
      const slug = `${config.proposalType.toLowerCase()}-${proposalNumber}`;

      const proposalPayload = {
        proposal_type: config.proposalType,
        number: proposalNumber,
        slug,
        title,
        ...pruneEmpty({
          description,
          content: cleanedContent,
          status: statusValue,
          type,
          category,
          authors,
          discussion_url: discussionUrl,
          github_url: normalizeUrl(file.html_url) ?? file.html_url,
          official_url: officialUrl,
          links,
          requires,
          created_at: createdAt,
          sha: file.sha,
          source_repo: config.repo,
          source_path: file.path,
          download_url: file.download_url
        })
      };

      const proposalId = await client.mutation(api.proposals.upsertProposal, {
        proposal: proposalPayload
      });

      metaMap.set(buildMetaKey(config.proposalType, proposalNumber), {
        id: proposalId as string,
        sha: file.sha
      });

      const wasExisting = Boolean(existingInfo?.id);
      if (wasExisting) {
        repoCounts.updated += 1;
        report.totals.updated += 1;
        entry.status = "updated";
      } else {
        repoCounts.inserted += 1;
        report.totals.inserted += 1;
        entry.status = "inserted";
      }

      entry.number = proposalNumber;
      report.entries.push(entry);
      console.log(`${entry.status.toUpperCase()}: ${config.proposalType}-${proposalNumber}`);
    } catch (error) {
      repoCounts.failed += 1;
      report.totals.failed += 1;
      entry.status = "failed";
      entry.reason = error instanceof Error ? error.message : "Unknown error";
      report.entries.push(entry);
      console.warn(`FAILED ${file.name}: ${entry.reason}`);
    }
  }
}

async function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    const convexUrl = process.env.CONVEX_URL;
    if (!convexUrl) {
      throw new Error("CONVEX_URL is required to run ingestion.");
    }

    const token = process.env.GITHUB_TOKEN;
    const client = new ConvexHttpClient(convexUrl);
    const metaMap = await loadProposalMetaMap(client);
    console.log(`Loaded ${metaMap.size} proposal metadata entries from Convex.`);

    const report: IngestionReport = {
      startedAt: new Date().toISOString(),
      finishedAt: "",
      options,
      totals: createCounts(),
      byType: {
        EIP: createCounts(),
        ERC: createCounts(),
        CAIP: createCounts(),
        RIP: createCounts()
      },
      entries: []
    };

    const targetRepos = options.types?.length
      ? REPOS.filter((repo) => options.types?.includes(repo.proposalType))
      : REPOS;

    await ensureDir(options.reportDir);

    for (const repo of targetRepos) {
      await ingestRepo(repo, options, client, report, metaMap, token);
    }

    report.finishedAt = new Date().toISOString();

    const safeTimestamp = report.finishedAt.replace(/[:.]/g, "-");
    const reportPath = path.join(options.reportDir, `ingestion-report-${safeTimestamp}.json`);
    await writeJsonFile(reportPath, report);

    console.log("\nIngestion complete.");
    console.log(`Report written to ${reportPath}`);
    console.log(JSON.stringify(report.totals, null, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    console.log(USAGE);
    process.exit(1);
  }
}

main();
