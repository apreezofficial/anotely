import { Plus } from "./icons";
import { Container, SectionTag } from "./ui";

const faqs = [
  {
    question: "What happens to my voice recordings?",
    answer:
      "We're still finalising the details and we won't ship without writing them down. Before launch there will be a plain-English privacy policy covering what leaves your device, what gets stored, and for how long — plus a way to delete a note and its recording from inside the app.",
  },
  {
    question: "Does it work offline?",
    answer:
      "Writing, tagging and organising work without a connection. Transcription and the AI features need one right now. Running transcription on-device is on the list.",
  },
  {
    question: "Which platforms?",
    answer:
      "macOS and Windows first, then iOS and Android. It runs as a desktop app so it can reach your microphone properly instead of going through a browser tab.",
  },
  {
    question: "Do I need an account?",
    answer:
      "Early access is a single account with no workspace to set up. If anything paid is added later, it will be obvious and it will stay optional.",
  },
  {
    question: "Will AI rewrite my notes without asking?",
    answer:
      "No. Every AI feature is something you trigger yourself. It produces a suggestion, and nothing in your note changes until you accept it.",
  },
  {
    question: "Can I bring my existing notes across?",
    answer:
      "Plain text and Markdown files can be dropped straight in. If you have something more awkward to migrate, tell us on the waitlist — the list of formats people actually need is still short.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="bg-paper-2">
      <Container className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-2xl">
          <SectionTag>Questions</SectionTag>
          <h2 className="mt-6 font-display text-3xl leading-[1.05] font-semibold tracking-[-0.01em] text-balance sm:text-5xl">
            The things people ask first.
          </h2>
        </div>

        <div className="mt-12 max-w-3xl border-t-2 border-ink lg:mt-16">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group border-b-2 border-ink [&[open]_svg]:rotate-45"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-display text-lg leading-snug font-semibold marker:content-none [&::-webkit-details-marker]:hidden sm:text-xl">
                {faq.question}
                <Plus
                  className="h-5 w-5 shrink-0 transition-transform duration-150"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              </summary>
              <p className="max-w-2xl pb-6 text-[0.9375rem] leading-relaxed text-ink/70">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
