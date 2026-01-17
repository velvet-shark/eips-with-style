type ProposalDoc = {
  _id: string;
  proposal_type: string;
  number: number;
  slug: string;
  title: string;
  featured?: boolean;
  created_at?: string;
  status?: string;
  type?: string;
  category?: string;
  authors?: string;
  discussion_url?: string;
  github_url?: string;
  official_url?: string;
  links?: string[];
  requires?: string[];
  title_descriptive?: string;
  why_important?: string;
  updated_at?: string;
  sha?: string;
  source_repo?: string;
  source_path?: string;
  download_url?: string;
};

export function toProposalShort(doc: ProposalDoc, view_count?: number) {
  return {
    id: doc._id,
    proposal_type: doc.proposal_type,
    number: doc.number,
    slug: doc.slug,
    title: doc.title,
    created_at: doc.created_at ?? "",
    featured: Boolean(doc.featured),
    ...(view_count !== undefined ? { view_count } : {})
  };
}

type ProposalContentDoc = {
  content?: string;
  description?: string;
};

export function toProposalDetail(doc: ProposalDoc, contentDoc?: ProposalContentDoc) {
  return {
    id: doc._id,
    proposal_type: doc.proposal_type,
    number: doc.number,
    slug: doc.slug,
    category: doc.category ?? "",
    title: doc.title,
    title_descriptive: doc.title_descriptive ?? "",
    content: contentDoc?.content ?? "",
    status: doc.status ?? "",
    type: doc.type ?? "",
    authors: doc.authors ?? "",
    created_at: doc.created_at ?? "",
    updated_at: doc.updated_at ?? "",
    github_url: doc.github_url ?? "",
    official_url: doc.official_url ?? "",
    links: doc.links ?? [],
    why_important: doc.why_important ?? "",
    requires: doc.requires ?? [],
    description: contentDoc?.description ?? "",
    discussion_url: doc.discussion_url ?? "",
    featured: Boolean(doc.featured)
  };
}
