# Contributing to Anotely

Thanks for helping out. Anotely is MIT licensed and built in the open — issues, ideas and PRs are
all welcome.

## Repo layout

```
src/        React app UI (the Anotely desktop/mobile client)
src-tauri/  Rust backend: notes store, settings, AI calls, Whisper transcription
web/        Marketing website (Next.js 15)
```

## Getting set up

```bash
# app
npm install
npm run app          # tauri dev

# website
cd web && npm install && npm run dev
```

Toolchain: Node 18+, Rust 1.77+, plus the
[Tauri prerequisites](https://tauri.app/start/prerequisites/) for your platform.

## Before you open a PR

```bash
npm run typecheck                  # app
npm run build                      # app bundle
cd web && npm run typecheck && npm run build
cargo check --manifest-path src-tauri/Cargo.toml
cargo fmt --manifest-path src-tauri/Cargo.toml
```

- Keep TypeScript strict-clean; no `any` unless you explain why.
- Match the existing style: 2-space indent, double quotes, no semicolon surprises (Prettier defaults).
- New UI behaviour should be animated with Framer Motion, consistent with the rest of the app.
- Comments only where the code is not obvious.

## Commit messages

Conventional-ish, imperative, scoped when useful:

```
feat(speech): add wake-word debounce to the dictation engine
fix(store): keep note order stable when pinned
docs(readme): document the local Whisper setup
```

## Adding a new AI provider

1. Add a branch in `complete()` in `src-tauri/src/ai.rs`.
2. Add the entry to `PROVIDERS` in `src/lib/utils.ts` and to the onboarding provider list.
3. Note the required auth header — most providers are OpenAI-compatible and already work through
   the `custom` branch.

## Privacy expectations

Notes and API keys stay on the user's machine. Please do not add telemetry, remote logging of note
content, or any code that sends note text anywhere other than the provider the user configured.

## Reporting bugs

Open an issue with what you did, what happened, and what you expected. Security issues: see
[SECURITY.md](./SECURITY.md).
