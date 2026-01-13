import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const updateEnrichment = mutation({
  args: {
    proposalType: v.string(),
    number: v.number(),
    title_descriptive: v.optional(v.string()),
    why_important: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const proposal = await ctx.db
      .query("proposals")
      .withIndex("by_type_number", (q) => q.eq("proposal_type", args.proposalType).eq("number", args.number))
      .unique();

    if (!proposal) {
      throw new Error(`Proposal not found for ${args.proposalType}-${args.number}`);
    }

    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };

    if (args.title_descriptive !== undefined) {
      patch.title_descriptive = args.title_descriptive;
    }

    if (args.why_important !== undefined) {
      patch.why_important = args.why_important;
    }

    await ctx.db.patch(proposal._id, patch);
    return proposal._id;
  }
});
