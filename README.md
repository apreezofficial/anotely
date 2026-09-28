# Anotely

[![License: MIT](https://img.shields.io/badge/License-MIT-accent.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

Voice-first notes. **Talk, and Anotely writes it down.** The moment you say
the done-phrase, an AI proofreads the whole note and shows you every change before it applies.

- **App**: Tauri 2 + React 18 + TypeScript + Vite + Tailwind + Framer Motion → `src/`, `src-tauri/`
- **Website**: Next.js 15 (App Router) + Tailwind v4 + Framer Motion → `web/`

## Website

```bash
cd web
npm install
npm run dev      # http://localhost:3001
npm run build    # static export in .next/
```

---

## App

Voice-first notes for Windows/macOS/Linux. Built with **Tauri 2 + React 18 + TypeScript + Vite + Tailwind + Framer Motion**.

---

## What it does

### Auto Write (speech → text)
Two interchangeable engines, picked automatically:

| Engine | When | Notes |
| --- | --- | --- |
| **Built-in Web Speech** | Chromium exposes `SpeechRecognition` | Free, no key, works offline-ish. |
| **Whisper** (Groq / OpenAI / local server) | Everything else | `MediaRecorder` + silence detection: each sentence is cut, sent, and committed on its own, so the text lands while you are still talking. |

**Smart punctuation** turns the way you actually speak into real prose:
- "new paragraph" / "new line" → real breaks
- "comma", "period", "question mark" → real punctuation
- "i am going to" → "I'm going to"
- "um / uh / you know / basically" → removed
- "twenty six" → "26", plus automatic capitalisation and full stops

**Voice commands**

| Say | Get |
| --- | --- |
| `new paragraph` | new paragraph |
| `period` `comma` `question mark` | punctuation |
| `anotely done` (configurable) | stop listening → **AI proofread** |

### AI proofread
Ask for a JSON verdict; Anotely renders it as a scored review card:
- quality score ring (0–100)
- every edit as `original → replacement` with the reason
- corrected text with the edits highlighted
- **Apply** / **Keep mine** / copy
- if the model returns prose instead of JSON, a Rust-side word-level diff generates the change list anyway, so the panel is never empty

### AI assistant
A side panel that reads the open note: summarise, action items, tighten, explain, brainstorm,
continue writing — with one click to insert any answer back into the note.

### The rest
- pin, star, colour, tag, archive, trash + restore, full-text search
- markdown preview, live word count, read time
- animated everything: gradient mesh backdrop, spring sidebar, layout-animated lists, level-reactive
  mic orb, `Ctrl+K` command palette, toast notifications
- light/dark, 5 accent colours, editor font size, reduced motion
- notes and keys stored as plain JSON in your app data folder — nothing leaves the machine except
  calls to the AI provider you chose

---

## Run it

```bash
npm install
npm run app          # tauri dev  (opens the desktop window)
npm run app:build    # production installer
```

UI only, in a browser (AI/STT commands are stubbed):

```bash
npm run dev
```

Prereqs: Node 18+, Rust 1.77+, and the Tauri system dependencies (WebView2 on Windows is
preinstalled on Win10/11; on Linux install `libwebkit2gtk-4.1-dev` etc.).

---

## Keys

| Shortcut | Action |
| --- | --- |
| `Ctrl` + `Shift` + `Space` | start / stop Auto Write |
| `Ctrl` + `Shift` + `P` | proofread the open note |
| `Ctrl` + `K` | command palette |
| `Ctrl` + `N` | new note |
| `Esc` | close panel / palette |

---

## Setup inside the app

**Settings → AI model**
| Provider | Needs | Notes |
| --- | --- | --- |
| Anthropic | `sk-ant-…` | default model `claude-sonnet-4-5` |
| OpenAI | `sk-…` | |
| Google Gemini | `AIza…` | |
| Groq | `gsk_…` | fast + free tier |
| OpenRouter | `sk-or-…` | |
| Ollama | nothing | fully local, `http://localhost:11434` |
| Custom | `sk-…` | any OpenAI-compatible `/chat/completions` |

Hit **Test connection** to verify before you start dictating.

**Settings → Auto Write**
- `Built-in` — no key, free.
- `Groq Whisper` — paste a `gsk_…` (falls back to your AI key if blank). Best free accuracy.
- `OpenAI Whisper` — `sk-…`, model `whisper-1` or `gpt-4o-mini-transcribe`.
- `Local` — faster-whisper / whisper.cpp / any OpenAI-compatible endpoint.

Windows WebView2 has no built-in speech engine, so use Groq's free tier (or a local Whisper server)
there. The app tells you this if you leave it on "built-in".

---

## Where files live

```
src/                    React UI
  lib/speech.ts         dictation engine (web speech + whisper recorder)
  lib/utils.ts          voice punctuation, triggers, theming
  lib/markdown.ts       dependency-free preview renderer
  hooks/useDictation.ts wiring between engine, editor caret and AI proofread
  components/           sidebar, editor, mic orb, panels, settings, onboarding, preloader
src-tauri/src/
  ai.rs                 multi-provider completions, proofread prompt, word-level diff
  stt.rs                Whisper transcription
  store.rs              notes.json CRUD
  config.rs             settings.json
```

Notes: `%APPDATA%\com.anotely.app\notes.json`
Settings + keys: `%APPDATA%\com.anotely.app\settings.json`

---

## Contributing

Issues and PRs are welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md) for the workflow, checks and
commit conventions, and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) for community expectations.
Security reports go through [SECURITY.md](./SECURITY.md), not the issue tracker.

## License

[MIT](./LICENSE) © Anotely contributors. Notes, keys and local data never leave your machine except
for calls to the AI provider you configure.

