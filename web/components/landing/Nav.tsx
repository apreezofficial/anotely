import { Wordmark } from "./Logo";
import { ButtonLink, Container } from "./ui";

const links = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#faq", label: "FAQ" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-ink/15 bg-paper">
      <Container className="flex h-16 items-center justify-between gap-4 sm:h-18">
        <a
          href="#top"
          className="press -translate-y-px rounded-none text-ink hover:text-ink/70"
        >
          <Wordmark />
        </a>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-8">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="press label-mono block py-1 text-[0.75rem] text-ink/70 hover:text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <ButtonLink href="#waitlist" className="px-4 py-2.5 sm:px-5 sm:py-3">
          Get early access
        </ButtonLink>
      </Container>
    </header>
  );
}
