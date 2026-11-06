import { defaultSchema } from "rehype-sanitize";
import type { Options as SanitizeSchema } from "rehype-sanitize";

// GitHub's sanitization rules (the same ones proposals are rendered with on github.com), plus the
// table/text tags proposals use. Scripts, iframes, event handlers and javascript: URLs are removed.
export const markdownSanitizeSchema: SanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "small", "col", "colgroup", "caption"],
  // Keep id/name values unprefixed so existing in-page anchors (<a name="...">, #section links) keep working.
  clobber: []
};
