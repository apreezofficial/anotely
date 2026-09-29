import { TornEdge } from "./TornEdge";
import { Container, SectionTag } from "./ui";

const steps = [
  {
    number: "01",
    title: "Speak or type",
    body: "Open a note and start talking. Switch to typing whenever typing is the faster way to say it.",
  },
  {
    number: "02",
    title: "It transcribes and organises",
    body: "Speech becomes text. The note gets a title, some tags, and a list of anything you said you'd do.",
  },
  {
    number: "03",
    title: "Search and recall",
    body: "Ask in your own words. Find the note by what it was about, not the one word you happen to remember.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="on-ink ink-rules bg-ink text-paper">
      <Container className="py-16 sm:py-20 lg:py-24">
        <SectionTag tone="onInk">How it works</SectionTag>

        <h2 className="mt-6 max-w-2xl font-display text-3xl leading-[1.05] font-semibold tracking-[-0.01em] text-balance sm:text-5xl">
          From your mouth to your notes, in three steps.
        </h2>

        <ol className="mt-12 grid gap-px border-t border-paper/20 md:grid-cols-3">
          {steps.map((step) => (
            <li
              key={step.number}
              className="border-b border-paper/20 py-8 md:border-b-0 md:border-r md:pr-8 md:last:border-r-0"
            >
              <span className="font-mono text-4xl leading-none text-highlight">
                {step.number}
              </span>
              <h3 className="mt-5 font-display text-xl leading-snug font-semibold sm:text-2xl">
                {step.title}
              </h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-paper/70">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </Container>

      {/* The ink block is torn away, handing the page back to paper. */}
      <TornEdge fill="var(--color-paper)" />
    </section>
  );
}
