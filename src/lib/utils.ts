import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const PUNCTUATION_WORDS: Record<string, string> = {
  comma: ",",
  period: ".",
  "full stop": ".",
  "stop": ".",
  question: "?",
  "question mark": "?",
  exclamation: "!",
  "exclamation mark": "!",
  semicolon: ";",
  colon: ":",
  dash: " — ",
  hyphen: "-",
  apostrophe: "'",
  "new line": "\n",
  "new paragraph": "\n\n",
  paragraph: "\n\n",
  "line break": "\n",
};

const CONTRACTIONS: Record<string, string> = {
  "i am": "I'm",
  "i have": "I've",
  "i will": "I'll",
  "i would": "I'd",
  "do not": "don't",
  "does not": "doesn't",
  "did not": "didn't",
  "is not": "isn't",
  "are not": "aren't",
  "was not": "wasn't",
  "were not": "weren't",
  "cannot": "can't",
  "can not": "can't",
  "will not": "won't",
  "would not": "wouldn't",
  "should not": "shouldn't",
  "could not": "couldn't",
  "it is": "it's",
  "that is": "that's",
  "there is": "there's",
  "they are": "they're",
  "we are": "we're",
  "you are": "you're",
  "let us": "let's",
  "i've got": "I've got",
};

const FILLERS = [
  "um",
  "uh",
  "erm",
  "hmm",
  "you know",
  "i mean",
  "like i was saying",
  "sort of",
  "kind of",
  "basically",
  "actually",
];

const SMALL_NUMBERS: Record<string, string> = {
  zero: "0",
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
  ten: "10",
  eleven: "11",
  twelve: "12",
  thirteen: "13",
  fourteen: "14",
  fifteen: "15",
  sixteen: "16",
  seventeen: "17",
  eighteen: "18",
  nineteen: "19",
  twenty: "20",
  thirty: "30",
  forty: "40",
  fifty: "50",
  sixty: "60",
  seventy: "70",
  eighty: "80",
  ninety: "90",
  hundred: "100",
  thousand: "1000",
  first: "1st",
  second: "2nd",
  third: "3rd",
};

/**
 * Turns a raw speech transcript into prose: spoken punctuation, contractions,
 * capitalisation and paragraph breaks.
 */
export function applyVoicePunctuation(raw: string): string {
  if (!raw.trim()) return "";
  let text = ` ${raw.trim()} `;

  for (const filler of FILLERS) {
    text = text.replace(new RegExp(`(^|\\s)${escapeRe(filler)}(\\s|$)`, "gi"), "$1$2");
  }

  for (const [word, symbol] of Object.entries(PUNCTUATION_WORDS)) {
    text = text.replace(
      new RegExp(`(^|\\s)${escapeRe(word)}(\\s|$)`, "gi"),
      (_m, pre: string, post: string) => {
        if (symbol.startsWith("\n")) return `\n${post === " " ? "" : post}`;
        return `${pre}${pre ? " " : ""}${symbol}${post === " " ? " " : post}`;
      },
    );
  }

  text = text.replace(/\s+([,.!?;:])/g, "$1");
  text = text.replace(/([,.!?;:])(?=[A-Za-z])/g, "$1 ");

  for (const [word, replacement] of Object.entries(CONTRACTIONS)) {
    text = text.replace(
      new RegExp(`(^|[^a-z'])${escapeRe(word)}(?![a-z'])`, "gi"),
      (_m, pre: string) => `${pre}${matchCase(word, replacement)}`,
    );
  }

  for (const [word, digits] of Object.entries(SMALL_NUMBERS)) {
    text = text.replace(
      new RegExp(`(^|\\s)${escapeRe(word)}(?=\\s|$)`, "gi"),
      `$1${digits}`,
    );
  }

  return capitalise(text);
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchCase(source: string, replacement: string) {
  if (source[0] === source[0]?.toUpperCase() && /[A-Z]/.test(source[0] ?? "")) {
    return replacement[0].toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

export function capitalise(text: string): string {
  const cleaned = text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n");
  let out = "";
  let capitaliseNext = true;
  for (const ch of cleaned) {
    if (capitaliseNext && /[a-z]/.test(ch)) {
      out += ch.toUpperCase();
      capitaliseNext = false;
    } else {
      out += ch;
      if (/[.!?:;]/.test(ch)) capitaliseNext = true;
      if (ch === "\n") capitaliseNext = true;
    }
  }
  return out.trim();
}

/** Removes a trailing trigger phrase such as "anotely done" from a transcript. */
export function stripTrigger(text: string, phrase: string): { text: string; triggered: boolean } {
  if (!phrase.trim()) return { text, triggered: false };
  const escaped = escapeRe(phrase.trim());
  const re = new RegExp(`[\\s,.;:]*(?:\\b${escaped}\\b)[\\s,.;:!]*$`, "i");
  if (re.test(text)) {
    return { text: text.replace(re, "").trimEnd(), triggered: true };
  }
  const loose = new RegExp(`\\b${phrase.trim().split(/\s+/).join("[\\s,]+")}\\b`, "i");
  if (loose.test(text)) {
    return { text: text.replace(loose, "").trimEnd(), triggered: true };
  }
  return { text, triggered: false };
}

export function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.round(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hours = Math.round(min / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function groupNotes(notes: { updatedAt: number }[]) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const groups: Record<string, typeof notes> = {
    Today: [],
    Yesterday: [],
    "Previous 7 days": [],
    "Previous 30 days": [],
    Older: [],
  };
  for (const note of notes) {
    const day = 86400000;
    if (note.updatedAt >= startOfToday) groups["Today"].push(note);
    else if (note.updatedAt >= startOfToday - day) groups["Yesterday"].push(note);
    else if (note.updatedAt >= startOfToday - day * 7) groups["Previous 7 days"].push(note);
    else if (note.updatedAt >= startOfToday - day * 30) groups["Previous 30 days"].push(note);
    else groups["Older"].push(note);
  }
  return groups;
}

export function snippet(text: string, length = 110): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > length ? `${clean.slice(0, length)}…` : clean;
}

export function readTime(words: number): string {
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

export const ACCENTS: Record<string, { from: string; to: string; ring: string; text: string }> = {
  violet: { from: "#8b5cf6", to: "#d946ef", ring: "rgba(139,92,246,.45)", text: "#c4b5fd" },
  cyan: { from: "#06b6d4", to: "#3b82f6", ring: "rgba(6,182,212,.45)", text: "#67e8f9" },
  lime: { from: "#84cc16", to: "#22c55e", ring: "rgba(132,204,22,.45)", text: "#bef264" },
  amber: { from: "#f59e0b", to: "#f97316", ring: "rgba(245,158,11,.45)", text: "#fcd34d" },
  rose: { from: "#f43f5e", to: "#fb7185", ring: "rgba(244,63,94,.45)", text: "#fda4af" },
};

export const NOTE_COLORS = [
  { key: "violet", bg: "rgba(139,92,246,.16)", dot: "#8b5cf6" },
  { key: "cyan", bg: "rgba(6,182,212,.16)", dot: "#22d3ee" },
  { key: "lime", bg: "rgba(132,204,22,.16)", dot: "#a3e635" },
  { key: "amber", bg: "rgba(245,158,11,.16)", dot: "#fbbf24" },
  { key: "rose", bg: "rgba(244,63,94,.16)", dot: "#fb7185" },
];

export const PROVIDERS = [
  { key: "anthropic", label: "Anthropic (Claude)", models: ["claude-sonnet-4-5", "claude-opus-4-1", "claude-haiku-4-5"], placeholder: "sk-ant-…" },
  { key: "openai", label: "OpenAI", models: ["gpt-4o", "gpt-4o-mini", "gpt-4.1", "gpt-4.1-mini"], placeholder: "sk-…" },
  { key: "gemini", label: "Google Gemini", models: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.0-flash"], placeholder: "AIza…" },
  { key: "groq", label: "Groq (fast + free tier)", models: ["llama-3.3-70b-versatile", "openai/gpt-oss-120b"], placeholder: "gsk_…" },
  { key: "openrouter", label: "OpenRouter", models: ["anthropic/claude-sonnet-4.5", "openai/gpt-4o", "google/gemini-2.5-flash"], placeholder: "sk-or-…" },
  { key: "ollama", label: "Ollama (local, offline)", models: ["llama3.2", "qwen2.5", "mistral"], placeholder: "" },
  { key: "custom", label: "Custom OpenAI-compatible", models: [""], placeholder: "sk-…" },
];

export const STT_PROVIDERS = [
  { key: "web", label: "Browser / WebView speech (free)", hint: "Uses the built-in engine. No key needed. Best on Chrome/Edge." },
  { key: "groq", label: "Groq Whisper (fast, cheap)", hint: "Cloud transcription. Very accurate, near-instant." },
  { key: "openai", label: "OpenAI Whisper", hint: "whisper-1 or gpt-4o-mini-transcribe." },
  { key: "custom", label: "Local Whisper server", hint: "faster-whisper, whisper.cpp, or any OpenAI-compatible endpoint." },
];
