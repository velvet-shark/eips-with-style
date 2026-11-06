import { internalAction, mutation, query } from "./_generated/server";
import { components, internal } from "./_generated/api";
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

    const entry = { message, email, rating: args.rating, page: safePage };
    const id = await ctx.db.insert("feedback", { ...entry, archived: false });
    await ctx.scheduler.runAfter(0, internal.feedback.sendAlert, entry);
    return id;
  }
});

const SITE_ORIGIN = "https://eip.directory";
// Telegram caps messages at 4096 characters; leave room for the header lines.
const MAX_ALERT_MESSAGE_LENGTH = 3500;

// Sends a Telegram message about a new submission. Runs after the submit mutation commits,
// so a failed alert never loses the feedback itself; failures show in the Convex logs.
export const sendAlert = internalAction({
  args: {
    message: v.optional(v.string()),
    email: v.optional(v.string()),
    rating: v.optional(v.union(v.literal("up"), v.literal("down"))),
    page: v.optional(v.string())
  },
  handler: async (_ctx, args) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!botToken || !chatId) {
      console.warn("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set; skipping the feedback alert.");
      return;
    }

    const rating = args.rating === "up" ? "👍 Helpful" : args.rating === "down" ? "👎 Not helpful" : "No rating";
    const message =
      args.message && args.message.length > MAX_ALERT_MESSAGE_LENGTH
        ? `${args.message.slice(0, MAX_ALERT_MESSAGE_LENGTH)}… (cut, full text in the inbox)`
        : args.message;
    const text = [
      "💬 Feedback on eip.directory",
      `Page: ${args.page ? SITE_ORIGIN + args.page : "unknown"}`,
      `Rating: ${rating}`,
      `From: ${args.email ?? "anonymous"}`,
      "",
      message ?? "(no comment)",
      "",
      `Inbox: ${SITE_ORIGIN}/admin/feedback`
    ].join("\n");

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // No parse_mode: the text is user input, and markup characters in it would make Telegram reject the message.
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true })
    });

    if (!response.ok) {
      throw new Error(`Telegram rejected the feedback alert: ${response.status} ${await response.text()}`);
    }
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
