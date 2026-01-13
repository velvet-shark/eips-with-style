import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const trackView = mutation({
  args: {
    proposalId: v.id("proposals"),
    userAgent: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("proposal_views", {
      proposalId: args.proposalId,
      viewed_at: Date.now(),
      user_agent: args.userAgent
    });
  }
});
