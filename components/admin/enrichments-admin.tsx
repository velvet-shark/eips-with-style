"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const PROPOSAL_TYPES = ["EIP", "ERC", "CAIP", "RIP"] as const;

type ProposalType = (typeof PROPOSAL_TYPES)[number];

type ProposalData = {
  proposal_type: ProposalType;
  number: number;
  slug: string;
  title: string;
  description: string;
  status: string;
  title_descriptive: string;
  why_important: string;
  updated_at: string;
};

type EnrichmentsAdminProps = {
  userEmail: string | null;
  isAuthorized: boolean;
  allowedEmail: string;
  authError?: string | null;
};

const formatUpdatedAt = (value: string) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

export default function EnrichmentsAdmin({
  userEmail,
  isAuthorized,
  allowedEmail,
  authError
}: EnrichmentsAdminProps) {
  const [proposalType, setProposalType] = useState<ProposalType>("EIP");
  const [numberInput, setNumberInput] = useState("");
  const [proposal, setProposal] = useState<ProposalData | null>(null);
  const [titleDescriptive, setTitleDescriptive] = useState("");
  const [whyImportant, setWhyImportant] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const initialAuthMessage =
    authError === "unauthorized"
      ? "That GitHub account is not authorized. Please sign in with the allowed account."
      : authError;
  const [authMessage, setAuthMessage] = useState(initialAuthMessage);
  const { signIn, signOut } = useAuthActions();

  const normalizedTitle = titleDescriptive.trim();
  const normalizedWhy = whyImportant.trim();

  const isDirty = useMemo(() => {
    if (!proposal) return false;
    return normalizedTitle !== (proposal.title_descriptive ?? "") || normalizedWhy !== (proposal.why_important ?? "");
  }, [proposal, normalizedTitle, normalizedWhy]);

  const proposalUrl = proposal
    ? `/${proposal.proposal_type.toLowerCase()}s/${proposal.slug}`
    : null;

  const handleSignIn = async () => {
    setAuthMessage(null);
    try {
      await signIn("github", { redirectTo: "/admin/enrichments" });
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : "Unable to sign in.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } finally {
      window.location.reload();
    }
  };

  const loadProposal = async (override?: { type: ProposalType; number: number }) => {
    setLoadError(null);
    setSaveError(null);
    setSaveNotice(null);
    setProposal(null);

    const number = override?.number ?? Number.parseInt(numberInput, 10);
    if (Number.isNaN(number) || number <= 0) {
      setLoadError("Enter a valid proposal number.");
      return;
    }

    const type = override?.type ?? proposalType;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        proposalType: type,
        number: String(number)
      });
      const response = await fetch(`/api/admin/enrichments?${params.toString()}`, { cache: "no-store" });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string; received?: unknown };
        const details = body.received ? ` (${JSON.stringify(body.received)})` : "";
        setLoadError(body.error ? `${body.error}${details}` : "Failed to load proposal.");
        return;
      }

      const data = (await response.json()) as { proposal: ProposalData };
      setProposal(data.proposal);
      setTitleDescriptive(data.proposal.title_descriptive ?? "");
      setWhyImportant(data.proposal.why_important ?? "");
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to load proposal.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!proposal) {
      setSaveError("Load a proposal first.");
      return;
    }

    setSaveError(null);
    setSaveNotice(null);

    const payload: {
      proposalType: ProposalType;
      number: number;
      title_descriptive?: string;
      why_important?: string;
    } = {
      proposalType: proposal.proposal_type,
      number: proposal.number
    };

    if (normalizedTitle) {
      payload.title_descriptive = normalizedTitle;
    }

    if (normalizedWhy) {
      payload.why_important = normalizedWhy;
    }

    if (!payload.title_descriptive && !payload.why_important) {
      setSaveError("Provide at least one non-empty enrichment field.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/enrichments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        setSaveError(body.error ?? "Failed to save enrichments.");
        return;
      }

      await loadProposal({ type: proposal.proposal_type, number: proposal.number });
      setSaveNotice("Enrichment updated successfully.");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save enrichments.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!proposal) return;
    setTitleDescriptive(proposal.title_descriptive ?? "");
    setWhyImportant(proposal.why_important ?? "");
    setSaveError(null);
    setSaveNotice(null);
  };

  if (!userEmail) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto flex max-w-xl flex-col gap-6 px-6 py-16">
          <Card>
            <CardHeader>
              <CardTitle>Enrichment Admin</CardTitle>
              <CardDescription>Sign in with GitHub to manage proposal enrichments.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {authMessage && <p className="text-sm text-red-500">{authMessage}</p>}
              <Button onClick={handleSignIn}>Sign in with GitHub</Button>
              <p className="text-xs text-muted-foreground">Access is restricted to {allowedEmail}.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto flex max-w-xl flex-col gap-6 px-6 py-16">
          <Card>
            <CardHeader>
              <CardTitle>Access denied</CardTitle>
              <CardDescription>This GitHub account is not authorized to manage enrichments.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">Signed in as {userEmail}.</p>
              <Button onClick={handleSignOut} variant="secondary">
                Sign out
              </Button>
              <p className="text-xs text-muted-foreground">Allowed account: {allowedEmail}.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-12">
        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Enrichment Admin</CardTitle>
              <CardDescription>Update "In simple terms" and "Why is it important?" for proposals.</CardDescription>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{userEmail}</span>
              <Button onClick={handleSignOut} variant="ghost" size="sm">
                Sign out
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Find a proposal</CardTitle>
            <CardDescription>Load an entry by type and number.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-[140px_1fr_120px]">
              <label className="flex flex-col gap-2 text-sm">
                Proposal type
                <select
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                  value={proposalType}
                  onChange={(event) => setProposalType(event.target.value as ProposalType)}
                >
                  {PROPOSAL_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm">
                Number
                <input
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                  placeholder="1559"
                  value={numberInput}
                  onChange={(event) => setNumberInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      loadProposal();
                    }
                  }}
                />
              </label>
              <div className="flex items-end">
                <Button onClick={() => loadProposal()} disabled={loading} className="w-full">
                  {loading ? "Loading..." : "Load"}
                </Button>
              </div>
            </div>
            {loadError && <p className="text-sm text-red-500">{loadError}</p>}
          </CardContent>
        </Card>

        {proposal && (
          <Card>
            <CardHeader>
              <CardTitle>{proposal.title}</CardTitle>
              <CardDescription>
                {proposal.proposal_type}-{proposal.number} · {proposal.status || "Status unknown"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {proposal.description && (
                <p className="text-sm text-muted-foreground">{proposal.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {proposal.updated_at && <span>Last updated {formatUpdatedAt(proposal.updated_at)}</span>}
                {proposalUrl && (
                  <Link
                    href={proposalUrl}
                    target="_blank"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    View public page
                  </Link>
                )}
              </div>

              <div className="grid gap-4">
                <label className="flex flex-col gap-2 text-sm">
                  In simple terms
                  <textarea
                    className="min-h-[120px] rounded-md border bg-background px-3 py-2 text-sm"
                    value={titleDescriptive}
                    onChange={(event) => setTitleDescriptive(event.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  Why is it important?
                  <textarea
                    className="min-h-[140px] rounded-md border bg-background px-3 py-2 text-sm"
                    value={whyImportant}
                    onChange={(event) => setWhyImportant(event.target.value)}
                  />
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={handleSave} disabled={saving || !isDirty}>
                  {saving ? "Saving..." : "Save changes"}
                </Button>
                <Button onClick={handleReset} variant="secondary" disabled={saving || !isDirty}>
                  Reset
                </Button>
                <span className="text-xs text-muted-foreground">
                  Empty fields are ignored to prevent accidental clearing.
                </span>
              </div>

              {saveError && <p className="text-sm text-red-500">{saveError}</p>}
              {saveNotice && <p className="text-sm text-emerald-600">{saveNotice}</p>}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
