import { create } from "zustand";
import { invoke } from "@/lib/ipc";
import type {
  ChatMessage,
  DictationState,
  Note,
  ProofreadResult,
  Settings,
} from "@/lib/types";
import { uid } from "@/lib/utils";

export const DEFAULT_SETTINGS: Settings = {
  onboarded: false,
  provider: "anthropic",
  apiKey: "",
  model: "claude-sonnet-4-5",
  baseUrl: "",
  temperature: 0.3,
  maxTokens: 4096,
  autoProofread: true,
  donePhrase: "anotely done",
  proofTone: "clear",
  fixGrammar: true,
  fixPunctuation: true,
  removeFiller: true,
  suggestStyle: false,
  proofreadLang: "en",
  sttProvider: "web",
  sttApiKey: "",
  sttModel: "whisper-large-v3-turbo",
  sttBaseUrl: "",
  sttLanguage: "en",
  sttPunctuation: true,
  sttSilenceMs: 900,
  theme: "dark",
  accent: "violet",
  fontSize: 16,
  compactList: false,
  reduceMotion: false,
  sidebarWidth: 288,
};

export type View = "notes" | "search" | "trash" | "settings";
export type Panel = "none" | "assistant" | "proofread";

export interface Toast {
  id: string;
  message: string;
  tone: "info" | "success" | "error";
  action?: { label: string; run: () => void };
}

interface AppState {
  ready: boolean;
  notes: Note[];
  activeId: string | null;
  view: View;
  query: string;
  settings: Settings;
  toasts: Toast[];
  panel: Panel;
  navOpen: boolean;

  dictation: { state: DictationState; level: number; engine: "web" | "cloud"; interim: string };
  proof: {
    running: boolean;
    result: ProofreadResult | null;
    before: string | null;
    rejectAll: (() => void) | null;
  };
  chat: ChatMessage[];
  chatBusy: boolean;

  init: () => Promise<void>;
  createNote: (partial?: Partial<Note>) => Promise<Note>;
  patchNote: (id: string, patch: Partial<Note>, opts?: { save?: boolean }) => void;
  saveNote: (id: string) => Promise<void>;
  trashNote: (id: string) => Promise<void>;
  restoreNote: (id: string) => Promise<void>;
  purgeNote: (id: string) => Promise<void>;
  emptyTrash: () => Promise<void>;
  select: (id: string | null) => void;
  setView: (view: View) => void;
  setQuery: (q: string) => void;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
  toast: (message: string, tone?: Toast["tone"], action?: Toast["action"]) => void;
  dismissToast: (id: string) => void;
  setPanel: (panel: Panel) => void;
  setNavOpen: (open: boolean) => void;
  setDictation: (patch: Partial<AppState["dictation"]>) => void;
  startProof: (before: string) => Promise<void>;
  setProof: (patch: Partial<AppState["proof"]>) => void;
  pushChat: (message: ChatMessage) => void;
  setChatBusy: (busy: boolean) => void;
}

let saveTimer: number | undefined;
const pendingSaves = new Map<string, number>();

function sortNotes(notes: Note[]) {
  return [...notes].sort(
    (a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt,
  );
}

export const useStore = create<AppState>((set, get) => ({
  ready: false,
  notes: [],
  activeId: null,
  view: "notes",
  query: "",
  settings: DEFAULT_SETTINGS,
  toasts: [],
  panel: "none",
  navOpen: false,
  dictation: { state: "idle", level: 0, engine: "web", interim: "" },
  proof: { running: false, result: null, before: null, rejectAll: null },
  chat: [],
  chatBusy: false,

  async init() {
    try {
      const [notes, settings] = await Promise.all([
        invoke<Note[]>("list_notes"),
        invoke<Partial<Settings>>("load_settings").catch(() => ({})),
      ]);
      const merged = { ...DEFAULT_SETTINGS, ...settings };
      set({ notes: sortNotes(notes ?? []), settings: merged, ready: true });
    } catch {
      set({ ready: true });
    }
  },

  async createNote(partial = {}) {
    const now = Date.now();
    const note: Note = {
      id: uid(),
      title: "",
      content: "",
      tags: [],
      folder: "notes",
      pinned: false,
      starred: false,
      color: null,
      createdAt: now,
      updatedAt: now,
      lastProofreadAt: null,
      wordCount: 0,
      charCount: 0,
      ...partial,
    };
    set((s) => ({ notes: sortNotes([note, ...s.notes]), activeId: note.id, view: "notes" }));
    await invoke("upsert_note", { note }).catch(() => undefined);
    return note;
  },

  patchNote(id, patch, opts = { save: true }) {
    set((s) => ({
      notes: sortNotes(
        s.notes.map((n) =>
          n.id === id
            ? {
                ...n,
                ...patch,
                updatedAt: Date.now(),
                wordCount: (patch.content ?? n.content).split(/\s+/).filter(Boolean).length,
                charCount: (patch.content ?? n.content).length,
              }
            : n,
        ),
      ),
    }));
    if (!opts.save) return;
    window.clearTimeout(pendingSaves.get(id));
    const timer = window.setTimeout(() => {
      pendingSaves.delete(id);
      void get().saveNote(id);
    }, 550);
    pendingSaves.set(id, timer);
  },

  async saveNote(id) {
    const note = get().notes.find((n) => n.id === id);
    if (!note) return;
    try {
      await invoke("upsert_note", { note });
    } catch (error) {
      get().toast(`Could not save: ${String(error)}`, "error");
    }
  },

  async trashNote(id) {
    const backup = get().notes.find((n) => n.id === id);
    const next = await invoke<Note[]>("delete_note", { id }).catch(() => null);
    set((s) => ({
      notes: next ? sortNotes(next) : s.notes,
      activeId: s.activeId === id ? null : s.activeId,
    }));
    if (backup) {
      get().toast("Note moved to trash", "info", {
        label: "Undo",
        run: () => void get().restoreNote(id),
      });
    }
  },

  async restoreNote(id) {
    const next = await invoke<Note[]>("restore_note", { id }).catch(() => null);
    set((s) => ({ notes: next ? sortNotes(next) : s.notes }));
    get().toast("Note restored", "success");
  },

  async purgeNote(id) {
    const next = await invoke<Note[]>("purge_note", { id }).catch(() => null);
    set((s) => ({
      notes: next ? sortNotes(next) : s.notes,
      activeId: s.activeId === id ? null : s.activeId,
    }));
  },

  async emptyTrash() {
    const next = await invoke<Note[]>("empty_trash").catch(() => null);
    set((s) => ({ notes: next ? sortNotes(next) : s.notes }));
    get().toast("Trash emptied", "success");
  },

  select(id) {
    set({ activeId: id, navOpen: false });
  },

  setView(view) {
    set({ view, navOpen: false, query: view === "search" ? get().query : "" });
  },

  setQuery(query) {
    set({ query, view: query.trim() ? "search" : get().view });
  },

  async updateSettings(patch) {
    const settings = { ...get().settings, ...patch };
    set({ settings });
    await invoke("save_settings", { settings }).catch((error) => {
      get().toast(`Settings not saved: ${String(error)}`, "error");
    });
  },

  toast(message, tone = "info", action) {
    const id = uid();
    set((s) => ({ toasts: [...s.toasts, { id, message, tone, action }] }));
    window.setTimeout(() => get().dismissToast(id), 4200);
  },

  dismissToast(id) {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },

  setPanel(panel) {
    set({ panel });
  },

  setNavOpen(navOpen) {
    set({ navOpen });
  },

  setDictation(patch) {
    set((s) => ({ dictation: { ...s.dictation, ...patch } }));
  },

  async startProof(before) {
    const { settings } = get();
    if (!settings.apiKey.trim() && settings.provider !== "ollama") {
      get().toast("Add an AI key in Settings to enable proofreading", "error");
      get().setView("settings");
      return;
    }
    set({ proof: { running: true, result: null, before, rejectAll: null } });
    get().setPanel("proofread");
    try {
      const result = await invoke<ProofreadResult>("ai_proofread", {
        req: {
          provider: settings.provider,
          apiKey: settings.apiKey,
          model: settings.model,
          baseUrl: settings.baseUrl,
          text: before,
          tone: settings.proofTone,
          fixGrammar: settings.fixGrammar,
          fixPunctuation: settings.fixPunctuation,
          removeFiller: settings.removeFiller,
          suggestStyle: settings.suggestStyle,
          language: settings.proofreadLang,
          temperature: 0.2,
          maxTokens: 8192,
        },
      });
      set({ proof: { running: false, result, before, rejectAll: null } });
    } catch (error) {
      set({ proof: { running: false, result: null, before, rejectAll: null } });
      get().setPanel("none");
      get().toast(
        error instanceof Error ? error.message : "Proofreading failed",
        "error",
      );
    }
  },

  setProof(patch) {
    set((s) => ({ proof: { ...s.proof, ...patch } }));
  },

  pushChat(message) {
    set((s) => ({ chat: [...s.chat, message] }));
  },

  setChatBusy(busy) {
    set({ chatBusy: busy });
  },
}));

export function flushSaves() {
  window.clearTimeout(saveTimer);
}
