interface ProposalShort {
  id: number;
  proposal_type: string;
  number: number;
  slug: string;
  title: string;
  created_at: string;
  featured: boolean;
}

interface Proposal {
  id: number;
  proposal_type: string;
  number: number;
  slug: string;
  category: string;
  title: string;
  title_descriptive: string;
  content: string;
  status: string;
  type: string;
  authors: string;
  created_at: string;
  updated_at: string;
  github_url: string;
  official_url: string;
  links: string[];
  why_important: string;
  requires: string;
  description: string;
  discussion_url: string;
  featured: boolean;
}

export type { ProposalShort, Proposal };
