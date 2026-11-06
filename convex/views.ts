import { internalMutation, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

const DAY_MS = 24 * 60 * 60 * 1000;
// Popular proposals use a 30-day window; keep a few extra days of raw views as a buffer.
export const VIEW_RETENTION_DAYS = 35;
const PRUNE_BATCH_SIZE = 500;

export const trackView = mutation({
  args: {
    proposalId: v.id("proposals"),
    // Accepted for older cached clients that still send it, but no longer stored.
    userAgent: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("proposal_views", {
      proposalId: args.proposalId,
      viewed_at: Date.now()
    });
  }
});

const toUtcDay = (timestamp: number) => new Date(timestamp).toISOString().slice(0, 10);

// Rolls raw views older than the retention window into per-day counts, then deletes them.
// Runs in batches and reschedules itself until the backlog is cleared.
export const pruneOldViews = internalMutation({
  args: {},
  handler: async (ctx): Promise<{ deleted: number; more: boolean }> => {
    const cutoff = Date.now() - VIEW_RETENTION_DAYS * DAY_MS;
    const oldViews = await ctx.db
      .query("proposal_views")
      .withIndex("by_viewed_at", (q) => q.lt("viewed_at", cutoff))
      .take(PRUNE_BATCH_SIZE);

    const dailyCounts = new Map<string, { proposalId: Id<"proposals">; day: string; count: number }>();
    for (const view of oldViews) {
      const day = toUtcDay(view.viewed_at);
      const key = `${day}|${view.proposalId}`;
      const entry = dailyCounts.get(key);
      if (entry) {
        entry.count += 1;
      } else {
        dailyCounts.set(key, { proposalId: view.proposalId, day, count: 1 });
      }
    }

    for (const { proposalId, day, count } of Array.from(dailyCounts.values())) {
      const existing = await ctx.db
        .query("proposal_view_daily")
        .withIndex("by_day_proposal", (q) => q.eq("day", day).eq("proposalId", proposalId))
        .unique();
      if (existing) {
        await ctx.db.patch(existing._id, { count: existing.count + count });
      } else {
        await ctx.db.insert("proposal_view_daily", { proposalId, day, count });
      }
    }

    for (const view of oldViews) {
      await ctx.db.delete(view._id);
    }

    const more = oldViews.length === PRUNE_BATCH_SIZE;
    if (more) {
      await ctx.scheduler.runAfter(0, internal.views.pruneOldViews, {});
    }

    return { deleted: oldViews.length, more };
  }
});
