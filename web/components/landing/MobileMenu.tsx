"use client";

import { useEffect } from "react";
import { cn } from "@/lib/cn";

type Entry = { number: string; href: string; label: string };

const entries: Entry[] = [
  { number: "01", href: "#features", label: "Features" },
  { number: "02", href: "#how-it-works", label: "How it works" },
  { number: "03", href: "#voice-notes", label: "Voice notes" },
  { number: "04", href: "#faq", label: "FAQ" },
  { number: "05", href: "#waitlist", label: "Get early access" },
];

/**
 * Full-screen ruled-paper overlay. Not a drawer, not a hamburger-to-X — it
 * reads as a sheet of notebook paper pulled over the page. Numbered entries,
 * flat ink, no shadow, no blur.
 */
export function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 paper-rules bg-paper transition-opacity duration-150",
        open ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!open}
    >
      <div className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-margin/90 sm:w-10" />

      <div className="relative flex h-full flex-col px-6 pb-10 pt-8 sm:px-10">
        <div className="flex items-center justify-between">
          <span className="label-mono text-[0.75rem] text-ink/50">
            menu · 05 entries
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="press label-mono grid h-10 w-10 place-items-center border-2 border-ink text-[0.75rem] text-ink active:translate-y-px"
          >
            <span aria-hidden="true" className="block">
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="square"
              >
                <path d="M5 5l14 14M19 5L5 19" />
              </svg>
            </span>
            close
          </button>
        </div>

        <nav aria-label="Mobile" className="mt-10 flex-1">
          <ul className="flex flex-col">
            {entries.map((entry) => (
              <li key={entry.href}>
                <a
                  href={entry.href}
                  onClick={onClose}
                  className="press group flex items-baseline gap-5 border-b border-ink/15 py-5 text-ink active:translate-y-px"
                >
                  <span className="label-mono w-12 shrink-0 text-[0.75rem] text-ink/40">
                    {entry.number}
                  </span>
                  <span className="font-display text-2xl leading-snug font-semibold sm:text-3xl">
                    {entry.label}
                  </span>
                  <span className="ml-auto label-mono text-[0.6875rem] text-ink/30 transition-colors group-hover:text-margin">
                    ?
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto flex items-center justify-between border-t-2 border-ink pt-5">
          <span className="label-mono text-[0.6875rem] text-ink/40">
            © 2026 Anotely
          </span>
          <span className="label-mono text-[0.6875rem] text-ink/40">
            desktop first · voice first
          </span>
        </div>
      </div>
    </div>
  );
}
