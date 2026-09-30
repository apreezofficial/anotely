import { Logo, Wordmark } from "./Logo";
import { WaitlistForm } from "./WaitlistForm";
import { Container } from "./ui";

/**
 * Footer reduced to three parts: the mark, a short link list, and two flat
 * "Coming October 1" badge placeholders. No 4-column symmetric layout, no
 * generic App Store / Play Store graphics — the app is not live yet.
 */
const links = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#voice-notes", label: "Voice notes" },
  { href: "#features", label: "Features" },
  { href: "#faq", label: "FAQ" },
];

function ComingBadge({ platform }: { platform: string }) {
  return (
    <button
      type="button"
      disabled
      title="Not available yet — coming October 1"
      className="flex items-center gap-3 border-2 border-ink bg-paper px-4 py-2.5 text-left opacity-80"
    >
      <Logo className="h-7 w-7 shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="label-mono text-[0.625rem] text-ink/50">
          {platform}
        </span>
        <span className="label-mono text-[0.8125rem] text-ink">
          Coming October 1
        </span>
      </span>
    </button>
  );
}

export function FinalCta() {
  return (
    <section id="waitlist" className="paper-rules bg-highlight text-ink">
      <Container className="py-16 sm:py-20 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <h2 className="font-display text-3xl leading-[1.05] font-semibold tracking-[-0.01em] text-balance sm:text-5xl">
              Get early access.
            </h2>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-ink/75">
              Leave an email and we'll write when there's a build worth trying. Nothing else.
            </p>
          </div>

          <WaitlistForm className="max-w-xl lg:justify-self-end" />
        </div>
      </Container>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="paper-rules border-t-2 border-ink bg-paper">
      <Container className="py-12 sm:py-14">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-xs">
              <Wordmark />
              <p className="mt-4 text-sm leading-relaxed text-ink/60">
                Notes that listen back. Built for people who think out loud.
              </p>
            </div>

            <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="press label-mono block text-[0.75rem] text-ink/70 hover:text-ink"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-3 border-t-2 border-ink pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <ComingBadge platform="macOS" />
              <ComingBadge platform="Windows" />
            </div>

            <p className="label-mono text-[0.6875rem] text-ink/50">
              © 2026 Anotely · desktop first · voice first
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
