import { useCallback, useEffect, useRef } from "react";
import { Dictation } from "@/lib/speech";
import { dictationCursor } from "@/lib/cursor";
import { useStore } from "@/store";

function joinText(current: string, offset: number, addition: string) {
  const at = Math.max(0, Math.min(offset, current.length));
  const before = current.slice(0, at);
  const after = current.slice(at);
  const needsSpace = before.length > 0 && !/\s$/.test(before);
  const insertion = `${needsSpace ? " " : ""}${addition}`;
  return { text: `${before}${insertion}${after}`, caret: at + insertion.length };
}

export function useDictation() {
  const settings = useStore((s) => s.settings);
  const state = useStore((s) => s.dictation);
  const activeId = useStore((s) => s.activeId);
  const patchNote = useStore((s) => s.patchNote);
  const setDictation = useStore((s) => s.setDictation);
  const startProof = useStore((s) => s.startProof);
  const createNote = useStore((s) => s.createNote);
  const toast = useStore((s) => s.toast);
  const engineRef = useRef<Dictation | null>(null);
  const pendingProof = useRef(false);

  const active = state.state !== "idle";

  const stop = useCallback(() => {
    engineRef.current?.stop();
    engineRef.current = null;
    setDictation({ state: "idle", level: 0, interim: "" });
  }, [setDictation]);

  const start = useCallback(async () => {
    if (engineRef.current) return;
    let noteId = useStore.getState().activeId;
    if (!noteId) {
      const note = await createNote();
      noteId = note.id;
    }
    const note = () => useStore.getState().notes.find((n) => n.id === noteId);

    const append = (chunk: string) => {
      const current = note();
      if (!current) return;
      const offset =
        dictationCursor.offset && dictationCursor.offset <= current.content.length
          ? dictationCursor.offset
          : current.content.length;
      const { text, caret } = joinText(current.content, offset, chunk);
      dictationCursor.offset = caret;
      patchNote(current.id, { content: text });
    };

    pendingProof.current = false;

    const engine = new Dictation({
      sttProvider: settings.sttProvider,
      sttApiKey: settings.sttApiKey || settings.apiKey,
      sttModel: settings.sttModel,
      sttBaseUrl: settings.sttBaseUrl,
      sttLanguage: settings.sttLanguage,
      sttPunctuation: settings.sttPunctuation,
      silenceMs: settings.sttSilenceMs,
      donePhrase: settings.donePhrase,
      onInterim: (interim) => setDictation({ interim }),
      onFinal: (text) => {
        append(text);
        setDictation({ interim: "" });
      },
      onLevel: (level) => setDictation({ level }),
      onState: (dictationState, engineKind) =>
        setDictation({ state: dictationState, engine: engineKind }),
      onError: (message) => {
        toast(message, "error");
        setDictation({ state: "idle", level: 0 });
      },
      onDone: () => {
        const current = note();
        engineRef.current?.stop();
        engineRef.current = null;
        setDictation({ state: "idle", level: 0, interim: "" });
        if (current && settings.autoProofread) {
          pendingProof.current = true;
          setDictation({ state: "proofreading" });
          toast(`Heard “${settings.donePhrase}” — proofreading…`, "info");
          void startProof(current.content).then(() => {
            if (pendingProof.current) {
              pendingProof.current = false;
              setDictation({ state: "idle" });
            }
          });
        } else {
          toast("Dictation finished", "success");
        }
      },
    });

    engineRef.current = engine;
    try {
      await engine.start();
    } catch {
      engineRef.current = null;
    }
  }, [
    createNote,
    patchNote,
    setDictation,
    settings.apiKey,
    settings.autoProofread,
    settings.donePhrase,
    settings.sttApiKey,
    settings.sttBaseUrl,
    settings.sttLanguage,
    settings.sttModel,
    settings.sttPunctuation,
    settings.sttProvider,
    settings.sttSilenceMs,
    startProof,
    toast,
  ]);

  const toggle = useCallback(() => {
    if (active) stop();
    else void start();
  }, [active, start, stop]);

  useEffect(
    () => () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    },
    [],
  );

  return { active, start, stop, toggle, activeId };
}
