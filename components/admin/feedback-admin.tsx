"use client";

import { useState } from "react";
import Link from "next/link";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Archive, ArchiveRestore, ThumbsDown, ThumbsUp, Trash2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function FeedbackAdmin({ userEmail }: { userEmail: string }) {
  const [showArchived, setShowArchived] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const { isAuthenticated } = useConvexAuth();
  const entries = useQuery(api.feedback.list, isAuthenticated ? { archived: showArchived } : "skip");
  const setArchived = useMutation(api.feedback.setArchived);
  const removeEntry = useMutation(api.feedback.remove);
  const { signOut } = useAuthActions();

  const run = async (action: () => Promise<unknown>) => {
    setActionError(null);
    try {
      await action();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Action failed.");
    }
  };

  const handleDelete = (id: Id<"feedback">) => {
    if (window.confirm("Delete this feedback permanently?")) {
      void run(() => removeEntry({ id }));
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } finally {
      window.location.href = "/admin/enrichments";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-12">
        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Feedback</CardTitle>
              <CardDescription>Sent from the Feedback button on proposal pages.</CardDescription>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Link href="/admin/enrichments" className="text-primary underline-offset-4 hover:underline">
                Enrichments
              </Link>
              <span>{userEmail}</span>
              <Button onClick={handleSignOut} variant="ghost" size="sm">
                Sign out
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="flex gap-2">
          <Button variant={showArchived ? "outline" : "default"} size="sm" onClick={() => setShowArchived(false)}>
            Inbox
          </Button>
          <Button variant={showArchived ? "default" : "outline"} size="sm" onClick={() => setShowArchived(true)}>
            Archived
          </Button>
        </div>

        {actionError && <p className="text-sm text-red-500">{actionError}</p>}

        {entries === undefined && <p className="text-sm text-muted-foreground">Loading...</p>}
        {entries === null && <p className="text-sm text-red-500">This account can&apos;t read feedback.</p>}
        {entries && entries.length === 0 && (
          <p className="text-sm text-muted-foreground">{showArchived ? "Nothing archived." : "No new feedback."}</p>
        )}

        {entries?.map((entry) => (
          <Card key={entry._id}>
            <CardContent className="flex flex-col gap-3 pt-6">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>{new Date(entry._creationTime).toLocaleString()}</span>
                {entry.rating === "up" && (
                  <span className="flex items-center gap-1 text-emerald-600">
                    <ThumbsUp className="h-3.5 w-3.5" /> Helpful
                  </span>
                )}
                {entry.rating === "down" && (
                  <span className="flex items-center gap-1 text-red-500">
                    <ThumbsDown className="h-3.5 w-3.5" /> Not helpful
                  </span>
                )}
                {entry.page && (
                  <Link href={entry.page} target="_blank" className="text-primary underline-offset-4 hover:underline">
                    {entry.page}
                  </Link>
                )}
                {entry.email && (
                  <a href={`mailto:${entry.email}`} className="text-primary underline-offset-4 hover:underline">
                    {entry.email}
                  </a>
                )}
              </div>
              {entry.message ? (
                <p className="whitespace-pre-wrap break-words text-sm">{entry.message}</p>
              ) : (
                <p className="text-sm italic text-muted-foreground">Rating only, no comment.</p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => void run(() => setArchived({ id: entry._id, archived: !entry.archived }))}
                >
                  {entry.archived ? (
                    <>
                      <ArchiveRestore className="mr-2 h-4 w-4" /> Move to inbox
                    </>
                  ) : (
                    <>
                      <Archive className="mr-2 h-4 w-4" /> Archive
                    </>
                  )}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(entry._id)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
