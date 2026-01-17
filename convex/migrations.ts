import { mutation } from "./_generated/server";
import { v } from "convex/values";

const MAX_BATCH = 1000;

export const stripLegacyProposalContent = mutation({
  args: {
    cursor: v.optional(v.union(v.string(), v.null())),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 200, 1), MAX_BATCH);
    const cursor = args.cursor ?? null;
    const page = await ctx.db.query("proposals").paginate({
      cursor,
      numItems: limit
    });

    let updated = 0;
    for (const doc of page.page) {
      const docAny = doc as Record<string, unknown>;
      const hasContent = Object.prototype.hasOwnProperty.call(docAny, "content");
      const hasDescription = Object.prototype.hasOwnProperty.call(docAny, "description");
      if (!hasContent && !hasDescription) continue;

      const rest = { ...(doc as Record<string, unknown>) };
      delete rest._id;
      delete rest._creationTime;
      delete rest.content;
      delete rest.description;
      await ctx.db.replace(doc._id, rest as any);
      updated += 1;
    }

    return {
      scanned: page.page.length,
      updated,
      continueCursor: page.continueCursor,
      isDone: page.isDone
    };
  }
});
