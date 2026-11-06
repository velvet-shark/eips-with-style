"use client";

import { useState, type FormEvent } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ConvexHttpClient } from "convex/browser";
import { ConvexError } from "convex/values";
import { MessageSquare, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Rating = "up" | "down";

const MAX_MESSAGE_LENGTH = 5000;

let convexClient: ConvexHttpClient | null = null;
const getConvexClient = () => {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is missing.");
  }
  convexClient ??= new ConvexHttpClient(url);
  return convexClient;
};

const fieldClassName =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<Rating | null>(null);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setRating(null);
    setMessage("");
    setEmail("");
    setSent(false);
    setError(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    // Keep an unsent draft if the panel is closed, but start fresh after a successful send.
    if (!nextOpen && sent) {
      reset();
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage && !rating) {
      setError("Add a comment or rate the page before sending.");
      return;
    }

    const honeypot = new FormData(event.currentTarget).get("website");
    setSending(true);
    setError(null);
    try {
      await getConvexClient().mutation(api.feedback.submit, {
        message: trimmedMessage || undefined,
        email: email.trim() || undefined,
        rating: rating ?? undefined,
        page: window.location.pathname,
        website: typeof honeypot === "string" && honeypot ? honeypot : undefined
      });
      setSent(true);
    } catch (submitError) {
      setError(
        submitError instanceof ConvexError
          ? String(submitError.data)
          : "Couldn't send your feedback. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          className={cn(
            "fixed z-40 flex items-center gap-2 bg-primary text-sm font-medium text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            // Mobile: floating pill in the bottom-right corner.
            "bottom-4 right-4 rounded-full px-4 py-2",
            // Desktop: vertical tab on the right edge, reading bottom to top.
            "md:bottom-auto md:right-0 md:top-1/2 md:-translate-y-1/2 md:rotate-180 md:rounded-none md:rounded-r-md md:px-2 md:py-3 md:[writing-mode:vertical-rl]"
          )}
        >
          <MessageSquare className="h-4 w-4 md:hidden" aria-hidden="true" />
          Feedback
        </button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[99998] bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed inset-y-0 right-0 z-[99999] flex w-full max-w-sm flex-col gap-5 overflow-y-auto border-l bg-background p-6 shadow-xl duration-200 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right">
          <div className="flex items-start justify-between gap-4">
            <DialogPrimitive.Title className="text-lg font-semibold leading-snug">
              Thoughts? Feedback? Want to suggest a link to add?
            </DialogPrimitive.Title>
            <DialogPrimitive.Close className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>
          <DialogPrimitive.Description className="-mt-3 text-sm text-muted-foreground">
            Your note goes straight to the person who runs EIP.directory.
          </DialogPrimitive.Description>

          {sent ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm">Thanks, your feedback was sent.</p>
              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={reset}>
                  Send more
                </Button>
                <DialogPrimitive.Close asChild>
                  <Button type="button">Close</Button>
                </DialogPrimitive.Close>
              </div>
            </div>
          ) : (
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-2 text-sm font-medium">Was this page helpful?</legend>
                <div className="flex gap-2">
                  {(
                    [
                      { value: "up", label: "Yes", Icon: ThumbsUp },
                      { value: "down", label: "No", Icon: ThumbsDown }
                    ] as const
                  ).map(({ value, label, Icon }) => (
                    <Button
                      key={value}
                      type="button"
                      variant={rating === value ? "default" : "outline"}
                      size="icon"
                      aria-pressed={rating === value}
                      aria-label={label}
                      onClick={() => setRating(rating === value ? null : value)}
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
              </fieldset>

              <label className="flex flex-col gap-2 text-sm font-medium">
                Comment
                <textarea
                  className={cn(fieldClassName, "min-h-[140px] font-normal")}
                  value={message}
                  maxLength={MAX_MESSAGE_LENGTH}
                  placeholder="What's missing, wrong, or worth linking?"
                  onChange={(event) => setMessage(event.target.value)}
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium">
                Email (optional, if you want a reply)
                <input
                  type="email"
                  className={cn(fieldClassName, "h-10 font-normal")}
                  value={email}
                  maxLength={254}
                  autoComplete="email"
                  placeholder="you@example.com"
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>

              {/* Honeypot for bots. People never see or fill it. */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label>
                  Website
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                </label>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button type="submit" disabled={sending}>
                {sending ? "Sending..." : "Send"}
              </Button>
            </form>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
