import { Folder, Search } from "lucide-react";
import { Container, SectionTag } from "./ui";

const folders = ["inbox/", "work/", "reading/", "home/", "archive/"];

const notes = [
  { name: "rollout slipped a week", meta: "12m · 01:12", tag: "#meeting", hit: true, active: true },
  { name: "staging was down tuesday", meta: "2d · 09:40", tag: "#incident", hit: true },
  { name: "what we said about staging", meta: "2d · 09:12", tag: "#meeting", hit: true },
  { name: "things to ask the vendor", meta: "3d · 17:05", tag: "#follow-up", hit: false },
  { name: "kitchen budget", meta: "last week", tag: "#home", hit: false },
];

export function Organize() {
  return (
    <section id="organize" className="bg-paper">
      <Container className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-2xl">
          <SectionTag>Organising</SectionTag>
          <h2 className="mt-6 font-display text-3xl leading-[1.05] font-semibold tracking-[-0.01em] text-balance sm:text-5xl">
            Filed before you think about it.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink/70">
            Tags, folders and search are all still there. The difference is
            that something puts things in the right place first, and you can
            move them when it's wrong.
          </p>
        </div>

        {/* Mock app panel. Ruled background, monospace file names, flat fills. */}
        <div className="mt-12 border-2 border-ink bg-paper lg:mt-16">
          <div className="flex items-center gap-3 border-b-2 border-ink px-4 py-3">
            <Search className="h-4 w-4 shrink-0 opacity-60" strokeWidth={1.75} aria-hidden="true" />
            <p className="min-w-0 flex-1 truncate font-mono text-[0.8125rem]">
              the staging thing
              <span className="ml-2 text-ink/40">3 by meaning</span>
            </p>
            <span className="label-mono hidden shrink-0 border border-ink/30 px-1.5 py-1 text-[0.625rem] text-ink/50 sm:inline">
              cmd k
            </span>
          </div>

          <div className="flex flex-col sm:flex-row">
            <nav
              aria-label="Example folders"
              className="paper-rules shrink-0 border-b-2 border-ink px-4 py-4 sm:w-52 sm:border-b-0 sm:border-r-2"
            >
              <p className="label-mono text-[0.625rem] text-ink/45">folders</p>
              <ul className="mt-3 space-y-1.5">
                {folders.map((folder, index) => (
                  <li key={folder}>
                    <span
                      className={`flex items-center gap-2 font-mono text-[0.8125rem] ${
                        index === 1 ? "text-ink" : "text-ink/60"
                      }`}
                    >
                      {index === 1 ? (
                        <Folder
                          className="h-3.5 w-3.5 shrink-0"
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                      ) : (
                        <span aria-hidden="true" className="block w-3.5" />
                      )}
                      {folder}
                    </span>
                  </li>
                ))}
              </ul>
            </nav>

            <ul className="min-w-0 flex-1">
              {notes.map((note) => (
                <li
                  key={note.name}
                  className={`flex items-center gap-3 border-b border-ink/15 px-4 py-3 last:border-b-0 ${
                    note.active ? "bg-highlight" : ""
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`h-5 w-0.5 shrink-0 ${
                      note.hit ? "bg-margin" : "bg-transparent"
                    }`}
                  />
                  <span
                    className={`min-w-0 flex-1 truncate font-mono text-[0.8125rem] ${
                      note.hit ? "text-ink" : "text-ink/55"
                    }`}
                  >
                    {note.name}
                  </span>
                  <span className="hidden shrink-0 font-mono text-[0.6875rem] text-ink/40 sm:inline">
                    {note.tag}
                  </span>
                  <span className="shrink-0 font-mono text-[0.6875rem] text-ink/40">
                    {note.meta}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
