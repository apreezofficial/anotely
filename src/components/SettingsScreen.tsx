import { motion } from "framer-motion";
import {
  Bot,
  Check,
  Loader2,
  Palette,
  Trash2,
  Type,
  Waves,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { invoke } from "@/lib/ipc";
import { useStore } from "@/store";
import { ACCENTS, PROVIDERS, STT_PROVIDERS, cn } from "@/lib/utils";
import { Field, Toggle, inputClass } from "./ui";

const SECTIONS = [
  { key: "ai", label: "AI model", icon: Bot },
  { key: "proof", label: "Proofreading", icon: Wand2 },
  { key: "speech", label: "Auto Write", icon: Waves },
  { key: "look", label: "Appearance", icon: Palette },
  { key: "data", label: "Data", icon: Trash2 },
] as const;

type Section = (typeof SECTIONS)[number]["key"];

export function SettingsScreen() {
  const settings = useStore((s) => s.settings);
  const update = useStore((s) => s.updateSettings);
  const toast = useStore((s) => s.toast);
  const setView = useStore((s) => s.setView);
  const emptyTrash = useStore((s) => s.emptyTrash);
  const notes = useStore((s) => s.notes);
  const [section, setSection] = useState<Section>("ai");
  const [testing, setTesting] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const provider = PROVIDERS.find((p) => p.key === settings.provider) ?? PROVIDERS[0];

  const testConnection = async () => {
    setTesting(true);
    try {
      const reply = await invoke<string>("ai_complete", {
        req: {
          provider: settings.provider,
          apiKey: settings.apiKey,
          model: settings.model,
          baseUrl: settings.baseUrl,
          system: "You are a test assistant.",
          prompt: 'Reply with exactly: "Anotely is connected."',
          temperature: 0,
          maxTokens: 64,
          jsonMode: false,
        },
      });
      toast(`Connected: ${reply.trim().slice(0, 80)}`, "success");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Connection failed", "error");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      <nav className="scrollbar-none safe-x flex shrink-0 gap-1.5 overflow-x-auto border-b border-white/[0.06] px-3 py-2.5 lg:block lg:w-52 lg:space-y-1 lg:overflow-visible lg:border-b-0 lg:border-r lg:px-3 lg:py-6">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSection(s.key)}
            className={cn(
              "tap-row relative flex w-auto shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-[13px] transition-colors lg:w-full",
              section === s.key ? "text-white" : "text-slate-400 hover:bg-white/[0.04] active:bg-white/[0.07]",
            )}
          >
            {section === s.key && (
              <motion.span
                layoutId="settings-active"
                className="absolute inset-0 rounded-xl border border-white/10 bg-white/[0.06]"
              />
            )}
            <s.icon className="relative z-10 h-4 w-4" />
            <span className="relative z-10">{s.label}</span>
          </button>
        ))}
        <button
          onClick={() => setView("notes")}
          className="tap-row mt-2 hidden w-full items-center gap-2 px-3 text-[12px] text-slate-500 transition hover:text-white lg:flex"
        >
          <X className="h-3.5 w-3.5" /> close settings
        </button>
      </nav>

      <motion.div
        key={section}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 lg:px-8 lg:py-6"
      >
        <div className="mx-auto max-w-2xl space-y-6">
          {section === "ai" && (
            <>
              <Header title="AI model" hint="Anotely uses this model for proofreading and the assistant." />
              <div className="surface space-y-4 p-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Provider">
                    <select
                      value={settings.provider}
                      onChange={(e) => {
                        const next = PROVIDERS.find((p) => p.key === e.target.value);
                        void update({
                          provider: e.target.value,
                          model: next?.models[0] ?? settings.model,
                        });
                      }}
                      className={inputClass}
                    >
                      {PROVIDERS.map((p) => (
                        <option key={p.key} value={p.key} className="bg-ink-850">
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Model">
                    <input
                      list="models"
                      value={settings.model}
                      onChange={(e) => void update({ model: e.target.value })}
                      className={inputClass}
                    />
                    <datalist id="models">
                      {provider.models.map((m) => (
                        <option key={m} value={m} />
                      ))}
                    </datalist>
                  </Field>
                </div>

                <Field
                  label="API key"
                  hint="Stored locally in your app data folder. Never sent anywhere except the provider you chose."
                >
                  <div className="relative">
                    <input
                      type={showKey ? "text" : "password"}
                      value={settings.apiKey}
                      onChange={(e) => void update({ apiKey: e.target.value })}
                      placeholder={provider.placeholder || "no key needed"}
                      className={cn(inputClass, "pr-10 font-mono text-xs")}
                    />
                    <button
                      onClick={() => setShowKey((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-white"
                    >
                      {showKey ? <X className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5 -rotate-45" />}
                    </button>
                  </div>
                </Field>

                {settings.provider === "custom" || settings.provider === "ollama" ? (
                  <Field
                    label="Base URL"
                    hint={
                      settings.provider === "ollama"
                        ? "http://localhost:11434"
                        : "https://your-endpoint/v1"
                    }
                  >
                    <input
                      value={settings.baseUrl}
                      onChange={(e) => void update({ baseUrl: e.target.value })}
                      placeholder="https://api.example.com/v1"
                      className={cn(inputClass, "font-mono text-xs")}
                    />
                  </Field>
                ) : null}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label={`Creativity · ${settings.temperature.toFixed(1)}`}>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.1}
                      value={settings.temperature}
                      onChange={(e) => void update({ temperature: Number(e.target.value) })}
                      className="w-full accent-[var(--accent-from)]"
                    />
                  </Field>
                  <Field label="Max output tokens">
                    <input
                      type="number"
                      value={settings.maxTokens}
                      onChange={(e) => void update({ maxTokens: Number(e.target.value) })}
                      className={inputClass}
                    />
                  </Field>
                </div>

                <button
                  onClick={testConnection}
                  disabled={testing}
                  className="flex items-center gap-2 rounded-xl accent-gradient px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  Test connection
                </button>
              </div>
            </>
          )}

          {section === "proof" && (
            <>
              <Header title="Proofreading" hint="What AI is allowed to change when you say you’re done." />
              <div className="surface space-y-1 p-5">
                <Row
                  label="Proofread automatically on “done”"
                  hint="Fires the moment your trigger phrase is heard"
                  checked={settings.autoProofread}
                  onChange={(v) => void update({ autoProofread: v })}
                />
                <Row
                  label="Fix grammar & word choice"
                  checked={settings.fixGrammar}
                  onChange={(v) => void update({ fixGrammar: v })}
                />
                <Row
                  label="Fix punctuation & capitalisation"
                  checked={settings.fixPunctuation}
                  onChange={(v) => void update({ fixPunctuation: v })}
                />
                <Row
                  label="Remove filler words"
                  hint="um, uh, you know, basically…"
                  checked={settings.removeFiller}
                  onChange={(v) => void update({ removeFiller: v })}
                />
                <Row
                  label="Also tighten style"
                  hint="Shorter sentences, better flow"
                  checked={settings.suggestStyle}
                  onChange={(v) => void update({ suggestStyle: v })}
                />
                <div className="grid grid-cols-1 gap-3 pt-3 sm:grid-cols-2">
                  <Field label="Done phrase" hint="Say this to stop and proofread">
                    <input
                      value={settings.donePhrase}
                      onChange={(e) => void update({ donePhrase: e.target.value })}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Tone">
                    <select
                      value={settings.proofTone}
                      onChange={(e) => void update({ proofTone: e.target.value })}
                      className={inputClass}
                    >
                      {["clear", "professional", "friendly", "concise", "academic", "plain"].map((t) => (
                        <option key={t} value={t} className="bg-ink-850">
                          {t}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label="Language" hint="Leave as auto unless you dictate another language">
                  <input
                    value={settings.proofreadLang}
                    onChange={(e) => void update({ proofreadLang: e.target.value })}
                    placeholder="en"
                    className={inputClass}
                  />
                </Field>
              </div>
            </>
          )}

          {section === "speech" && (
            <>
              <Header title="Auto Write" hint="How your voice becomes text." />
              <div className="space-y-3">
                {STT_PROVIDERS.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => void update({ sttProvider: p.key })}
                    className={cn(
                      "surface flex w-full items-start gap-3 p-4 text-left transition",
                      settings.sttProvider === p.key
                        ? "border-[var(--accent-from)]/50 bg-white/[0.05]"
                        : "hover:bg-white/[0.03]",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border",
                        settings.sttProvider === p.key
                          ? "accent-gradient border-transparent"
                          : "border-white/20",
                      )}
                    >
                      {settings.sttProvider === p.key && <Check className="h-3 w-3 text-white" />}
                    </span>
                    <span>
                      <span className="block text-sm font-medium text-white">{p.label}</span>
                      <span className="block text-xs text-slate-500">{p.hint}</span>
                    </span>
                  </button>
                ))}
              </div>

              <div className="surface space-y-4 p-5">
                {settings.sttProvider !== "web" && (
                  <>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Field label="Model">
                        <input
                          value={settings.sttModel}
                          onChange={(e) => void update({ sttModel: e.target.value })}
                          className={cn(inputClass, "font-mono text-xs")}
                        />
                      </Field>
                      <Field label="API key" hint="Falls back to your AI key if empty">
                        <input
                          type="password"
                          value={settings.sttApiKey}
                          onChange={(e) => void update({ sttApiKey: e.target.value })}
                          placeholder={settings.apiKey ? "using AI key" : "gsk_… / sk-…"}
                          className={cn(inputClass, "font-mono text-xs")}
                        />
                      </Field>
                    </div>
                    {settings.sttProvider === "custom" && (
                      <Field label="Base URL" hint="e.g. http://localhost:8000/v1">
                        <input
                          value={settings.sttBaseUrl}
                          onChange={(e) => void update({ sttBaseUrl: e.target.value })}
                          className={cn(inputClass, "font-mono text-xs")}
                        />
                      </Field>
                    )}
                  </>
                )}

                <Row
                  label="Smart punctuation"
                  hint="Turns spoken punctuation and fillers into clean prose"
                  checked={settings.sttPunctuation}
                  onChange={(v) => void update({ sttPunctuation: v })}
                />
                <Field label="Silence before a sentence is committed" hint="Higher = longer pauses before each chunk">
                  <input
                    type="range"
                    min={400}
                    max={2000}
                    step={50}
                    value={settings.sttSilenceMs}
                    onChange={(e) => void update({ sttSilenceMs: Number(e.target.value) })}
                    className="w-full accent-[var(--accent-from)]"
                  />
                  <span className="text-[11px] text-slate-500">{settings.sttSilenceMs} ms</span>
                </Field>
                <Field label="Language">
                  <input
                    value={settings.sttLanguage}
                    onChange={(e) => void update({ sttLanguage: e.target.value })}
                    placeholder="en"
                    className={inputClass}
                  />
                </Field>
              </div>
            </>
          )}

          {section === "look" && (
            <>
              <Header title="Appearance" hint="Make it yours." />
              <div className="surface space-y-5 p-5">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Accent
                  </p>
                  <div className="flex gap-2">
                    {Object.entries(ACCENTS).map(([key, a]) => (
                      <motion.button
                        key={key}
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => void update({ accent: key })}
                        className={cn(
                          "h-9 w-9 rounded-xl transition-shadow",
                          settings.accent === key &&
                            "ring-2 ring-white/70 ring-offset-2 ring-offset-ink-850",
                        )}
                        style={{ backgroundImage: `linear-gradient(135deg, ${a.from}, ${a.to})` }}
                      />
                    ))}
                  </div>
                </div>

                <Field label="Theme">
                  <div className="flex gap-2">
                    {["dark", "light"].map((t) => (
                      <button
                        key={t}
                        onClick={() => void update({ theme: t })}
                        className={cn(
                          "flex-1 rounded-xl border px-3 py-2.5 text-sm capitalize transition",
                          settings.theme === t
                            ? "border-[var(--accent-from)] bg-white/[0.06] text-white"
                            : "border-white/10 text-slate-400 hover:text-white",
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label={`Editor text size · ${settings.fontSize}px`}>
                  <input
                    type="range"
                    min={14}
                    max={22}
                    value={settings.fontSize}
                    onChange={(e) => void update({ fontSize: Number(e.target.value) })}
                    className="w-full accent-[var(--accent-from)]"
                  />
                </Field>

                <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/20 p-3">
                  <Type className="h-4 w-4 accent-text" />
                  <p className="text-sm text-slate-300">
                    The quick brown fox jumps over the lazy dog.
                  </p>
                </div>

                <Row
                  label="Reduce motion"
                  hint="Calmer animations for accessibility"
                  checked={settings.reduceMotion}
                  onChange={(v) => void update({ reduceMotion: v })}
                />
              </div>
            </>
          )}

          {section === "data" && (
            <>
              <Header title="Data" hint="Everything stays on this machine." />
              <div className="surface space-y-4 p-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Notes</span>
                  <span className="font-semibold text-white">{notes.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">In trash</span>
                  <span className="font-semibold text-white">
                    {notes.filter((n) => n.folder === "trash").length}
                  </span>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => void emptyTrash()}
                    className="flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20"
                  >
                    <Trash2 className="h-4 w-4" /> Empty trash
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  Notes are stored as a single JSON file in your app data folder. API keys live in a
                  separate settings file and never leave your device except when calling your chosen
                  AI provider.
                </p>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function Header({ title, hint }: { title: string; hint: string }) {
  return (
    <div>
      <h2 className="font-display text-xl font-semibold tracking-tight text-white">{title}</h2>
      <p className="text-sm text-slate-500">{hint}</p>
    </div>
  );
}

function Row({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-4 border-b border-white/[0.05] py-3 last:border-0">
      <div className="flex-1">
        <p className="text-sm text-slate-200">{label}</p>
        {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
      </div>
      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  );
}
