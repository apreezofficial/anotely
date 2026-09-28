import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Mic, MicOff, Sparkles, Wand2, Waves } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/store";
import { PROVIDERS, STT_PROVIDERS, cn } from "@/lib/utils";
import { Field, inputClass } from "./ui";

const STEPS = ["welcome", "ai", "speech"] as const;

export function Onboarding() {
  const settings = useStore((s) => s.settings);
  const update = useStore((s) => s.updateSettings);
  const createNote = useStore((s) => s.createNote);
  const toast = useStore((s) => s.toast);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const step = STEPS[index];

  const next = async () => {
    if (index < STEPS.length - 1) {
      setDirection(1);
      setIndex((i) => i + 1);
    } else {
      await update({ onboarded: true });
      await createNote({ title: "Welcome to Anotely", content: "" });
      toast("You're all set — hit the mic and talk", "success");
    }
  };

  const back = () => {
    setDirection(-1);
    setIndex((i) => Math.max(0, i - 1));
  };

  const provider = PROVIDERS.find((p) => p.key === settings.provider) ?? PROVIDERS[0];

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-y-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 26 }}
        className="surface w-[40rem] max-w-full overflow-hidden"
      >
        <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-5 py-3">
          {STEPS.map((s, i) => (
            <motion.span
              key={s}
              className={cn(
                "h-1 flex-1 rounded-full",
                i <= index ? "accent-gradient" : "bg-white/10",
              )}
              initial={false}
              animate={{ opacity: 1 }}
            />
          ))}
        </div>

        <div className="relative min-h-[24rem] overflow-hidden px-8 py-8">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ opacity: 0, x: direction * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -60 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
            >
              {step === "welcome" && <Welcome />}
              {step === "ai" && (
                <div className="space-y-5">
                  <StepTitle
                    icon={<Wand2 className="h-5 w-5 text-white" />}
                    title="Plug in your AI"
                    hint="Anotely uses this to proofread what you dictate. You can skip it and add it later in Settings."
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Provider">
                      <select
                        value={settings.provider}
                        onChange={(e) => {
                          const nextProvider = PROVIDERS.find((p) => p.key === e.target.value);
                          void update({
                            provider: e.target.value,
                            model: nextProvider?.models[0] ?? settings.model,
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
                        list="onboarding-models"
                        value={settings.model}
                        onChange={(e) => void update({ model: e.target.value })}
                        className={inputClass}
                      />
                      <datalist id="onboarding-models">
                        {provider.models.map((m) => (
                          <option key={m} value={m} />
                        ))}
                      </datalist>
                    </Field>
                  </div>
                  <Field
                    label="API key"
                    hint="Stored only on this machine. Ollama needs no key."
                  >
                    <input
                      type="password"
                      value={settings.apiKey}
                      onChange={(e) => void update({ apiKey: e.target.value })}
                      placeholder={provider.placeholder || "optional"}
                      className={cn(inputClass, "font-mono text-xs")}
                    />
                  </Field>
                </div>
              )}
              {step === "speech" && (
                <div className="space-y-5">
                  <StepTitle
                    icon={<Waves className="h-5 w-5 text-white" />}
                    title="How should we hear you?"
                    hint="The built-in engine is free and instant. Whisper is more accurate for accents and noise."
                  />
                  <div className="space-y-2">
                    {STT_PROVIDERS.map((p) => (
                      <button
                        key={p.key}
                        onClick={() => void update({ sttProvider: p.key })}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition",
                          settings.sttProvider === p.key
                            ? "border-[var(--accent-from)]/50 bg-white/[0.05]"
                            : "border-white/10 hover:bg-white/[0.03]",
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
                          {settings.sttProvider === p.key && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </span>
                        <span>
                          <span className="block text-sm font-medium text-white">{p.label}</span>
                          <span className="block text-xs text-slate-500">{p.hint}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Say this to finish" hint="Triggers AI proofreading">
                      <input
                        value={settings.donePhrase}
                        onChange={(e) => void update({ donePhrase: e.target.value })}
                        className={inputClass}
                      />
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
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between border-t border-white/[0.06] px-6 py-4">
          <button
            onClick={back}
            className={cn(
              "text-sm text-slate-500 transition hover:text-white",
              index === 0 && "invisible",
            )}
          >
            Back
          </button>
          <div className="flex items-center gap-3">
            {index === STEPS.length - 1 && (
              <button
                onClick={() => {
                  void update({ onboarded: true });
                  void createNote();
                }}
                className="text-sm text-slate-500 transition hover:text-white"
              >
                skip
              </button>
            )}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={next}
              className="flex items-center gap-2 rounded-xl accent-gradient px-5 py-2.5 text-sm font-semibold text-white"
            >
              {index === STEPS.length - 1 ? "Start writing" : "Continue"}
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Welcome() {
  return (
    <div className="space-y-6 text-center">
      <motion.div
        className="relative mx-auto grid h-24 w-24 place-items-center"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.span
          className="absolute inset-0 rounded-3xl accent-gradient opacity-50 blur-xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2.8, repeat: Infinity }}
        />
        <span className="relative grid h-20 w-20 place-items-center rounded-3xl accent-gradient">
          <Sparkles className="h-9 w-9 text-white" strokeWidth={2.2} />
        </span>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full accent-gradient"
            animate={{ opacity: [0.1, 1, 0.1], y: [0, -14, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
            style={{ left: -6 + i * 10, top: -4 }}
          />
        ))}
      </motion.div>

      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-white">
          Welcome to <span className="text-gradient">Anotely</span>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-400">
          Talk. Anotely writes it down, cleans up the punctuation, and the second you say
          <span className="accent-text"> “done” </span>
          an AI proofreads the whole note.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: <Mic className="h-4 w-4" />, title: "Auto Write", body: "Speak naturally" },
          { icon: <Sparkles className="h-4 w-4" />, title: "Smart text", body: "Spoken punctuation" },
          { icon: <Wand2 className="h-4 w-4" />, title: "AI proofread", body: "On “done”" },
        ].map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.1 }}
            className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 text-left"
          >
            <span className="mb-2 grid h-8 w-8 place-items-center rounded-lg accent-gradient text-white">
              {f.icon}
            </span>
            <p className="text-sm font-medium text-white">{f.title}</p>
            <p className="text-[11.5px] text-slate-500">{f.body}</p>
          </motion.div>
        ))}
      </div>

      <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-600">
        <MicOff className="h-3 w-3" /> Your notes never leave this machine except to your AI provider
      </p>
    </div>
  );
}

function StepTitle({ icon, title, hint }: { icon: React.ReactNode; title: string; hint: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl accent-gradient">
        {icon}
      </span>
      <div>
        <h2 className="font-display text-xl font-semibold tracking-tight text-white">{title}</h2>
        <p className="mt-0.5 text-sm text-slate-500">{hint}</p>
      </div>
    </div>
  );
}
