import { NextResponse } from "next/server";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { getUserEmail, isAdminEmail } from "@/lib/admin-auth";

type ProposalType = "EIP" | "ERC" | "CAIP" | "RIP";

type ProposalResponse = {
  proposal_type: ProposalType;
  number: number;
  slug: string;
  title: string;
  description: string;
  status: string;
  title_descriptive: string;
  why_important: string;
  updated_at: string;
};

const VALID_TYPES: ProposalType[] = ["EIP", "ERC", "CAIP", "RIP"];

const normalizeType = (value: string | null): ProposalType | null => {
  if (!value) return null;
  const normalized = value.trim().toUpperCase();
  return VALID_TYPES.includes(normalized as ProposalType) ? (normalized as ProposalType) : null;
};

const parseNumber = (value: string | number | null | undefined): number | null => {
  if (typeof value === "number" && Number.isFinite(value) && Number.isInteger(value)) {
    return value;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (/^\d+$/.test(trimmed)) {
      const parsed = Number(trimmed);
      return Number.isFinite(parsed) ? parsed : null;
    }
  }
  return null;
};

const normalizeText = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const requireAdmin = async () => {
  const token = await convexAuthNextjsToken();
  if (!token) {
    return { authorized: false } as const;
  }

  const user = await fetchQuery(api.users.currentUser, {}, { token });
  const email = getUserEmail(user as { email?: unknown } | null);
  if (!isAdminEmail(email)) {
    return { authorized: false } as const;
  }
  return { authorized: true, email, token } as const;
};

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const proposalType =
    normalizeType(searchParams.get("proposalType")) ?? normalizeType(searchParams.get("proposal_type"));
  const number = parseNumber(searchParams.get("number")) ?? parseNumber(searchParams.get("proposalNumber"));

  if (!proposalType || number === null) {
    return NextResponse.json(
      {
        error: "proposalType and number are required.",
        received: {
          proposalType: searchParams.get("proposalType"),
          proposal_type: searchParams.get("proposal_type"),
          number: searchParams.get("number"),
          proposalNumber: searchParams.get("proposalNumber")
        }
      },
      { status: 400 }
    );
  }

  try {
    const slug = `${proposalType.toLowerCase()}-${number}`;
    const proposal = await fetchQuery(
      api.proposals.getProposalBySlugType,
      {
        slug,
        proposal_type: proposalType
      },
      { token: auth.token }
    );

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found." }, { status: 404 });
    }

    const response: ProposalResponse = {
      proposal_type: proposal.proposal_type as ProposalType,
      number: proposal.number,
      slug: proposal.slug,
      title: proposal.title,
      description: proposal.description ?? "",
      status: proposal.status ?? "",
      title_descriptive: proposal.title_descriptive ?? "",
      why_important: proposal.why_important ?? "",
      updated_at: proposal.updated_at ?? ""
    };

    return NextResponse.json({ proposal: response });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const proposalType = normalizeType((payload.proposalType as string | null) ?? (payload.proposal_type as string | null));
  const number = parseNumber(payload.number as string | number | null | undefined);
  const titleDescriptive = normalizeText(payload.title_descriptive);
  const whyImportant = normalizeText(payload.why_important);

  if (!proposalType || number === null) {
    return NextResponse.json({ error: "proposalType and number are required." }, { status: 400 });
  }

  if (!titleDescriptive && !whyImportant) {
    return NextResponse.json({ error: "Provide title_descriptive or why_important." }, { status: 400 });
  }

  try {
    const mutationPayload: {
      proposalType: ProposalType;
      number: number;
      title_descriptive?: string;
      why_important?: string;
    } = {
      proposalType,
      number
    };

    if (titleDescriptive) {
      mutationPayload.title_descriptive = titleDescriptive;
    }

    if (whyImportant) {
      mutationPayload.why_important = whyImportant;
    }

    await fetchMutation(api.enrichments.updateEnrichment, mutationPayload, { token: auth.token });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
