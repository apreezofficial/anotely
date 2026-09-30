import { Container, SectionTag } from "./ui";
import { landingIcons } from "./icons";

/**
 * Sticky-note feature cards. Flat fill, 1.5px ink border, alternating slight
 * rotation. No rounded corners as default shape, no shadow, no icon-in-a-circle.
 * The icons are original ink line-art, not stock lucide glyphs.
 */
const features = [
  {
    icon: landingIcons.Summarise,
    title: "Summarise",
    body: "Long note, short version. Ask for a summary and it sits above what you wrote, never over it.",
    example: "summarise this note",
    surface: "bg-highlight text-ink",
    tilt: "note-tilt-a",
  },
  {
    icon: landingIcons["Auto-title"],
    title: "Auto-title",
    body: "Notes are named the moment they are created. No more untitled-4 hunting for the thing you wrote.",
    example: "title · rollout slipped a week",
    surface: "bg-paper text-ink",
    tilt: "note-tilt-b",
  },
  {
    icon: landingIcons["Action items"],
    title: "Action items",
    body: "Everything you said you'd do, pulled into a checklist. Tick them off or ignore it. Your call.",
    example: "[ ] send the vendor the invoice",
    surface: "bg-paper text-ink",
    tilt: "note-tilt-c",
  },
  {
    icon: landingIcons["Semantic search"],
    title: "Semantic search",
    body: "Search by meaning, not keywords. Describe the note and it finds the one you meant.",
    example: '"the staging thing" ? 3 notes',
    surface: "bg-ink text-paper",
    tilt: "note-tilt-d",
  },
];

export function AiFeatures() {
  return (
    <section id="features" className="bg-paper-2">
      <Container className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-2xl">
          <SectionTag>What the AI does</SectionTag>
          <h2 className="mt-6 font-display text-3xl leading-[1.05] font-semibold tracking-[-0.01em] text-balance sm:text-5xl">
            AI that helps, not replaces.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink/70">
            Every feature here produces a suggestion you accept or ignore.
            Nothing rewrites a note you wrote without you asking.
          </p>
        </div>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <li
                key={feature.title}
                className={`${feature.surface} ${feature.tilt} flex flex-col border-2 border-ink p-6 sm:mt-0 lg:[&:nth-child(2)]:mt-7 lg:[&:nth-child(4)]:mt-7`}
              >
                <Icon className="text-ink" />
                <h3 className="mt-5 font-display text-xl leading-snug font-semibold">
                  {feature.title}
                </h3>
                <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed opacity-80">
                  {feature.body}
                </p>
                <p className="mt-6 border-t border-current/25 pt-3 font-mono text-[0.6875rem] leading-relaxed opacity-70">
                  {feature.example}
                </p>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
