"use client";

import {
AnimatePresence,
motion,
useMotionValue,
useReducedMotion,
useSpring,
useTransform,
type MotionValue,
} from "framer-motion";
import {
Check,
Copy,
Download,
Info,
Mic,
RotateCcw,
Sparkles,
Square,
Wand2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Button, Eyebrow, Section, fadeUp, stagger } from "./ui";

/* ------------------------------------------------------------------ */
/* Content */
/* ------------------------------------------------------------------ */

const STEPS = [
{
icon: Mic,
short: "Tap",
title: "Tap the mic",
body: "No typing, no thinking about structure. Tap once and start talking.",
accent: "from-accent-500 to-fuchsia-500",
},
{
icon: Sparkles,
short: "Talk",
title: "Just talk",
body: "Anotely writes as you speak, adds punctuation, drops the ums and listens for your done-phrase.",
accent: "from-fuchsia-500 to-accent-400",
},
{
icon: Wand2,
short: "Done",
title: "Say “anotely done”",
body: "An AI proofreads the note and shows every change with a reason. Accept all, or keep your words.",
accent: "from-accent-400 to-emerald-400",
},
];

const MAX_SECONDS = 90;
const BARS = 48;

const phraseChip =
"rounded-md border border-white/10 bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-accent-300";

/* ------------------------------------------------------------------ */
/* Speech recognition (Web Speech API) minimal typings */
/* ------------------------------------------------------------------ */

type SRResult = { isFinal: boolean; length: number; [i: number]: { transcript: string } };
type SREvent = { resultIndex: number; results: { length: number; [i: number]: SRResult } };
interface SR {
continuous: boolean;
interimResults: boolean;
lang: string;
onresult: ((e: SREvent) => void) | null;
onerror: ((e: { error: string }) => void) | null;
onend: (() => void) | null;
start(): void;
stop(): void;
abort(): void;
}
type SRCtor = new () => SR;

function getSR(): SRCtor | null {
if (typeof window === "undefined") return null;
const w = window as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor };
return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function pickMime() {
if (typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported) return "";
return (
["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"].find((t) =>
MediaRecorder.isTypeSupported(t),
) ?? ""
);
}

/* ------------------------------------------------------------------ */
/* Text pipeline: done-phrase, voice commands, on-device proofread */
/* ------------------------------------------------------------------ */

// Recognisers spell brand names creatively: "anotely", "a notely", "and notely"...
const DONE_RE = /\b(?:an?d?\s?no+t+[aeiy]+l+[eyi]+)\W*done\b/i;

function cutAtDone(raw: string) {
const m = DONE_RE.exec(raw);
return m ? raw.slice(0, m.index) : raw;
}

function applyVoiceCommands(raw: string) {
return raw
.replace(/\s*\bnew paragraph\b[,.]?\s*/gi, "\n\n")
.replace(/\s*\bnew line\b[,.]?\s*/gi, "\n")
.replace(/\s*\bquestion mark\b/gi, "?")
.replace(/\s*\bexclamation (?:mark|point)\b/gi, "!")
.replace(/\s*\b(?:full stop|period)\b/gi, ".")
.replace(/\s*\bcomma\b/gi, ",");
}

type Reason = "filler" | "repeat" | "contraction" | "capital" | "punctuation";
type Counts = Record<Reason, number>;

const REASON_LABEL: Record<Reason, string> = {
filler: "Filler removed",
repeat: "Repeat merged",
contraction: "Contraction fixed",
capital: "Capitalised",
punctuation: "Punctuation added",
};

const CONTRACTIONS: Record<string, string> = {
im: "I'm",
ive: "I've",
dont: "don't",
cant: "can't",
wont: "won't",
didnt: "didn't",
doesnt: "doesn't",
isnt: "isn't",
wasnt: "wasn't",
arent: "aren't",
werent: "weren't",
couldnt: "couldn't",
wouldnt: "wouldn't",
shouldnt: "shouldn't",
havent: "haven't",
hasnt: "hasn't",
hadnt: "hadn't",
thats: "that's",
whats: "what's",
heres: "here's",
theres: "there's",
youre: "you're",
theyre: "they're",
weve: "we've",
youve: "you've",
theyve: "they've",
};
const CONTRACTION_RE = new RegExp(`\\b(?:${Object.keys(CONTRACTIONS).join("|")})\\b`, "gi");
const QUESTION_START =
/^(?:who|what|when|where|why|how|which|is|are|am|was|were|do|does|did|can|could|would|should|will|shall|have|has)\b/i;

/**
* Deterministic, on-device stand-in for the AI proofread. In the real app this
* is where your chosen model gets called; keep the { text, counts } contract.
*/
function proofread(input: string): { text: string; counts: Counts } {
const counts: Counts = { filler: 0, repeat: 0, contraction: 0, capital: 0, punctuation: 0 };

let t = input
.replace(/[ \t]+/g, " ")
.replace(/ *\n */g, "\n")
.trim();

// fillers
t = t.replace(/(?:,\s*)?\b(?:u[hm]+|e[hr]+m*|hmm+)\b,?/gi, () => {
counts.filler++;
return "";
});
t = t
.replace(/ {2,}/g, " ")
.replace(/ +([,.!?])/g, "$1")
.replace(/\n +/g, "\n")
.replace(/^[\s,]+/, "");

// "the the" -> "the"
t = t.replace(/\b(\w+)(?:\s+\1\b)+/gi, (_m, w: string) => {
counts.repeat++;
return w;
});

// dont -> don't
t = t.replace(CONTRACTION_RE, (m) => {
const fix = CONTRACTIONS[m.toLowerCase()];
counts.contraction++;
return m[0] === m[0].toUpperCase() ? fix[0].toUpperCase() + fix.slice(1) : fix;
});

// i -> I
t = t.replace(/\bi\b(?!\.)/g, () => {
counts.capital++;
return "I";
});

// sentence case + closing punctuation, paragraph by paragraph
t = t
.split("\n")
.map((line) => {
let s = line.trim();
if (!s) return line;
s = s.replace(/(^|[.!?]\s+)([a-z])/g, (_m, pre: string, ch: string) => {
counts.capital++;
return pre + ch.toUpperCase();
});
if (!/[.!?…]["')\]]?$/.test(s)) {
counts.punctuation++;
const last = s.slice(s.search(/[^.!?]*$/)).trim();
s += QUESTION_START.test(last) ? "?" : ".";
}
return s;
})
.join("\n");

return { text: t, counts };
}

type Op = { t: "eq" | "del" | "ins"; v: string };

/** Word-level diff (LCS). Returns null for very long inputs. */
function diffWords(a: string, b: string): Op[] | null {
const A = a.match(/\n+|\S+/g) ?? [];
const B = b.match(/\n+|\S+/g) ?? [];
const n = A.length;
const m = B.length;
if (n * m > 250_000) return null;

const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
for (let i = n - 1; i >= 0; i--) {
for (let j = m - 1; j >= 0; j--) {
dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
}
}

const ops: Op[] = [];
let i = 0;
let j = 0;
while (i < n && j < m) {
if (A[i] === B[j]) ops.push({ t: "eq", v: A[i++] }), j++;
else if (dp[i + 1][j] >= dp[i][j + 1]) ops.push({ t: "del", v: A[i++] });
else ops.push({ t: "ins", v: B[j++] });
}
while (i < n) ops.push({ t: "del", v: A[i++] });
while (j < m) ops.push({ t: "ins", v: B[j++] });
return ops;
}

const mmss = (s: number) =>
`${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/* ------------------------------------------------------------------ */
/* Component */
/* ------------------------------------------------------------------ */

type Phase = "idle" | "listening" | "review";
type Message = { kind: "error" | "info"; text: string };
type Review = { source: string; proofed: string; counts: Counts; total: number; diff: Op[] | null };
type Audio = { url: string; ext: string };

export function HowItWorks() {
const reduce = useReducedMotion();
const level = useMotionValue(0);

const [phase, setPhase] = useState<Phase>("idle");
const [starting, setStarting] = useState(false);
const [transcript, setTranscript] = useState("");
const [interim, setInterim] = useState("");
const [seconds, setSeconds] = useState(0);
const [message, setMessage] = useState<Message | null>(null);
const [srSupported, setSrSupported] = useState(true);
const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
const [audio, setAudio] = useState<Audio | null>(null);
const [review, setReview] = useState<Review | null>(null);
const [resolution, setResolution] = useState<"applied" | "kept" | null>(null);
const [copied, setCopied] = useState(false);

const phaseRef = useRef<Phase>("idle");
const aliveRef = useRef(true);
const finalRef = useRef("");
const interimRef = useRef("");
const wantRef = useRef(false);
const recogDeadRef = useRef(false);
const recogRef = useRef<SR | null>(null);
const recorderRef = useRef<MediaRecorder | null>(null);
const chunksRef = useRef<Blob[]>([]);
const streamRef = useRef<MediaStream | null>(null);
const ctxRef = useRef<AudioContext | null>(null);
const audioRef = useRef<Audio | null>(null);
const boxRef = useRef<HTMLDivElement>(null);

const go = useCallback((p: Phase) => {
phaseRef.current = p;
setPhase(p);
}, []);

const putAudio = useCallback((next: Audio | null) => {
if (audioRef.current) URL.revokeObjectURL(audioRef.current.url);
audioRef.current = next;
setAudio(next);
}, []);

// capability check after hydration
useEffect(() => {
setSrSupported(getSR() !== null);
}, []);

const teardown = useCallback(() => {
wantRef.current = false;
const r = recogRef.current;
recogRef.current = null;
if (r) {
r.onresult = null;
r.onerror = null;
r.onend = null;
try {
r.abort();
} catch {
/* already stopped */
}
}
const rec = recorderRef.current;
recorderRef.current = null;
if (rec && rec.state !== "inactive") {
try {
rec.stop();
} catch {
/* already stopped */
}
}
streamRef.current?.getTracks().forEach((t) => t.stop());
streamRef.current = null;
ctxRef.current?.close().catch(() => {});
ctxRef.current = null;
setAnalyser(null);
}, []);

// release the mic + object URL if the section unmounts mid-recording
useEffect(() => {
aliveRef.current = true;
return () => {
aliveRef.current = false;
teardown();
if (audioRef.current) URL.revokeObjectURL(audioRef.current.url);
};
}, [teardown]);

const finish = useCallback(() => {
if (phaseRef.current !== "listening") return;
const raw = `${finalRef.current} ${interimRef.current}`;
teardown();
setInterim("");
interimRef.current = "";

const clean = applyVoiceCommands(cutAtDone(raw))
.replace(/[ \t]+/g, " ")
.trim();

if (!clean) {
setMessage({
kind: "error",
text: "We didn't catch any words. Check your microphone and try again.",
});
go("idle");
return;
}

const { text, counts } = proofread(clean);
const total = Object.values(counts).reduce((a, b) => a + b, 0);
setReview({ source: clean, proofed: text, counts, total, diff: diffWords(clean, text) });
setResolution(null);
go("review");
}, [teardown, go]);

const start = useCallback(async () => {
setMessage(null);
if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
setMessage({
kind: "error",
text: "Recording isn't supported here. Open this page over https in a current browser.",
});
return;
}

finalRef.current = "";
interimRef.current = "";
setTranscript("");
setInterim("");
setReview(null);
setResolution(null);
setSeconds(0);
putAudio(null);
setStarting(true);

try {
const stream = await navigator.mediaDevices.getUserMedia({
audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
});
if (!aliveRef.current) {
stream.getTracks().forEach((t) => t.stop());
return;
}
streamRef.current = stream;

// 1) record the actual audio
const mime = pickMime();
const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
chunksRef.current = [];
rec.ondataavailable = (e) => {
if (e.data.size) chunksRef.current.push(e.data);
};
rec.onstop = () => {
if (!aliveRef.current) return;
const type = rec.mimeType || mime || "audio/webm";
const blob = new Blob(chunksRef.current, { type });
putAudio({
url: URL.createObjectURL(blob),
ext: type.includes("mp4") ? "m4a" : type.includes("ogg") ? "ogg" : "webm",
});
};
recorderRef.current = rec;
rec.start(500);

// 2) live level meter
const Ctx =
window.AudioContext ??
(window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
if (Ctx) {
const ctx = new Ctx();
ctxRef.current = ctx;
if (ctx.state === "suspended") await ctx.resume();
const src = ctx.createMediaStreamSource(stream);
const an = ctx.createAnalyser();
an.fftSize = 1024;
an.smoothingTimeConstant = 0.5;
src.connect(an);
setAnalyser(an);
}

// 3) live transcription
const SRImpl = getSR();
if (SRImpl) {
const r = new SRImpl();
r.continuous = true;
r.interimResults = true;
r.lang = navigator.language || "en-US";

r.onresult = (e) => {
let live = "";
for (let i = e.resultIndex; i < e.results.length; i++) {
const res = e.results[i];
const t = res[0].transcript;
if (res.isFinal) finalRef.current += `${t.trim()} `;
else live += t;
}
interimRef.current = live;
setTranscript(finalRef.current);
setInterim(live);
if (DONE_RE.test(`${finalRef.current} ${live}`)) finish();
};

r.onerror = (ev) => {
if (ev.error === "no-speech" || ev.error === "aborted") return;
recogDeadRef.current = true;
finalRef.current += interimRef.current;
interimRef.current = "";
setTranscript(finalRef.current);
setInterim("");
setSrSupported(false);
setMessage({
kind: "info",
text:
ev.error === "network"
? "Live transcription needs an internet connection in this browser. Your voice is still being recorded, so type your note below."
: "Live transcription isn't available here. Your voice is still being recorded, so type your note below.",
});
};

// Chrome ends the session after a pause; keep it going while we're recording
r.onend = () => {
if (wantRef.current && !recogDeadRef.current) {
try {
r.start();
} catch {
/* already running */
}
}
};

recogRef.current = r;
recogDeadRef.current = false;
wantRef.current = true;
try {
r.start();
} catch {
/* ignore */
}
}

go("listening");
} catch (err) {
teardown();
const name = err instanceof DOMException ? err.name : "";
setMessage({
kind: "error",
text:
name === "NotAllowedError" || name === "SecurityError"
? "Microphone access is blocked. Allow it in your browser's site settings, then tap the mic again."
: name === "NotFoundError"
? "No microphone found. Plug one in and try again."
: "Couldn't start the microphone. Close other apps that might be using it and try again.",
});
go("idle");
} finally {
if (aliveRef.current) setStarting(false);
}
}, [finish, go, putAudio, teardown]);

const onMic = () => {
if (starting) return;
if (phase === "listening") finish();
else void start();
};

// clock + hard stop so a forgotten recording can't run forever
useEffect(() => {
if (phase !== "listening") return;
const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
return () => window.clearInterval(id);
}, [phase]);

useEffect(() => {
if (phase === "listening" && seconds >= MAX_SECONDS) finish();
}, [seconds, phase, finish]);

const displayText = useMemo(() => applyVoiceCommands(transcript).trimStart(), [transcript]);

useEffect(() => {
const el = boxRef.current;
if (el) el.scrollTop = el.scrollHeight;
}, [displayText, interim]);

const reset = () => {
teardown();
putAudio(null);
setReview(null);
setResolution(null);
setTranscript("");
setInterim("");
finalRef.current = "";
interimRef.current = "";
setMessage(null);
setSeconds(0);
go("idle");
};

const copy = async (text: string) => {
try {
await navigator.clipboard.writeText(text);
setCopied(true);
window.setTimeout(() => setCopied(false), 1800);
} catch {
/* clipboard blocked */
}
};

const listening = phase === "listening";
const activeStep = phase === "idle" ? 0 : phase === "listening" ? 1 : 2;
const fade = {
initial: reduce ? false : { opacity: 0, y: 8 },
animate: { opacity: 1, y: 0 },
exit: reduce ? { opacity: 0 } : { opacity: 0, y: -8 },
transition: reduce ? { duration: 0 } : { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const },
};

return (
<Section id="how" className="py-10">
<motion.div
initial="hidden"
whileInView="show"
viewport={{ once: true, margin: "-80px" }}
variants={stagger(0.05)}
className="mx-auto max-w-2xl text-center"
>
<motion.div variants={fadeUp} className="flex justify-center">
<Eyebrow>How it works</Eyebrow>
</motion.div>
<motion.h2
variants={fadeUp}
className="mt-5 font-display text-3xl font-semibold tracking-tight sm:text-5xl sm:leading-[1.08]"
>
<span className="block text-white">Three steps.</span>
<span className="block text-slate-500">Ten seconds.</span>
</motion.h2>
<motion.p variants={fadeUp} className="mx-auto mt-4 max-w-lg text-slate-400">
Don’t take our word for it. Run the whole loop right here with your own voice.
</motion.p>
</motion.div>

{/* steps: follow what you're doing in the stage below */}
<ol className="mt-12 grid grid-cols-3 gap-2 sm:gap-4 md:mt-14 md:gap-5">
{STEPS.map((step, i) => {
const done = i < activeStep || (i === 2 && resolution !== null);
const active = i === activeStep;
return (
<li
key={step.title}
aria-current={active ? "step" : undefined}
className={cn(
"card relative h-full min-w-0 p-3 ring-1 ring-inset transition-[box-shadow,opacity] duration-300 sm:p-5 md:p-6",
active ? "ring-accent-500/50" : "ring-transparent",
!active && !done && "opacity-60",
)}
>
<div className="flex items-center justify-between gap-2">
<span
className={cn(
"grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br sm:h-9 sm:w-9 md:h-11 md:w-11 md:rounded-2xl",
step.accent,
)}
>
<step.icon className="h-4 w-4 text-white md:h-5 md:w-5" />
</span>
<span
aria-hidden="true"
className="font-display text-xl font-semibold text-white/10 sm:text-2xl md:text-4xl"
>
{done ? <Check className="h-5 w-5 text-emerald-400 md:h-6 md:w-6" /> : `0${i + 1}`}
</span>
</div>
<h3 className="mt-3 font-display text-[13px] font-semibold leading-tight text-white sm:text-base md:mt-4 md:text-xl">
<span className="md:hidden">{step.short}</span>
<span className="hidden md:inline">{step.title}</span>
</h3>
<p className="mt-2 hidden text-sm leading-relaxed text-slate-400 md:block">
{step.body}
</p>
</li>
);
})}
</ol>
<p className="mx-auto mt-3 max-w-sm text-center text-sm text-slate-400 md:hidden">
{STEPS[activeStep].body}
</p>

{/* the stage */}
<div className="relative mx-auto mt-6 max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-ink-900/80 shadow-[0_50px_120px_-40px_rgba(0,0,0,1)] backdrop-blur-xl md:mt-8">
<div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-3 sm:px-6">
<p className="text-[13px] font-medium text-white">Try it with your voice</p>
<span
role="status"
className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] tabular-nums text-slate-400"
>
<span
className={cn(
"h-1.5 w-1.5 rounded-full",
listening
? "animate-pulse bg-rose-400 motion-reduce:animate-none"
: phase === "review"
? "bg-emerald-400"
: "bg-slate-500",
)}
/>
{listening
? `Recording · ${mmss(seconds)}`
: phase === "review"
? resolution
? "Done"
: "Review"
: starting
? "Starting…"
: "Ready"}
</span>
</div>

<div className="p-4 sm:p-6 md:p-8">
<AnimatePresence mode="wait" initial={false}>
{phase !== "review" || !review ? (
<motion.div key="capture" {...fade}>
<div className="h-16 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] px-3 sm:h-20 sm:px-4">
<Waveform analyser={analyser} level={level} />
</div>

<div
ref={boxRef}
className="mt-4 max-h-48 min-h-[7.5rem] overflow-y-auto rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
>
{srSupported ? (
displayText || interim ? (
<p className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-200">
{displayText}
<span className="italic text-accent-300">{interim}</span>
</p>
) : (
<p className="text-[15px] leading-relaxed text-slate-500">
{listening
? "Listening… start talking."
: "Your words appear here as you speak."}
</p>
)
) : (
<textarea
value={transcript}
onChange={(e) => {
finalRef.current = e.target.value;
setTranscript(e.target.value);
}}
aria-label="Your note"
placeholder={
listening
? "Type your note while your voice is recorded…"
: "Live transcription isn't supported in this browser."
}
className="block min-h-[5.5rem] w-full resize-none bg-transparent text-[15px] leading-relaxed text-slate-200 placeholder:text-slate-600 focus-visible:outline-none"
readOnly={!listening}
/>
)}
</div>

{message ? (
<p
role={message.kind === "error" ? "alert" : "status"}
className={cn(
"mt-4 flex items-start gap-2 rounded-xl border px-3 py-2.5 text-[13px] leading-snug",
message.kind === "error"
? "border-rose-400/20 bg-rose-400/10 text-rose-200"
: "border-amber-300/20 bg-amber-300/10 text-amber-200",
)}
>
<Info className="mt-0.5 h-4 w-4 shrink-0" />
<span>{message.text}</span>
</p>
) : !srSupported ? (
<p className="mt-4 flex items-start gap-2 rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2.5 text-[13px] leading-snug text-amber-200">
<Info className="mt-0.5 h-4 w-4 shrink-0" />
<span>
Live transcription isn’t supported in this browser (Chrome, Edge and Safari
have it). You can still record, and type your note as you go.
</span>
</p>
) : null}

<div className="mt-6 flex flex-col items-center gap-4 text-center sm:flex-row sm:gap-5 sm:text-left">
<MicButton
listening={listening}
starting={starting}
level={level}
reduce={!!reduce}
onClick={onMic}
/>
<div className="min-w-0">
<p className="text-sm font-medium text-white">
{listening
? "Recording. Tap to finish."
: starting
? "Waiting for your microphone…"
: "Tap to record"}
</p>
<p className="mt-1 text-[13px] leading-relaxed text-slate-500">
{listening ? "Or say " : "Then say "}
<span className={phraseChip}>“anotely done”</span> to proofread.
</p>
</div>
</div>
</motion.div>
) : (
<motion.div key="review" {...fade}>
<div className="flex flex-wrap items-center gap-2">
<span className="grid h-7 w-7 place-items-center rounded-lg accent-gradient">
<Wand2 className="h-3.5 w-3.5 text-white" />
</span>
<p className="mr-1 text-[15px] font-medium text-white">
{resolution === "applied"
? "Applied"
: resolution === "kept"
? "Kept your words"
: review.total === 0
? "Nothing to fix"
: `${review.total} improvement${review.total === 1 ? "" : "s"}`}
</p>
{(Object.keys(review.counts) as Reason[])
.filter((k) => review.counts[k] > 0)
.map((k) => (
<span
key={k}
className="rounded-md bg-emerald-400/10 px-1.5 py-0.5 text-[11px] text-emerald-300"
>
{REASON_LABEL[k]} ×{review.counts[k]}
</span>
))}
</div>

<div className="mt-4 max-h-64 overflow-y-auto rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
{resolution ? (
<p className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-200">
{resolution === "applied" ? review.proofed : review.source}
</p>
) : review.diff ? (
<p className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-300">
<Diff ops={review.diff} />
</p>
) : (
<p className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-300">
{review.proofed}
</p>
)}
</div>

{!resolution && review.total > 0 && (
<p className="mt-2 text-[12px] text-slate-500">
<del className="rounded bg-rose-400/10 px-1 text-rose-300">removed</del>{" "}
<ins className="rounded bg-emerald-400/10 px-1 text-emerald-300 no-underline">
added
</ins>{" "}
Nothing changes until you press Apply.
</p>
)}

{audio && (
<div className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
<div className="mb-2 flex items-center justify-between gap-2 px-1">
<p className="text-[12px] text-slate-500">Your recording</p>
<a
href={audio.url}
download={`anotely-recording.${audio.ext}`}
className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[12px] text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
>
<Download className="h-3.5 w-3.5" /> Save
</a>
</div>
{/* eslint-disable-next-line jsx-a11y/media-has-caption */}
<audio controls src={audio.url} className="h-10 w-full [color-scheme:dark]" />
</div>
)}

<div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
{!resolution ? (
<>
<Button
size="lg"
className="w-full rounded-full sm:w-auto"
onClick={() => setResolution("applied")}
>
<Check className="h-4 w-4" />
{review.total === 0 ? "Looks good" : "Apply"}
</Button>
<Button
variant="ghost"
size="lg"
className="w-full rounded-full sm:w-auto"
onClick={() => setResolution("kept")}
>
Keep mine
</Button>
</>
) : (
<>
<Button
size="lg"
className="w-full rounded-full sm:w-auto"
onClick={() =>
copy(resolution === "applied" ? review.proofed : review.source)
}
>
{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
{copied ? "Copied" : "Copy note"}
</Button>
<Button
variant="ghost"
size="lg"
className="w-full rounded-full sm:w-auto"
onClick={reset}
>
<RotateCcw className="h-4 w-4" /> Record again
</Button>
</>
)}
</div>
</motion.div>
)}
</AnimatePresence>
</div>

<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
</div>

<p className="mx-auto mt-4 max-w-xl px-2 text-center text-[12px] leading-relaxed text-slate-600">
Audio is recorded in your browser and this page never uploads it. Live transcription uses
your browser’s built-in speech service, which may process audio in the cloud. The demo
proofread runs on your device; in the app, your chosen model does it.
</p>
</Section>
);
}

/* ------------------------------------------------------------------ */
/* Pieces */
/* ------------------------------------------------------------------ */

function Diff({ ops }: { ops: Op[] }) {
return (
<>
{ops.map((op, i) => {
if (op.v.startsWith("\n")) return op.t === "del" ? null : <span key={i}>{op.v}</span>;
const text = `${op.v} `;
if (op.t === "eq") return <span key={i}>{text}</span>;
if (op.t === "del")
return (
<del
key={i}
className="rounded bg-rose-400/10 px-0.5 text-rose-300 decoration-rose-300/60"
>
{text}
</del>
);
return (
<ins key={i} className="rounded bg-emerald-400/10 px-0.5 text-emerald-300 no-underline">
{text}
</ins>
);
})}
</>
);
}

function MicButton({
listening,
starting,
level,
reduce,
onClick,
}: {
listening: boolean;
starting: boolean;
level: MotionValue<number>;
reduce: boolean;
onClick: () => void;
}) {
// the halo breathes with your actual voice, no re-render per frame
const halo = useSpring(useTransform(level, [0, 1], [1, 1.6]), {
stiffness: 260,
damping: 18,
mass: 0.4,
});

return (
<span className="relative inline-grid shrink-0 place-items-center">
{listening ? (
<motion.span
aria-hidden="true"
style={reduce ? undefined : { scale: halo }}
className="absolute inset-0 rounded-full accent-gradient opacity-40"
/>
) : (
<span
aria-hidden="true"
className="absolute inset-0 animate-pulse-ring rounded-full accent-gradient opacity-50 motion-reduce:animate-none"
/>
)}
<button
type="button"
onClick={onClick}
aria-busy={starting}
aria-label={listening ? "Stop recording and proofread" : "Start recording"}
className="relative grid h-16 w-16 place-items-center rounded-full accent-gradient shadow-[0_18px_50px_-14px_rgba(139,92,246,0.95)] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 active:scale-95 sm:h-20 sm:w-20"
>
{listening ? (
<Square className="h-5 w-5 fill-white text-white sm:h-6 sm:w-6" />
) : (
<Mic className="h-6 w-6 text-white sm:h-7 sm:w-7" />
)}
</button>
</span>
);
}

function bar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
const r = Math.min(w / 2, h / 2);
ctx.beginPath();
ctx.moveTo(x + r, y);
ctx.arcTo(x + w, y, x + w, y + h, r);
ctx.arcTo(x + w, y + h, x, y + h, r);
ctx.arcTo(x, y + h, x, y, r);
ctx.arcTo(x, y, x + w, y, r);
ctx.closePath();
ctx.fill();
}

/** Scrolling bars driven by the real microphone signal. Sharp at any DPR and width. */
function Waveform({
analyser,
level,
}: {
analyser: AnalyserNode | null;
level: MotionValue<number>;
}) {
const canvasRef = useRef<HTMLCanvasElement>(null);
const hist = useRef<number[]>(Array(BARS).fill(0));

useEffect(() => {
const canvas = canvasRef.current;
const ctx = canvas?.getContext("2d");
if (!canvas || !ctx) return;

const draw = () => {
const dpr = window.devicePixelRatio || 1;
const w = canvas.clientWidth;
const h = canvas.clientHeight;
if (!w || !h) return;
const pw = Math.round(w * dpr);
const ph = Math.round(h * dpr);
if (canvas.width !== pw || canvas.height !== ph) {
canvas.width = pw;
canvas.height = ph;
}
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
ctx.clearRect(0, 0, w, h);

if (analyser) {
const g = ctx.createLinearGradient(0, 0, w, 0);
g.addColorStop(0, "rgba(139,92,246,0.3)");
g.addColorStop(1, "rgba(217,70,239,0.95)");
ctx.fillStyle = g;
} else {
ctx.fillStyle = "rgba(255,255,255,0.12)";
}

const gap = 3;
const n = hist.current.length;
const bw = Math.max(2, (w - gap * (n - 1)) / n);
for (let i = 0; i < n; i++) {
const bh = Math.max(3, hist.current[i] * h * 0.9);
bar(ctx, i * (bw + gap), (h - bh) / 2, bw, bh);
}
};

const ro = new ResizeObserver(draw);
ro.observe(canvas);

let raf = 0;
if (analyser) {
const buf = new Uint8Array(analyser.fftSize);
let last = 0;
const loop = (now: number) => {
analyser.getByteTimeDomainData(buf);
let sum = 0;
for (let i = 0; i < buf.length; i++) {
const x = (buf[i] - 128) / 128;
sum += x * x;
}
const lvl = Math.min(1, Math.sqrt(sum / buf.length) * 3.5);
level.set(lvl);
if (now - last > 33) {
hist.current.push(lvl);
hist.current.shift();
last = now;
draw();
}
raf = requestAnimationFrame(loop);
};
raf = requestAnimationFrame(loop);
} else {
hist.current.fill(0);
level.set(0);
draw();
}

return () => {
cancelAnimationFrame(raf);
ro.disconnect();
};
}, [analyser, level]);

return <canvas ref={canvasRef} aria-hidden="true" className="block h-full w-full" />;
}

