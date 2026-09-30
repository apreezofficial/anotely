import { useState } from "react";
import { MobileMenu } from "./MobileMenu";
import { Wordmark } from "./Logo";
import { ButtonLink, Container } from "./ui";

/**
 * Asymmetric nav. The wordmark sits at the far left, the primary action at
 * the far right, and the in-between links are deliberately not mirrored —
 * they cluster toward the right so the left edge stays open and readable.
 * Sticky, flat paper, 1.5px ink bottom border, no blur.
 */
export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b-2 border-ink bg-paper">
        <Container className="flex h-16 items-center gap-4 sm:h-18">
          <a
            href="#top"
            className="press -translate-y-px text-ink hover:text-ink/70"
          >
            <Wordmark />
          </a>

          <div className="ml-auto flex items-center gap-6">
            <nav
              aria-label="Primary"
              className="hidden md:flex md:items-center md:gap-7"
            >
              <a
                href="#how-it-works"
                className="press label-mono block text-[0.75rem] text-ink/70 hover:text-ink"
              >
                How it works
              </a>
              <a
                href="#voice-notes"
                className="press label-mono block text-[0.75rem] text-ink/70 hover:text-ink"
              >
                Voice notes
              </a>
              <a
                href="#faq"
                className="press label-mono block text-[0.75rem] text-ink/70 hover:text-ink"
              >
                FAQ
              </a>
            </nav>

            <ButtonLink href="#waitlist" className="px-4 py-2.5 sm:px-5 sm:py-3">
              Get early access
            </ButtonLink>

            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
              className="press label-mono grid h-10 w-10 place-items-center border-2 border-ink text-ink md:hidden active:translate-y-px"
            >
              <span aria-hidden="true" className="block">
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="square"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </span>
              menu
            </button>
          </div>
        </Container>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
