import { TornEdge } from "./TornEdge";
import { Waveform } from "./Waveform";
import { Container, SectionTag, Tag } from "./ui";

type Part = { text: string; mark?: boolean; tag?: string };

const transcript: { time: string; parts: Part[] }[] = [
  {
    time: "00:38",
    parts: [
      { text: "Okay, short version — we pushed the " },
      { text: "migration", mark: true },
      { text: " back a week, mostly because staging was down all Tuesday. " },
      { text: "Priya's going to own the rollout.", mark: true },
    ],
  },
  {
    time: "00:44",
    parts: [
      { text: "Also, I need to " },
      {
        text: "send the vendor the updated invoice number",
        mark: true,
        tag: "action",
      },
      { text: " before Friday." },
    ],
  },
];

export function VoiceNotes() {
  return (
    <section id="voice-notes" className="paper-rules bg-paper">
      <Container className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-2xl">
          <SectionTag>Voice notes</SectionTag>
          <h2 className="mt-6 font-display text-3xl leading-[1.05] font-semibold tracking-[-0.01em] text-balance sm:text-5xl">
            Say it once. It&rsquo;s written.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink/70">
            Hold a key and talk. Anotely records, transcribes, and fixes the
            punctuation while you keep going. You get a clean note, not a
            transcript you have to tidy.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-2 lg:gap-12">
          {/* Waveform, with the bars Anotely picked out. */}
          <div className="border-2 border-ink bg-paper">
            <div className="flex items-center justify-between gap-4 border-b-2 border-ink px-4 py-3">
              <span className="label-mono flex items-center gap-2 text-[0.6875rem]">
                <span aria-hidden="true" className="block h-2 w-2 bg-margin" />
                Rec 01:12
              </span>
              <span className="label-mono text-[0.6875rem] text-ink/45">
                listening
              </span>
            </div>

            <div className="px-4 py-6">
              <Waveform
                bars={56}
                seed={23}
                height={104}
                highlight={[19, 20, 21, 22, 23, 24, 25, 38]}
              />
            </div>

            <div className="flex items-center gap-2 border-t-2 border-ink px-4 py-3">
              <span
                aria-hidden="true"
                className="block h-3 w-3 bg-highlight"
              />
              <p className="label-mono text-[0.6875rem] text-ink/60">
                highlighted = flagged by ai
              </p>
            </div>
          </div>

          {/* The note it produced. */}
          <div className="border-l-2 border-margin pl-5 sm:pl-7">
            <div className="border-2 border-ink bg-paper">
              <div className="flex items-center justify-between border-b-2 border-ink px-4 py-3">
                <p className="label-mono text-[0.6875rem] text-ink/45">
                  transcribe · 2 paragraphs
                </p>
                <Tag tone="margin">edited</Tag>
              </div>

              <div className="px-4 py-5 sm:px-6 sm:py-6">
                {transcript.map((line) => (
                  <p
                    key={line.time}
                    className="flex gap-3 font-mono text-[0.8125rem] leading-relaxed sm:text-sm"
                  >
                    <span className="shrink-0 text-ink/35">[{line.time}]</span>
                    <span className="text-ink">
                      {line.parts.map((part, index) => (
                        <span key={index}>
                          {part.mark ? (
                            <span className="marked">{part.text}</span>
                          ) : (
                            part.text
                          )}
                          {part.tag ? (
                            <span className="label-mono ml-2 inline-block border border-margin px-1.5 py-0.5 align-middle text-[0.5625rem] text-margin">
                              {part.tag}
                            </span>
                          ) : null}
                        </span>
                      ))}
                    </span>
                  </p>
                ))}
              </div>

              <div className="border-t-2 border-ink px-4 py-3 sm:px-6">
                <p className="label-mono text-[0.6875rem] text-ink/45">
                  title · rollout slipped a week
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>

      <TornEdge fill="var(--color-paper-2)" />
    </section>
  );
}
