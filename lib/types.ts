interface ProposalShort {
  id: number;
  proposal_type: string;
  number: number;
  slug: string;
  title: string;
  description: string;
}

interface Proposal {
  id: string;
  proposal_type: string;
  number: number;
  slug: string;
  category: string;
  title: string;
  title_descriptive: string;
  abstract: string;
  motivation: string;
  content: string;
  status: string;
  type: string;
  authors: string[];
  created_at: Date;
  updated_at: Date;
  github_url: string;
  official_url: string;
  links: string[];
  why_important: string;
  requires: string[];
  description: string;
}

export type { ProposalShort, Proposal };
