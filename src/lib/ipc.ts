import { invoke as tauriInvoke } from "@tauri-apps/api/core";

export const isTauri = () =>
  typeof window !== "undefined" &&
  ("__TAURI_INTERNALS__" in window || "__TAURI__" in window);

/** Invoke a Tauri command, falling back to a browser stub when running `vite` alone. */
export async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  if (isTauri()) {
    return tauriInvoke<T>(cmd, args);
  }
  return browserFallback<T>(cmd, args);
}

async function browserFallback<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  const LS_NOTES = "anotely.notes";
  const LS_SETTINGS = "anotely.settings";
  const read = <R,>(key: string, fallback: R): R => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as R) : fallback;
    } catch {
      return fallback;
    }
  };
  const write = (key: string, value: unknown) =>
    localStorage.setItem(key, JSON.stringify(value));

  switch (cmd) {
    case "ping":
      return "pong" as T;
    case "list_notes":
      return read<unknown[]>(LS_NOTES, []) as T;
    case "upsert_note": {
      const notes = read<any[]>(LS_NOTES, []);
      const incoming = (args?.note ?? {}) as any;
      const idx = notes.findIndex((n) => n.id === incoming.id);
      const note = { ...incoming, updatedAt: Date.now() };
      if (idx >= 0) notes[idx] = { ...notes[idx], ...note };
      else notes.push(note);
      write(LS_NOTES, notes);
      return note as T;
    }
    case "delete_note":
    case "purge_note": {
      const id = args?.id as string;
      const notes = read<any[]>(LS_NOTES, []).filter((n) => n.id !== id);
      write(LS_NOTES, notes);
      return notes as T;
    }
    case "restore_note": {
      const id = args?.id as string;
      const notes = read<any[]>(LS_NOTES, []).map((n) =>
        n.id === id ? { ...n, folder: "notes" } : n,
      );
      write(LS_NOTES, notes);
      return notes as T;
    }
    case "empty_trash": {
      const notes = read<any[]>(LS_NOTES, []).filter((n) => n.folder !== "trash");
      write(LS_NOTES, notes);
      return notes as T;
    }
    case "get_note":
      return read<any[]>(LS_NOTES, []).find((n) => n.id === args?.id) as T;
    case "load_settings":
      return read<any>(LS_SETTINGS, {}) as T;
    case "save_settings":
      write(LS_SETTINGS, args?.settings);
      return args?.settings as T;
    case "ai_complete":
    case "ai_proofread":
    case "ai_ask":
    case "stt_transcribe":
      throw new Error("AI features need the desktop app (run `npm run app`).");
    default:
      throw new Error(`Unknown command: ${cmd}`);
  }
}
