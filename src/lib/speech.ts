import { invoke } from "./ipc";
import { applyVoicePunctuation, stripTrigger } from "./utils";

export type DictationState = "idle" | "starting" | "listening" | "transcribing";

export interface DictationOptions {
  sttProvider: string;
  sttApiKey: string;
  sttModel: string;
  sttBaseUrl: string;
  sttLanguage: string;
  sttPunctuation: boolean;
  silenceMs: number;
  donePhrase: string;
  onInterim: (text: string) => void;
  onFinal: (text: string) => void;
  onLevel: (level: number) => void;
  onState: (state: DictationState, engine: "web" | "cloud") => void;
  onDone: () => void;
  onError: (message: string) => void;
}

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
};

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  const w = window as any;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const blobToBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    reader.onerror = () => reject(new Error("Could not read audio buffer"));
    reader.readAsDataURL(blob);
  });

/**
 * Auto Write engine.
 *
 * Two paths, picked automatically:
 *  1. `web`  – the browser/WebView SpeechRecognition API. Free, offline-ish, instant.
 *  2. `cloud`– MediaRecorder + a Whisper endpoint (Groq / OpenAI / local server),
 *     with silence detection so each sentence is transcribed and committed on its own.
 */
export class Dictation {
  private opts: DictationOptions;
  private active = false;
  private mode: "web" | "cloud" = "web";
  private recognition: SpeechRecognitionLike | null = null;
  private finalBuffer = "";
  private media: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private rafId = 0;
  private lastVoiceAt = 0;
  private speaking = false;
  private clipStartedAt = 0;
  private busy = false;
  private levelTimer = 0;
  private synthPhase = 0;

  constructor(options: DictationOptions) {
    this.opts = options;
  }

  get engine() {
    return this.mode;
  }

  get isActive() {
    return this.active;
  }

  async start() {
    if (this.active) return;
    this.active = true;
    this.opts.onState("starting", this.mode);
    try {
      const wantsCloud =
        this.opts.sttProvider === "groq" ||
        this.opts.sttProvider === "openai" ||
        this.opts.sttProvider === "custom";

      const hasWebSpeech = !!getRecognitionCtor();
      if (wantsCloud && !(this.opts.sttProvider === "custom" && !this.opts.sttBaseUrl)) {
        await this.startCloud();
      } else if (hasWebSpeech) {
        await this.startWeb();
      } else if (this.opts.sttProvider === "web") {
        throw new Error(
          "This build has no built-in speech engine. Pick Groq Whisper (free tier) or a local Whisper server in Settings → Auto Write.",
        );
      } else {
        await this.startCloud();
      }
    } catch (error) {
      this.active = false;
      const message = error instanceof Error ? error.message : String(error);
      this.opts.onError(message);
      this.opts.onState("idle", this.mode);
      throw error;
    }
  }

  stop() {
    if (!this.active) return;
    this.active = false;
    this.teardownWeb();
    void this.teardownCloud(true);
    cancelAnimationFrame(this.rafId);
    clearInterval(this.levelTimer);
    this.opts.onLevel(0);
    this.opts.onState("idle", this.mode);
  }

  dispose() {
    this.stop();
  }

  // ---------------------------------------------------------------- web speech

  private async startWeb() {
    this.mode = "web";
    const Ctor = getRecognitionCtor();
    if (!Ctor) throw new Error("No speech engine available on this device.");
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.lang = this.opts.sttLanguage === "auto" ? navigator.language || "en-US" : this.opts.sttLanguage;
    this.recognition = rec;
    this.finalBuffer = "";

    rec.onstart = () => this.opts.onState("listening", "web");

    rec.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const transcript: string = result[0]?.transcript ?? "";
        if (result.isFinal) {
          this.finalBuffer += ` ${transcript}`;
        } else {
          interim += transcript;
        }
      }
      const spoken = `${this.finalBuffer} ${interim}`.trim();
      const { text, triggered } = stripTrigger(spoken, this.opts.donePhrase);
      if (triggered) {
        this.finalBuffer = "";
        this.opts.onFinal(text);
        this.opts.onInterim("");
        this.opts.onDone();
        this.stop();
        return;
      }
      this.opts.onInterim(
        this.opts.sttPunctuation ? applyVoicePunctuation(interim) : interim.trim(),
      );
    };

    rec.onerror = (event: any) => {
      if (event?.error === "no-speech" || event?.error === "aborted") return;
      if (event?.error === "not-allowed" || event?.error === "service-not-allowed") {
        this.opts.onError("Microphone permission denied. Enable it in Settings.");
        this.stop();
      }
    };

    rec.onend = () => {
      if (!this.active) return;
      try {
        rec.start();
      } catch {
        /* already started */
      }
    };

    rec.start();
    this.startSyntheticLevel();
  }

  private teardownWeb() {
    if (!this.recognition) return;
    const rec = this.recognition;
    this.recognition = null;
    rec.onresult = null;
    rec.onerror = null;
    rec.onend = null;
    rec.onstart = null;
    try {
      rec.abort();
    } catch {
      /* noop */
    }
  }

  /** Web speech gives no audio stream, so the orb pulses on a gentle synthetic curve. */
  private startSyntheticLevel() {
    this.opts.onState("listening", "web");
    this.levelTimer = window.setInterval(() => {
      this.synthPhase += 0.18;
      const level =
        0.35 + Math.abs(Math.sin(this.synthPhase)) * 0.3 + Math.abs(Math.sin(this.synthPhase * 2.3)) * 0.2;
      this.opts.onLevel(Math.min(1, level));
    }, 70);
  }

  // ------------------------------------------------------------------- cloud

  private async startCloud() {
    this.mode = "cloud";
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Microphone is not available in this build.");
    }
    this.media = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
    this.audioCtx = new AudioContext();
    const source = this.audioCtx.createMediaStreamSource(this.media);
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyser.smoothingTimeConstant = 0.75;
    source.connect(this.analyser);
    this.watchLevel();
    await this.beginClip();
  }

  private beginClip() {
    if (!this.media || !this.active) return;
    const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"]
      .find((m) => MediaRecorder.isTypeSupported?.(m));
    this.chunks = [];
    this.recorder = new MediaRecorder(this.media, mime ? { mimeType: mime } : undefined);
    this.recorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };
    this.recorder.start(250);
    this.clipStartedAt = Date.now();
    this.lastVoiceAt = Date.now();
    this.speaking = false;
    this.opts.onState("listening", "cloud");
  }

  private watchLevel() {
    const buffer = new Uint8Array(this.analyser!.frequencyBinCount);
    const tick = () => {
      if (!this.active || !this.analyser) return;
      this.analyser.getByteTimeDomainData(buffer);
      let sum = 0;
      for (const v of buffer) {
        const x = (v - 128) / 128;
        sum += x * x;
      }
      const rms = Math.sqrt(sum / buffer.length);
      const level = Math.min(1, rms * 3.2);
      this.opts.onLevel(level);

      const now = Date.now();
      const loud = level > 0.09;
      if (loud) {
        this.speaking = true;
        this.lastVoiceAt = now;
      } else if (this.speaking && now - this.lastVoiceAt > this.opts.silenceMs) {
        // Sentence finished → cut, transcribe, and immediately reopen the mic.
        this.speaking = false;
        if (now - this.clipStartedAt > 500) {
          void this.flushClip(true);
          return;
        }
      }
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private async flushClip(keepOpen: boolean) {
    if (this.busy) return;
    const recorder = this.recorder;
    if (!recorder || recorder.state === "inactive") return;
    this.busy = true;
    this.opts.onState("transcribing", "cloud");
    const done = new Promise<void>((resolve) => {
      if (recorder) recorder.onstop = () => resolve();
    });
    try {
      recorder.stop();
    } catch {
      this.busy = false;
      return;
    }
    await done;
    const blob = new Blob(this.chunks, { type: recorder.mimeType || "audio/webm" });
    this.chunks = [];
    if (blob.size < 1200) {
      this.busy = false;
      if (keepOpen) this.beginClip();
      return;
    }
    try {
      const audioBase64 = await blobToBase64(blob);
      const result = await invoke<{ text: string }>("stt_transcribe", {
        req: {
          provider: this.opts.sttProvider,
          apiKey: this.opts.sttApiKey,
          model: this.opts.sttModel,
          baseUrl: this.opts.sttBaseUrl,
          language: this.opts.sttLanguage,
          mime: blob.type || "audio/webm",
          audioBase64,
          hint: "",
        },
      });
      this.commit(result.text);
    } catch (error) {
      this.opts.onError(error instanceof Error ? error.message : String(error));
    } finally {
      this.busy = false;
      if (keepOpen && this.active) this.beginClip();
    }
  }

  private commit(spoken: string) {
    if (!spoken.trim()) return;
    const { text, triggered } = stripTrigger(spoken, this.opts.donePhrase);
    const formatted = this.opts.sttPunctuation ? applyVoicePunctuation(text) : text.trim();
    if (formatted) this.opts.onFinal(formatted);
    this.opts.onInterim("");
    if (triggered) {
      this.stop();
      this.opts.onDone();
    }
  }

  private async teardownCloud(flush: boolean) {
    const recorder = this.recorder;
    if (recorder && recorder.state !== "inactive") {
      if (flush) {
        const done = new Promise<void>((resolve) => {
          recorder.onstop = () => resolve();
        });
        try {
          recorder.stop();
        } catch {
          /* noop */
        }
        await done;
        const blob = new Blob(this.chunks, { type: recorder.mimeType || "audio/webm" });
        this.chunks = [];
        if (blob.size > 1200) {
          try {
            const audioBase64 = await blobToBase64(blob);
            const result = await invoke<{ text: string }>("stt_transcribe", {
              req: {
                provider: this.opts.sttProvider,
                apiKey: this.opts.sttApiKey,
                model: this.opts.sttModel,
                baseUrl: this.opts.sttBaseUrl,
                language: this.opts.sttLanguage,
                mime: blob.type || "audio/webm",
                audioBase64,
                hint: "",
              },
            });
            this.commit(result.text);
          } catch {
            /* best effort on the final clip */
          }
        }
      }
    }
    this.media?.getTracks().forEach((t) => t.stop());
    this.media = null;
    this.recorder = null;
    cancelAnimationFrame(this.rafId);
    clearInterval(this.levelTimer);
    if (this.audioCtx) {
      void this.audioCtx.close().catch(() => undefined);
      this.audioCtx = null;
    }
    this.analyser = null;
  }
}
