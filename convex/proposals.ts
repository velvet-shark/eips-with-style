import { mutation, query } from "./_generated/server";
import { v, type Infer } from "convex/values";
import { toProposalDetail, toProposalShort } from "./proposal_utils";
import type { Id } from "./_generated/dataModel";

const proposalInput = v.object({
  proposal_type: v.string(),
  number: v.number(),
  slug: v.string(),
  title: v.string(),
  description: v.optional(v.string()),
  content: v.optional(v.string()),
  status: v.optional(v.string()),
  type: v.optional(v.string()),
  category: v.optional(v.string()),
  authors: v.optional(v.string()),
  discussion_url: v.optional(v.string()),
  github_url: v.optional(v.string()),
  official_url: v.optional(v.string()),
  links: v.optional(v.array(v.string())),
  requires: v.optional(v.array(v.string())),
  title_descriptive: v.optional(v.string()),
  why_important: v.optional(v.string()),
  featured: v.optional(v.boolean()),
  created_at: v.optional(v.string()),
  updated_at: v.optional(v.string()),
  sha: v.optional(v.string()),
  source_repo: v.optional(v.string()),
  source_path: v.optional(v.string()),
  download_url: v.optional(v.string())
});

type ProposalInput = Infer<typeof proposalInput>;

export const getProposalBySlugType = query({
  args: {
    slug: v.string(),
    proposal_type: v.string()
  },
  handler: async (ctx, args) => {
    const proposal = await ctx.db
      .query("proposals")
      .withIndex("by_slug_type", (q) => q.eq("slug", args.slug).eq("proposal_type", args.proposal_type))
      .unique();

    if (!proposal) {
      return null;
    }

    const content = await ctx.db
      .query("proposal_contents")
      .withIndex("by_proposal", (q) => q.eq("proposalId", proposal._id))
      .unique();

    return toProposalDetail(proposal as typeof proposal & { _id: string }, content ?? undefined);
  }
});

export const listAllProposals = query({
  args: {},
  handler: async (ctx) => {
    const proposals = await ctx.db.query("proposals").collect();

    proposals.sort((a, b) => {
      const aParsed = a.created_at ? Date.parse(a.created_at) : NaN;
      const bParsed = b.created_at ? Date.parse(b.created_at) : NaN;
      const aTime = Number.isNaN(aParsed) ? 0 : aParsed;
      const bTime = Number.isNaN(bParsed) ? 0 : bParsed;
      return bTime - aTime;
    });

    return proposals.map((proposal) => toProposalShort(proposal as typeof proposal & { _id: string }));
  }
});

export const listProposalsForSitemapPage = query({
  args: {
    cursor: v.optional(v.union(v.string(), v.null())),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 200, 1), 500);
    const cursor = args.cursor ?? null;
    const results = await ctx.db
      .query("proposals")
      .withIndex("by_created_at")
      .paginate({
        cursor,
        numItems: limit
      });

    return {
      ...results,
      page: results.page.map((proposal) => ({
        proposal_type: proposal.proposal_type,
        slug: proposal.slug,
        updated_at: proposal.updated_at ?? ""
      }))
    };
  }
});

export const getProposalIngestionInfo = query({
  args: {
    proposal_type: v.string(),
    number: v.number()
  },
  handler: async (ctx, args) => {
    const meta = await ctx.db
      .query("proposal_meta")
      .withIndex("by_type_number", (q) => q.eq("proposal_type", args.proposal_type).eq("number", args.number))
      .unique();

    if (meta) {
      return {
        id: meta.proposalId,
        sha: meta.sha ?? null
      };
    }

    const proposal = await ctx.db
      .query("proposals")
      .withIndex("by_type_number", (q) => q.eq("proposal_type", args.proposal_type).eq("number", args.number))
      .unique();

    if (!proposal) {
      return null;
    }

    return {
      id: proposal._id,
      sha: proposal.sha ?? null
    };
  }
});

export const upsertProposal = mutation({
  args: {
    proposal: proposalInput
  },
  handler: async (ctx, args) => {
    const { proposal } = args;
    const existingMeta = await ctx.db
      .query("proposal_meta")
      .withIndex("by_type_number", (q) => q.eq("proposal_type", proposal.proposal_type).eq("number", proposal.number))
      .unique();

    let existing: { _id: Id<"proposals"> } | null = null;
    if (existingMeta) {
      existing = await ctx.db.get(existingMeta.proposalId);
    } else {
      existing = await ctx.db
        .query("proposals")
        .withIndex("by_type_number", (q) => q.eq("proposal_type", proposal.proposal_type).eq("number", proposal.number))
        .unique();
    }

    const now = new Date().toISOString();
    const patch: Partial<ProposalInput> = {};

    Object.entries(proposal).forEach(([key, value]) => {
      if (value !== undefined) {
        (patch as Record<string, unknown>)[key] = value;
      }
    });

    delete patch.title_descriptive;
    delete patch.why_important;
    delete patch.content;
    delete patch.description;

    let proposalId: Id<"proposals">;
    if (existing) {
      await ctx.db.patch(existing._id, {
        ...patch,
        updated_at: now
      });
      proposalId = existing._id;
    } else {
      const createdAt = typeof proposal.created_at === "string" ? proposal.created_at : now;

      const insertDoc: ProposalInput = {
        ...patch,
        proposal_type: proposal.proposal_type,
        number: proposal.number,
        slug: proposal.slug,
        title: proposal.title,
        featured: Boolean(proposal.featured),
        created_at: createdAt,
        updated_at: now
      };

      proposalId = await ctx.db.insert("proposals", insertDoc);
    }

    if (existingMeta) {
      await ctx.db.patch(existingMeta._id, {
        proposalId,
        sha: proposal.sha ?? existingMeta.sha
      });
    } else {
      await ctx.db.insert("proposal_meta", {
        proposal_type: proposal.proposal_type,
        number: proposal.number,
        proposalId,
        sha: proposal.sha ?? undefined
      });
    }

    const contentPatch: Record<string, unknown> = {};
    if (proposal.content !== undefined) {
      contentPatch.content = proposal.content;
    }
    if (proposal.description !== undefined) {
      contentPatch.description = proposal.description;
    }

    if (Object.keys(contentPatch).length > 0) {
      const existingContent = await ctx.db
        .query("proposal_contents")
        .withIndex("by_proposal", (q) => q.eq("proposalId", proposalId))
        .unique();

      if (existingContent) {
        await ctx.db.patch(existingContent._id, contentPatch);
      } else {
        await ctx.db.insert("proposal_contents", {
          proposalId,
          ...contentPatch
        });
      }
    }

    return proposalId;
  }
});
