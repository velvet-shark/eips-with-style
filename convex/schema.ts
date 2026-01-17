import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  proposals: defineTable({
    proposal_type: v.string(),
    number: v.number(),
    slug: v.string(),
    title: v.string(),
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
  })
    .index("by_slug_type", ["slug", "proposal_type"])
    .index("by_type_number", ["proposal_type", "number"])
    .index("by_created_at", ["created_at"]),
  proposal_contents: defineTable({
    proposalId: v.id("proposals"),
    content: v.optional(v.string()),
    description: v.optional(v.string())
  }).index("by_proposal", ["proposalId"]),
  proposal_meta: defineTable({
    proposal_type: v.string(),
    number: v.number(),
    proposalId: v.id("proposals"),
    sha: v.optional(v.string())
  }).index("by_type_number", ["proposal_type", "number"]),
  proposal_views: defineTable({
    proposalId: v.id("proposals"),
    viewed_at: v.number(),
    user_agent: v.optional(v.string())
  })
    .index("by_viewed_at", ["viewed_at"])
    .index("by_proposal", ["proposalId"]),
  popular_cache: defineTable({
    lastComputedAt: v.number(),
    proposals: v.array(
      v.object({
        proposalId: v.id("proposals"),
        view_count: v.number()
      })
    )
  })
});
