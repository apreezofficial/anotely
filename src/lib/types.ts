export type Folder = "notes" | "archive" | "trash";

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  folder: Folder;
  pinned: boolean;
  starred: boolean;
  color: string | null;
  createdAt: number;
  updatedAt: number;
  lastProofreadAt: number | null;
  wordCount: number;
  charCount: number;
}

export interface Settings {
  onboarded: boolean;
  provider: string;
  apiKey: string;
  model: string;
  baseUrl: string;
  temperature: number;
  maxTokens: number;
  autoProofread: boolean;
  donePhrase: string;
  proofTone: string;
  fixGrammar: boolean;
  fixPunctuation: boolean;
  removeFiller: boolean;
  suggestStyle: boolean;
  proofreadLang: string;
  sttProvider: string;
  sttApiKey: string;
  sttModel: string;
  sttBaseUrl: string;
  sttLanguage: string;
  sttPunctuation: boolean;
  sttSilenceMs: number;
  theme: string;
  accent: string;
  fontSize: number;
  compactList: boolean;
  reduceMotion: boolean;
  sidebarWidth: number;
}

export interface Change {
  original: string;
  replacement: string;
  kind: string;
  reason: string;
}

export interface ProofreadResult {
  corrected: string;
  summary: string;
  score: number;
  changes: Change[];
}

export type DictationState =
  | "idle"
  | "starting"
  | "listening"
  | "transcribing"
  | "proofreading";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
