"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { buttonClass } from "./ui";

export function WaitlistForm({ className }: { className?: string }) {
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <form
      className={cn("w-full", className)}
      onSubmit={(event) => {
        event.preventDefault();
        // TODO: wire to waitlist provider (e.g. Loops / Buttondown / a Route
        // Handler). Replace this with the real submit call.
        setNotice("Not connected yet — this form is a placeholder.");
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="waitlist-email" className="sr-only">
          Email address
        </label>
        <input
          id="waitlist-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full border-2 border-ink bg-paper px-4 py-3 font-mono text-[0.8125rem] text-ink placeholder:text-ink/40 sm:flex-1"
        />
        <button type="submit" className={buttonClass("solid")}>
          Join the waitlist
        </button>
      </div>

      <p
        role="status"
        aria-live="polite"
        className={cn(
          "label-mono mt-3 text-[0.6875rem] text-ink",
          notice ? "visible" : "invisible",
        )}
      >
        {notice ?? "placeholder"}
      </p>
    </form>
  );
}
