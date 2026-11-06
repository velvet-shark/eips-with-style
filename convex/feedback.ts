import { mutation, query } from "./_generated/server";
import { components } from "./_generated/api";
import { ConvexError, v } from "convex/values";
import { HOUR, RateLimiter } from "@convex-dev/rate-limiter";
import { isAdminUser } from "./access";

// submit is public and the deployment cannot see client IPs, so cap the total rate.
// Real feedback volume is a few entries a week.
const rateLimiter = new RateLimiter(components.rateLimiter, {
  feedbackGlobal: { kind: "token bucket", rate: 30, period: HOUR, capacity: 30 }
});

const MAX_MESSAGE_LENGTH = 5000;
const MAX_EMAIL_LENGTH = 254;
const MAX_PAGE_LENGTH = 300;
const EMAIL_PATTERN = /^[^\s@<>()"']+@[^\s@<>()"']+\.[^\s@<>()"']+$/;
const LIST_LIMIT = 200;

const clean = (value: string | undefined) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

export const submit = mutation({
  args: {
    message: v.optional(v.string()),
    email: v.optional(v.string()),
    rating: v.optional(v.union(v.literal("up"), v.literal("down"))),
    page: v.optional(v.string()),
    // Honeypot: hidden from people, filled in by naive bots.
    website: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    if (clean(args.website)) {
      return null;
    }

    const message = clean(args.message);
    const email = clean(args.email);
    const page = clean(args.page);

    if (!message && !args.rating) {
      throw new ConvexError("Add a comment or rate the page before sending.");
    }
    if (message && message.length > MAX_MESSAGE_LENGTH) {
      throw new ConvexError(`Comments are limited to ${MAX_MESSAGE_LENGTH} characters.`);
    }
    if (email && (email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email))) {
      throw new ConvexError("That email address doesn't look right.");
    }
    // Only same-site paths, so the admin view can link to them safely.
    const safePage = page && page.startsWith("/") && !page.startsWith("//") ? page.slice(0, MAX_PAGE_LENGTH) : undefined;

    const limit = await rateLimiter.limit(ctx, "feedbackGlobal");
    if (!limit.ok) {
      throw new ConvexError("Too much feedback is coming in right now. Please try again in a few minutes.");
    }

    return ctx.db.insert("feedback", {
      message,
      email,
      rating: args.rating,
      page: safePage,
      archived: false
    });
  }
});

export const list = query({
  args: { archived: v.boolean() },
  handler: async (ctx, args) => {
    if (!(await isAdminUser(ctx))) {
      return null;
    }
    return ctx.db
      .query("feedback")
      .withIndex("by_archived", (q) => q.eq("archived", args.archived))
      .order("desc")
      .take(LIST_LIMIT);
  }
});

export const setArchived = mutation({
  args: { id: v.id("feedback"), archived: v.boolean() },
  handler: async (ctx, args) => {
    if (!(await isAdminUser(ctx))) {
      throw new ConvexError("Unauthorized");
    }
    await ctx.db.patch(args.id, { archived: args.archived });
  }
});

export const remove = mutation({
  args: { id: v.id("feedback") },
  handler: async (ctx, args) => {
    if (!(await isAdminUser(ctx))) {
      throw new ConvexError("Unauthorized");
    }
    await ctx.db.delete(args.id);
  }
});
