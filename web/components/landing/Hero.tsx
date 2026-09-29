import type { CSSProperties } from "react";
import { TornEdge } from "./TornEdge";
import { Waveform } from "./Waveform";
import { ButtonLink, Container, Tag } from "./ui";

/* The two lines of the note being dictated in the hero mock. Kept short so
   each one stays on a single line down to 360px, and so the step count of the
   typewriter animation matches the string exactly. */
const LINE_ONE = "…Priya owns the rollout.";
const LINE_TWO = "We ship Friday, not Monday.";

export function Hero() {
  return (
    <section id="top" className="dot-grid bg-paper">
      <Container className="pb-16 pt-14 sm:pb-20 sm:pt-20 lg:pt-24">
        <div className="max-w-2xl">
          <Tag tone="highlight">Early access</Tag>

          <h1 className="mt-6 font-display text-[2.75rem] leading-[0.95] font-semibold tracking-[-0.02em] text-balance sm:text-6xl lg:text-[5.25rem]">
            Take notes <span className="marked">out loud</span>.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/70 sm:text-xl">
            Talk or type. Anotely writes it down, names it, files it, and finds
            it again when you need it.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href="#waitlist">Get early access</ButtonLink>
            <ButtonLink href="#how-it-works" variant="outline">
              See how it works
            </ButtonLink>
          </div>
        </div>

        {/* The note being written, mid-thought. */}
        <div className="mt-12 max-w-4xl border-2 border-ink bg-paper sm:mt-16">
          <div className="flex items-center justify-between gap-4 border-b-2 border-ink px-4 py-3 sm:px-6">
            <span className="label-mono flex items-center gap-2 text-[0.6875rem] text-ink">
              <span
                aria-hidden="true"
                className="block h-2 w-2 bg-margin"
              />
              Rec 00:42
            </span>
            <span className="label-mono text-[0.6875rem] text-ink/45">
              voice · untitled
            </span>
          </div>

          <div className="px-4 pt-6 pb-5 sm:px-6 sm:pb-6">
            <Waveform bars={72} seed={11} height={72} className="sm:h-24" />

            <p className="mt-5 font-mono text-[0.8125rem] leading-relaxed text-ink sm:text-sm">
              <span
                className="type-line"
                data-caret="off"
                style={
                  {
                    "--typing-steps": LINE_ONE.length,
                    "--typing-duration": "1100ms",
                  } as CSSProperties
                }
              >
                <span>{LINE_ONE}</span>
              </span>
              <br />
              <span
                className="type-line"
                style={
                  {
                    "--typing-steps": LINE_TWO.length,
                    "--typing-duration": "1300ms",
                    "--typing-delay": "1250ms",
                  } as CSSProperties
                }
              >
                <span>{LINE_TWO}</span>
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t-2 border-ink px-4 py-3 sm:px-6">
            <Tag>#meeting</Tag>
            <Tag>#action-item</Tag>
            <Tag tone="margin" className="ml-auto">
              filed by ai
            </Tag>
          </div>
        </div>
      </Container>

      {/* Paper torn away to reveal the ink section below. */}
      <TornEdge fill="var(--color-ink)" />
    </section>
  );
}
