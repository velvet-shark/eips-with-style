import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { toProposalShort } from "./proposal_utils";
import type { Id } from "./_generated/dataModel";

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_DAYS = 30;
const DEFAULT_LIMIT = 20;
const MAX_DAYS = 365;
const MAX_LIMIT = 50;

async function computePopularFromViews(ctx: any, daysBack: number, limit: number) {
  const cutoff = Date.now() - daysBack * DAY_MS;
  const views = await ctx.db
    .query("proposal_views")
    .withIndex("by_viewed_at", (q: any) => q.gte("viewed_at", cutoff))
    .collect();

  const counts = new Map<Id<"proposals">, number>();
  views.forEach((view: { proposalId: Id<"proposals"> }) => {
    const key = view.proposalId;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  const top = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  const proposals = await Promise.all(
    top.map(async ([proposalId, view_count]) => {
      const proposal = await ctx.db.get(proposalId);
      if (!proposal) {
        return null;
      }
      return toProposalShort(proposal as typeof proposal & { _id: string }, view_count);
    })
  );

  return proposals.filter(Boolean);
}

export const computePopularProposals = mutation({
  args: {
    daysBack: v.optional(v.number()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const daysBack = Math.min(Math.max(args.daysBack ?? DEFAULT_DAYS, 1), MAX_DAYS);
    const limit = Math.min(Math.max(args.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
    const cutoff = Date.now() - daysBack * DAY_MS;
    const views = await ctx.db
      .query("proposal_views")
      .withIndex("by_viewed_at", (q: any) => q.gte("viewed_at", cutoff))
      .collect();

    const counts = new Map<Id<"proposals">, number>();
    views.forEach((view: { proposalId: Id<"proposals"> }) => {
      const key = view.proposalId;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    const proposals = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([proposalId, view_count]) => ({ proposalId, view_count }));

    const now = Date.now();
    const existing = await ctx.db.query("popular_cache").first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        lastComputedAt: now,
        proposals
      });
      return existing._id;
    }

    return ctx.db.insert("popular_cache", {
      lastComputedAt: now,
      proposals
    });
  }
});

export const getPopularProposals = query({
  args: {
    daysBack: v.optional(v.number()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const daysBack = args.daysBack ?? DEFAULT_DAYS;
    const limit = args.limit ?? DEFAULT_LIMIT;

    const cache = await ctx.db.query("popular_cache").first();
    if (cache && cache.proposals.length > 0) {
      const proposals = await Promise.all(
        cache.proposals.slice(0, limit).map(async (entry) => {
          const proposal = await ctx.db.get(entry.proposalId);
          if (!proposal) {
            return null;
          }
          return toProposalShort(proposal as typeof proposal & { _id: string }, entry.view_count);
        })
      );

      return proposals.filter(Boolean);
    }

    return computePopularFromViews(ctx, daysBack, limit);
  }
});
