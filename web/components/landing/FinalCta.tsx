import { Logo, Wordmark } from "./Logo";
import { WaitlistForm } from "./WaitlistForm";
import { Container } from "./ui";

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
              Leave an email and we&rsquo;ll write when there&rsquo;s a build
              worth trying. Nothing else.
            </p>
          </div>

          <WaitlistForm className="max-w-xl lg:justify-self-end" />
        </div>
      </Container>
    </section>
  );
}

const footerLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#voice-notes", label: "Voice notes" },
  { href: "#faq", label: "FAQ" },
];

export function Footer() {
  return (
    <footer className="paper-rules border-t-2 border-ink bg-paper">
      <Container className="py-12 sm:py-14">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Wordmark />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink/60">
              Notes that listen back. Built for people who think out loud.
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-10 gap-y-3 sm:grid-cols-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="press label-mono block text-[0.75rem] text-ink/70 hover:text-ink"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-ink/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="label-mono text-[0.6875rem] text-ink/50">
            © 2026 Anotely
          </p>
          <p className="label-mono flex items-center gap-2 text-[0.6875rem] text-ink/50">
            <Logo className="h-4 w-4" />
            desktop first · voice first
          </p>
        </div>
      </Container>
    </footer>
  );
}
