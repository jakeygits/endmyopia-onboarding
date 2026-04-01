"use client";

import { useState, useEffect } from "react";
import VideoPlaceholder from "@/components/VideoPlaceholder";
import QuizCard from "@/components/QuizCard";
import ProgressDots from "@/components/ProgressDots";
import ProgressionChart from "@/components/ProgressionChart";

type UserData = {
  years: number;
  leftEye: number;   // diopters from their "subscription" (negative)
  rightEye: number;
  leftCm?: number;   // self-measured blur point
  rightCm?: number;
};

// Phase 1: screens 0–4
// Phase 2: screens 5–8
// Phase 3 placeholder: screen 9

// ── Subscription callout (reusable) ──────────────────────────────

function SubscriptionCallout() {
  return (
    <div className="rounded-lg border-l-2 border-amber-500 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-400">
      <span className="text-zinc-200 font-medium">Note:</span> We don&apos;t
      call them prescriptions here. A prescription fixes something. What you
      were given is a{" "}
      <span className="text-amber-400 font-semibold">subscription</span> —
      renewed annually, getting stronger, generating revenue.
    </div>
  );
}

// ── Screen 0: Input ───────────────────────────────────────────────

function InputScreen({ onComplete }: { onComplete: (d: UserData) => void }) {
  const [years, setYears] = useState("");
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [error, setError] = useState("");

  const parseRx = (val: string): number | null => {
    const n = parseFloat(val);
    if (isNaN(n) || n === 0) return null;
    return n > 0 ? -n : n;
  };

  const submit = () => {
    const y = parseInt(years);
    const l = parseRx(left);
    const r = parseRx(right);

    if (!y || y < 1 || y > 80) {
      setError("Enter how many years you've been wearing glasses or contacts.");
      return;
    }
    if (l === null || l < -25) {
      setError("Enter your left eye number (e.g. -2.50). Myopia only for now.");
      return;
    }
    if (r === null || r < -25) {
      setError("Enter your right eye number (e.g. -3.00). Myopia only for now.");
      return;
    }
    onComplete({ years: y, leftEye: l, rightEye: r });
  };

  const inputCls =
    "w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors";
  const labelCls = "block text-sm text-zinc-400 mb-1.5";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-amber-400 font-medium mb-3">
          Phase 1 of 5
        </p>
        <h1 className="text-3xl font-bold text-zinc-100 leading-tight">
          Before we start, I need a few numbers.
        </h1>
        <p className="text-zinc-400 mt-3 leading-relaxed">
          Your optometrist uses these to write your next renewal. We&apos;re
          going to use them to show you something they never did.
        </p>
      </div>

      <SubscriptionCallout />

      <div>
        <label className={labelCls}>
          Years wearing glasses or contacts
        </label>
        <input
          type="number"
          className={inputCls}
          value={years}
          onChange={(e) => setYears(e.target.value)}
          placeholder="e.g. 10"
          min={1}
          max={80}
        />
      </div>

      <div>
        <label className={labelCls}>
          Your subscription strength — sphere only (the first number on the lens paper)
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-zinc-500 mb-1.5">Left eye (OS)</p>
            <input
              type="number"
              className={inputCls}
              step="0.25"
              value={left}
              onChange={(e) => setLeft(e.target.value)}
              placeholder="-2.50"
            />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1.5">Right eye (OD)</p>
            <input
              type="number"
              className={inputCls}
              step="0.25"
              value={right}
              onChange={(e) => setRight(e.target.value)}
              placeholder="-3.00"
            />
          </div>
        </div>
        <p className="text-xs text-zinc-600 mt-2">
          Don&apos;t have it handy? Estimate — it still works. Negative values
          for myopia (nearsightedness).
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-950/30 border border-red-900 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <button
        onClick={submit}
        className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-xl py-4 transition-colors text-base cursor-pointer"
      >
        Show me what happened to my eyes →
      </button>
    </div>
  );
}

// ── Screen 1: The Shock ───────────────────────────────────────────

function ShockScreen({
  userData,
  onContinue,
}: {
  userData: UserData;
  onContinue: () => void;
}) {
  const avg = (userData.leftEye + userData.rightEye) / 2;
  const avgStr = Math.abs(avg).toFixed(2);
  const progression = (userData.years * 0.5).toFixed(1);
  const [quizPassed, setQuizPassed] = useState(false);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-widest text-amber-400 font-medium mb-3">
          The math they never ran for you
        </p>
        <h1 className="text-3xl font-bold text-zinc-100 leading-tight">
          Your eyes got approximately{" "}
          <span className="text-amber-400">~{progression}D worse</span> while
          under professional care.
        </h1>
      </div>

      <ProgressionChart
        years={userData.years}
        leftEye={userData.leftEye}
        rightEye={userData.rightEye}
      />

      <div className="rounded-xl bg-zinc-900 border border-zinc-800 px-5 py-4 text-sm text-zinc-400 leading-relaxed">
        <strong className="text-zinc-200">How this is calculated:</strong>{" "}
        Average myopia progression under standard full correction is ~0.5D per
        year. You&apos;ve been subscribed for {userData.years} years. Your
        subscription currently averages{" "}
        <strong className="text-zinc-200">-{avgStr}D</strong>. The math lines
        up.
      </div>

      <p className="text-zinc-300 leading-relaxed">
        This is not a coincidence. This is the{" "}
        <em>expected outcome</em> of the standard treatment model — and nobody
        told you.
      </p>

      <div className="rounded-xl bg-zinc-900 border border-amber-900/40 px-5 py-4">
        <p className="text-xs text-amber-400 uppercase tracking-widest font-medium mb-1">
          But here&apos;s what they also didn&apos;t tell you
        </p>
        <p className="text-zinc-300 text-sm leading-relaxed">
          The same mechanism that made your eyes worse can work in reverse.
          Vision improvement is documented, measurable, and has happened for
          thousands of people — including the person who built this guide.
        </p>
      </div>

      <VideoPlaceholder
        label="How I Improved My Eyesight Naturally"
        duration="2:10"
        videoId="traKGc2NDWQ"
      />

      <QuizCard
        question="What do glasses and contacts actually do?"
        options={[
          "Fix the underlying problem causing blur",
          "Compensate for blur without addressing the cause",
          "Strengthen your eye muscles over time",
          "Prevent further deterioration",
        ]}
        correct={1}
        explanation="Glasses are optical compensation devices. They redirect light so you see clearly — but they do nothing about why your eyes produce the wrong focal length. The cause keeps going unchecked, year after year."
        onPass={() => setQuizPassed(true)}
      />

      {quizPassed && (
        <button
          onClick={onContinue}
          className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-xl py-4 transition-colors cursor-pointer"
        >
          Next: Why does this happen? →
        </button>
      )}
    </div>
  );
}

// ── Screen 2: Biology ─────────────────────────────────────────────

function BiologyScreen({ onContinue }: { onContinue: () => void }) {
  const [quizPassed, setQuizPassed] = useState(false);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-widest text-amber-400 font-medium mb-3">
          How your eye actually works
        </p>
        <h1 className="text-3xl font-bold text-zinc-100 leading-tight">
          Your eye isn&apos;t broken. It&apos;s responding perfectly to the
          wrong signal.
        </h1>
      </div>

      <VideoPlaceholder
        label="Is Bad Eyesight Genetic? Why You Are Nearsighted"
        duration="1:58"
        videoId="h0XmmsZpXNk"
      />

      <p className="text-zinc-300 leading-relaxed">
        Inside your eye is the{" "}
        <strong className="text-zinc-100">ciliary muscle</strong> — a ring of
        muscle that controls the shape of your lens. When you look close, it
        contracts. When you look far, it relaxes.
      </p>

      <p className="text-zinc-300 leading-relaxed">
        After hours of close-up work — screens, books, anything under a meter —
        this muscle can get stuck in a contracted state. It can&apos;t fully
        relax. Result: blur at distance.
      </p>

      <div className="rounded-xl bg-amber-950/20 border border-amber-900/40 px-5 py-4">
        <p className="text-amber-200 font-semibold mb-1">
          This is called pseudomyopia.
        </p>
        <p className="text-zinc-400 text-sm leading-relaxed">
          It&apos;s the first stage of myopia — and at this stage,{" "}
          <strong className="text-zinc-300">
            it&apos;s completely reversible
          </strong>
          . The eyeball hasn&apos;t changed. It&apos;s just a muscle spasm.
        </p>
      </div>

      <p className="text-zinc-400 leading-relaxed text-sm">
        Most people progress straight through pseudomyopia to structural change
        — where the eyeball actually elongates — without ever knowing the
        reversible window existed. Because nobody told them.
      </p>

      <QuizCard
        question="What is pseudomyopia?"
        options={[
          "A rare genetic eye condition",
          "Blur from a permanently elongated eyeball",
          "Temporary blur from a ciliary muscle stuck in contraction",
          "The clinical term for needing reading glasses",
        ]}
        correct={2}
        explanation="Pseudomyopia is functional, not structural — a muscle problem causing blur, not a physical change to the eye. At this stage there's no permanent damage. The muscle just needs to learn to relax again."
        onPass={() => setQuizPassed(true)}
      />

      {quizPassed && (
        <button
          onClick={onContinue}
          className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-xl py-4 transition-colors cursor-pointer"
        >
          Next: What makes it worse →
        </button>
      )}
    </div>
  );
}

// ── Screen 3: Lens-Induced Myopia ─────────────────────────────────

function CauseScreen({ onContinue }: { onContinue: () => void }) {
  const [quizPassed, setQuizPassed] = useState(false);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-widest text-amber-400 font-medium mb-3">
          The mechanism
        </p>
        <h1 className="text-3xl font-bold text-zinc-100 leading-tight">
          Full distance correction. Used for close-up work. Your eye elongates.
        </h1>
      </div>

      <VideoPlaceholder
        label="How Glasses Make Your Eyesight Worse"
        duration="1:38"
        videoId="zJJQdue_mzc"
      />

      <p className="text-zinc-300 leading-relaxed">
        When you wear your full distance subscription and look at a screen 50cm
        away, your eye receives a{" "}
        <strong className="text-zinc-100">defocus signal</strong>. The image is
        forming slightly behind the retina.
      </p>

      <p className="text-zinc-300 leading-relaxed">
        Your eye interprets this as:{" "}
        <em className="text-zinc-200">
          &ldquo;I need to grow to bring that focal point forward.&rdquo;
        </em>{" "}
        So it does. Axial elongation. More myopia. Stronger subscription at your
        next renewal. Repeat forever.
      </p>

      {/* Focal point diagram */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">
          Where light actually lands
        </p>
        <svg viewBox="0 0 300 130" className="w-full" style={{ height: 130 }}>
          {/* Labels */}
          <text x="18" y="28" fill="#71717a" fontSize="8" textAnchor="middle">Screen</text>
          <text x="150" y="28" fill="#71717a" fontSize="8" textAnchor="middle">Lens</text>
          <text x="268" y="28" fill="#71717a" fontSize="8" textAnchor="middle">Eye</text>

          {/* ── Row 1: Correct (near glasses) ── */}
          <text x="8" y="52" fill="#4ade80" fontSize="7" fontWeight="bold">✓</text>
          <text x="16" y="52" fill="#52525b" fontSize="7">Near glasses</text>

          {/* Screen */}
          <rect x="10" y="55" width="4" height="24" fill="#52525b" rx="1" />
          {/* Rays - converge ON retina */}
          <line x1="14" y1="58" x2="148" y2="63" stroke="#4ade80" strokeWidth="1" opacity="0.6" />
          <line x1="14" y1="67" x2="148" y2="67" stroke="#4ade80" strokeWidth="1.5" opacity="0.8" />
          <line x1="14" y1="76" x2="148" y2="71" stroke="#4ade80" strokeWidth="1" opacity="0.6" />
          {/* Lens */}
          <ellipse cx="150" cy="67" rx="4" ry="14" fill="none" stroke="#a1a1aa" strokeWidth="1.5" />
          {/* Rays after lens - converge on retina */}
          <line x1="154" y1="63" x2="248" y2="67" stroke="#4ade80" strokeWidth="1" opacity="0.6" />
          <line x1="154" y1="67" x2="248" y2="67" stroke="#4ade80" strokeWidth="1.5" opacity="0.8" />
          <line x1="154" y1="71" x2="248" y2="67" stroke="#4ade80" strokeWidth="1" opacity="0.6" />
          {/* Eye */}
          <ellipse cx="260" cy="67" rx="14" ry="18" fill="none" stroke="#52525b" strokeWidth="1.5" />
          {/* Retina line */}
          <line x1="270" y1="55" x2="270" y2="79" stroke="#52525b" strokeWidth="1" strokeDasharray="2,2" />
          {/* Focus dot ON retina */}
          <circle cx="248" cy="67" r="3" fill="#4ade80" />
          <text x="240" y="88" fill="#4ade80" fontSize="7" textAnchor="middle">Focused ✓</text>

          {/* ── Row 2: Wrong (distance glasses for near) ── */}
          <text x="8" y="105" fill="#f87171" fontSize="7" fontWeight="bold">✗</text>
          <text x="16" y="105" fill="#52525b" fontSize="7">Distance glasses</text>

          {/* Screen */}
          <rect x="10" y="108" width="4" height="24" fill="#52525b" rx="1" />
          {/* Rays */}
          <line x1="14" y1="111" x2="148" y2="116" stroke="#f87171" strokeWidth="1" opacity="0.6" />
          <line x1="14" y1="120" x2="148" y2="120" stroke="#f87171" strokeWidth="1.5" opacity="0.8" />
          <line x1="14" y1="129" x2="148" y2="124" stroke="#f87171" strokeWidth="1" opacity="0.6" />
          {/* Lens */}
          <ellipse cx="150" cy="120" rx="4" ry="14" fill="none" stroke="#a1a1aa" strokeWidth="1.5" />
          {/* Rays after lens - converge BEHIND retina */}
          <line x1="154" y1="116" x2="290" y2="120" stroke="#f87171" strokeWidth="1" opacity="0.5" strokeDasharray="3,2" />
          <line x1="154" y1="120" x2="290" y2="120" stroke="#f87171" strokeWidth="1.5" opacity="0.6" strokeDasharray="3,2" />
          <line x1="154" y1="124" x2="290" y2="120" stroke="#f87171" strokeWidth="1" opacity="0.5" strokeDasharray="3,2" />
          {/* Eye */}
          <ellipse cx="260" cy="120" rx="14" ry="18" fill="none" stroke="#52525b" strokeWidth="1.5" />
          {/* Retina line */}
          <line x1="270" y1="108" x2="270" y2="132" stroke="#52525b" strokeWidth="1" strokeDasharray="2,2" />
          {/* Focus dot BEHIND retina */}
          <circle cx="290" cy="120" r="3" fill="#f87171" />
          <text x="290" y="112" fill="#f87171" fontSize="7" textAnchor="middle">Behind</text>
          <text x="290" y="119" fill="#f87171" fontSize="7" textAnchor="middle">retina</text>
          <text x="256" y="138" fill="#f87171" fontSize="7" textAnchor="middle">→ elongation signal</text>
        </svg>
      </div>

      <div className="rounded-xl bg-amber-950/20 border border-amber-900/40 px-5 py-4">
        <p className="text-amber-200 font-semibold mb-1">
          The animal studies are unambiguous.
        </p>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Chicks, monkeys, and tree shrews all develop myopia when their vision
          is altered with corrective lenses. Controlled. Reproducible. Known
          since the 1970s. The optometry industry knows this. It just
          hasn&apos;t changed the clinical model.
        </p>
      </div>

      <QuizCard
        question="Why do eyes elongate under glasses used for close work?"
        options={[
          "Glasses are heavy and physically press on the eye over time",
          "The eye receives a defocus signal and grows to compensate",
          "Screen blue light damages the retina, causing elongation",
          "Genetics — elongation is predetermined regardless",
        ]}
        correct={1}
        explanation="When fully corrected lenses are used for near work, the focal point shifts behind the retina. The eye, attempting to achieve clear vision, elongates — the same mechanism documented in animal studies going back decades."
        onPass={() => setQuizPassed(true)}
      />

      {quizPassed && (
        <button
          onClick={onContinue}
          className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-xl py-4 transition-colors cursor-pointer"
        >
          Next: Follow the money →
        </button>
      )}
    </div>
  );
}

// ── Screen 4: Business Model ──────────────────────────────────────

function BusinessScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-widest text-amber-400 font-medium mb-3">
          The bigger picture
        </p>
        <h1 className="text-3xl font-bold text-zinc-100 leading-tight">
          $140 billion per year. And the product is your ongoing blur.
        </h1>
      </div>

      <p className="text-zinc-300 leading-relaxed">
        The global eyewear market is a{" "}
        <strong className="text-zinc-100">$140B/year subscription business</strong>
        . Not a fix-it business. A maintenance business.
      </p>

      <div className="space-y-2">
        {[
          "Your subscription gets stronger → you buy new lenses → you spend more",
          "One dark-room measurement per year → lifetime of dependency",
          "Zero financial incentive to teach you ciliary mechanics or pseudomyopia",
          "The system is not designed to produce fewer customers",
        ].map((point, i) => (
          <div
            key={i}
            className="flex gap-3 items-start px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800"
          >
            <span className="text-amber-400 text-sm mt-0.5">→</span>
            <p className="text-zinc-300 text-sm leading-relaxed">{point}</p>
          </div>
        ))}
      </div>

      {/* Subscription trap cycle diagram */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3 text-center">
          The loop you&apos;ve been in
        </p>
        <svg viewBox="0 0 280 200" className="w-full" style={{ height: 200 }}>
          {/* Four nodes in a cycle */}
          {[
            { x: 140, y: 24,  label: "Vision blurs",      sub: "ciliary strain",     color: "#f87171" },
            { x: 248, y: 100, label: "Get prescription",  sub: "max correction",     color: "#fb923c" },
            { x: 140, y: 176, label: "Eyes adapt",        sub: "axial elongation",   color: "#facc15" },
            { x: 32,  y: 100, label: "Worse blur",        sub: "renew subscription", color: "#f87171" },
          ].map((node, i) => (
            <g key={i}>
              <ellipse cx={node.x} cy={node.y} rx="46" ry="20" fill="#18181b" stroke={node.color} strokeWidth="1.5" strokeOpacity="0.6" />
              <text x={node.x} y={node.y - 3} textAnchor="middle" fill={node.color} fontSize="8.5" fontWeight="bold">{node.label}</text>
              <text x={node.x} y={node.y + 8} textAnchor="middle" fill="#52525b" fontSize="7">{node.sub}</text>
            </g>
          ))}
          {/* Arrows between nodes */}
          {/* Top → Right */}
          <path d="M 182 34 Q 220 50 236 82" fill="none" stroke="#52525b" strokeWidth="1.5" markerEnd="url(#arr)" />
          {/* Right → Bottom */}
          <path d="M 236 118 Q 220 150 182 166" fill="none" stroke="#52525b" strokeWidth="1.5" markerEnd="url(#arr)" />
          {/* Bottom → Left */}
          <path d="M 98 166 Q 60 150 44 118" fill="none" stroke="#52525b" strokeWidth="1.5" markerEnd="url(#arr)" />
          {/* Left → Top */}
          <path d="M 44 82 Q 60 50 98 34" fill="none" stroke="#52525b" strokeWidth="1.5" markerEnd="url(#arr)" />

          {/* Dollar signs */}
          <text x="248" y="68" textAnchor="middle" fill="#4ade80" fontSize="10" opacity="0.7">$$</text>
          <text x="248" y="136" textAnchor="middle" fill="#4ade80" fontSize="10" opacity="0.7">$$</text>

          {/* Center label */}
          <text x="140" y="96" textAnchor="middle" fill="#3f3f46" fontSize="9">repeat</text>
          <text x="140" y="108" textAnchor="middle" fill="#3f3f46" fontSize="9">forever</text>

          <defs>
            <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#52525b" />
            </marker>
          </defs>
        </svg>
      </div>

      <p className="text-zinc-400 leading-relaxed text-sm">
        This isn&apos;t a conspiracy. Most optometrists believe in what they do.
        It&apos;s a system optimized for selling correction, not achieving
        recovery — and those are two very different things.
      </p>

      <VideoPlaceholder
        label='"You Need Glasses" — A Profit Story'
        duration="2:10"
        videoId="n4fVDsGj7Vo"
      />

      {/* Hope payoff */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-950/10 p-5 space-y-3">
        <p className="text-amber-300 font-bold text-lg leading-tight">
          The loop has an exit.
        </p>
        <p className="text-zinc-300 text-sm leading-relaxed">
          The same biology that drove your eyes down can drive them back. People
          who understand the mechanism — and act on it — see measurable,
          documented improvement. Diopters. Real numbers. On an eye chart.
        </p>
        <p className="text-zinc-400 text-sm leading-relaxed">
          That&apos;s what Phase 2 is about. Not hope. Not supplements. Your
          eyes, your data, your measurements — starting right now.
        </p>
      </div>

      <div className="rounded-xl bg-zinc-900 border border-zinc-700 p-6 space-y-4 mt-2">
        <div className="text-center">
          <h2 className="text-xl font-bold text-zinc-100">
            You now know what 99% of glasses wearers don&apos;t.
          </h2>
          <p className="text-zinc-400 mt-2 text-sm leading-relaxed">
            The mechanism. The incentive. The window you were never told
            existed.
          </p>
        </div>

        <div className="border-t border-zinc-800 pt-4">
          <p className="text-zinc-300 text-sm text-center mb-4">
            Phase 2: learn to measure your own eyes — no equipment, no
            optometrist, no dark room.
          </p>
          <button
            onClick={onContinue}
            className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl py-4 transition-colors text-base cursor-pointer"
          >
            Start Phase 2: Your Eyes, Your Data →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Screen 5: The Optometrist Exam Exposed ────────────────────────

function ExamScreen({ onContinue }: { onContinue: () => void }) {
  const [quizPassed, setQuizPassed] = useState(false);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-widest text-amber-400 font-medium mb-3">
          Phase 2 · What the exam actually is
        </p>
        <h1 className="text-3xl font-bold text-zinc-100 leading-tight">
          One dark room. One moment. Maximum correction. That&apos;s the whole
          system.
        </h1>
      </div>

      <p className="text-zinc-300 leading-relaxed">
        The standard eye exam takes one measurement — in artificial lighting,
        after you&apos;ve been sitting in a waiting room, at a single moment in
        time. Then it hands you a lens strength you&apos;ll wear{" "}
        <em>every waking hour</em> for the next year.
      </p>

      <div className="space-y-2">
        {[
          {
            label: "Dark room only",
            detail:
              "Your ciliary muscle behaves differently in dim light. The exam captures max dilation — not your everyday state.",
          },
          {
            label: "Maximum correction",
            detail:
              "Optometrists are trained to give you the strongest lens you can tolerate without double vision. That's not the same as what you need.",
          },
          {
            label: "One moment in time",
            detail:
              "Your vision changes throughout the day — after screen time, after outdoor time, morning vs evening. The exam captures none of this.",
          },
          {
            label: "No baseline tracking",
            detail:
              "There's no chart of your daily variance. Just: last year's number, this year's number, here's a stronger lens.",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-3"
          >
            <p className="text-zinc-200 font-medium text-sm">{item.label}</p>
            <p className="text-zinc-500 text-sm mt-0.5 leading-relaxed">
              {item.detail}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-amber-950/20 border border-amber-900/40 px-5 py-4">
        <p className="text-amber-200 font-semibold mb-1">
          You&apos;re about to do something your optometrist never did.
        </p>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Measure your own blur point — at home, right now, in your normal
          environment. No dark room. No chart. No maximum correction. Just your
          actual eyes, today.
        </p>
      </div>

      <QuizCard
        question="What does the standard eye exam actually measure?"
        options={[
          "Your average vision across different times of day",
          "The minimum correction needed for comfortable daily vision",
          "Your blur point at one moment under artificial conditions",
          "The full range of your ciliary muscle function",
        ]}
        correct={2}
        explanation="The exam captures a single snapshot — in a dark room, at max dilation, optimized for maximum correction. It tells you nothing about how your eyes perform across a real day."
        onPass={() => setQuizPassed(true)}
      />

      {quizPassed && (
        <button
          onClick={onContinue}
          className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-xl py-4 transition-colors cursor-pointer"
        >
          Next: Measure your eyes →
        </button>
      )}
    </div>
  );
}

// ── Blur point input widget ───────────────────────────────────────

function BlurPointInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (cm: number) => void;
}) {
  const [mode, setMode] = useState<"card" | "manual">("card");
  const [cards, setCards] = useState(0);
  const [manualCm, setManualCm] = useState("");

  const CM_PER_CARD = 8.56;

  const adjustCards = (delta: number) => {
    const next = Math.max(0, cards + delta);
    setCards(next);
    if (next > 0) onChange(Math.round(next * CM_PER_CARD));
  };

  const cm = mode === "card" ? Math.round(cards * CM_PER_CARD) : parseFloat(manualCm) || 0;
  const diopters = cm > 0 ? (100 / cm).toFixed(2) : null;

  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 space-y-3">
      <p className="text-sm font-medium text-zinc-300">{label}</p>

      {mode === "card" ? (
        <>
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => adjustCards(-1)}
              disabled={cards === 0}
              className="w-12 h-12 rounded-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-zinc-100 text-2xl font-light transition-colors cursor-pointer flex items-center justify-center"
            >
              −
            </button>
            <div className="text-center flex-1">
              <p className="text-5xl font-bold text-zinc-100 tabular-nums">
                {cards}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                card{cards !== 1 ? "s" : ""}
              </p>
              {cm > 0 && (
                <p className="text-sm text-amber-400 mt-1">≈ {cm} cm</p>
              )}
            </div>
            <button
              onClick={() => adjustCards(1)}
              className="w-12 h-12 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-2xl font-light transition-colors cursor-pointer flex items-center justify-center"
            >
              +
            </button>
          </div>
          <button
            onClick={() => setMode("manual")}
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors w-full text-center cursor-pointer"
          >
            No card? Enter cm directly →
          </button>
        </>
      ) : (
        <>
          <div className="flex gap-3 items-center">
            <input
              type="number"
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="e.g. 30"
              value={manualCm}
              onChange={(e) => {
                setManualCm(e.target.value);
                const n = parseFloat(e.target.value);
                if (!isNaN(n) && n > 0) onChange(n);
              }}
            />
            <span className="text-zinc-500 text-sm">cm</span>
          </div>
          <button
            onClick={() => setMode("card")}
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer"
          >
            ← Use card counter
          </button>
        </>
      )}

      {diopters && (
        <div className="border-t border-zinc-800 pt-3 text-center">
          <p className="text-xs text-zinc-500 mb-0.5">your blur point</p>
          <p className="text-2xl font-bold text-amber-400">-{diopters} D</p>
          <p className="text-xs text-zinc-600 mt-0.5">100 ÷ {cm} cm</p>
        </div>
      )}
    </div>
  );
}

// ── Screen 6: Measure Your Eyes ───────────────────────────────────

function MeasureScreen({
  userData,
  onComplete,
}: {
  userData: UserData;
  onComplete: (leftCm: number, rightCm: number) => void;
}) {
  const [leftCm, setLeftCm] = useState<number | null>(null);
  const [rightCm, setRightCm] = useState<number | null>(null);
  const [step, setStep] = useState<"intro" | "measure">("intro");

  const canContinue = leftCm !== null && leftCm > 0 && rightCm !== null && rightCm > 0;

  if (step === "intro") {
    return (
      <div className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-400 font-medium mb-3">
            The centimeter method
          </p>
          <h1 className="text-3xl font-bold text-zinc-100 leading-tight">
            You&apos;re about to measure your own eyes. It takes 2 minutes.
          </h1>
        </div>

        <p className="text-zinc-400 leading-relaxed">
          This is called the <strong className="text-zinc-200">centimeter method</strong>.
          You find the point where things blur, measure the distance, and convert
          it to diopters with one formula:{" "}
          <strong className="text-amber-400">100 ÷ cm</strong>.
        </p>

        <div className="space-y-2">
          <p className="text-sm text-zinc-500 uppercase tracking-wider font-medium">What you need</p>
          {[
            {
              item: "A credit card or bank card",
              note: "Any card — store loyalty, library, transit. Standard size is 8.56 cm wide.",
            },
            {
              item: "No ruler? No problem",
              note: "You can enter cm directly if you have a ruler or measuring tape nearby.",
            },
            {
              item: "Your glasses off",
              note: "Contacts too, if you wear them. You're measuring your uncorrected eye.",
            },
          ].map((r, i) => (
            <div key={i} className="flex gap-3 items-start rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-3">
              <span className="text-amber-400 text-sm mt-0.5">✓</span>
              <div>
                <p className="text-zinc-200 text-sm font-medium">{r.item}</p>
                <p className="text-zinc-500 text-xs mt-0.5">{r.note}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-zinc-900 border border-zinc-700 px-5 py-4 space-y-3">
          <p className="text-sm font-medium text-zinc-300">How to measure</p>
          {[
            "Remove glasses and contacts",
            "Hold your phone at arm's length — text visible on screen",
            "Slowly bring it toward your face",
            "Stop the moment the text first blurs",
            "Hold still — count card widths from phone to eye",
            "Tap the counter for each card width",
          ].map((s, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-zinc-400 text-sm leading-relaxed">{s}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => setStep("measure")}
          className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-xl py-4 transition-colors cursor-pointer"
        >
          I&apos;m ready — glasses off →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-widest text-amber-400 font-medium mb-3">
          Measure now
        </p>
        <h1 className="text-2xl font-bold text-zinc-100 leading-tight">
          Glasses off. Find your blur point. Count the cards.
        </h1>
      </div>

      <div className="rounded-lg bg-zinc-900/60 border border-zinc-800 px-4 py-3 text-xs text-zinc-500 leading-relaxed">
        Hold text at arm's length → bring toward your face → stop at first blur
        → count credit card widths from text to your eye
      </div>

      <BlurPointInput
        label="Left eye (cover your right eye)"
        value={leftCm}
        onChange={setLeftCm}
      />

      <BlurPointInput
        label="Right eye (cover your left eye)"
        value={rightCm}
        onChange={setRightCm}
      />

      {canContinue && (
        <button
          onClick={() => onComplete(leftCm!, rightCm!)}
          className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-xl py-4 transition-colors cursor-pointer"
        >
          See what this means →
        </button>
      )}

      {!canContinue && (
        <p className="text-center text-xs text-zinc-600">
          Measure both eyes to continue
        </p>
      )}
    </div>
  );
}

// ── Screen 7: Calculator Reveal ───────────────────────────────────

function CalculatorScreen({
  userData,
  onContinue,
}: {
  userData: UserData;
  onContinue: () => void;
}) {
  const { leftCm, rightCm, leftEye, rightEye } = userData;

  const selfLeft = leftCm ? 100 / leftCm : null;
  const selfRight = rightCm ? 100 / rightCm : null;

  const diffLeft = selfLeft ? Math.abs(selfLeft) - Math.abs(leftEye) : null;
  const diffRight = selfRight ? Math.abs(selfRight) - Math.abs(rightEye) : null;
  const avgDiff = diffLeft !== null && diffRight !== null ? (diffLeft + diffRight) / 2 : null;

  const insight = () => {
    if (avgDiff === null) return null;
    if (avgDiff > 0.5)
      return "Your subscription is weaker than your current blur point. You may be in a high-strain period.";
    if (avgDiff < -0.5)
      return "Your eyes are actually clearer right now than your subscription assumes. This is common — and important.";
    return "Your self-measurement is close to your subscription strength. You measured at a fairly typical moment.";
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-widest text-amber-400 font-medium mb-3">
          Your numbers
        </p>
        <h1 className="text-2xl font-bold text-zinc-100 leading-tight">
          You just measured your own eyes. Here&apos;s what you got.
        </h1>
      </div>

      <div className="space-y-3">
        {[
          {
            eye: "Left eye",
            selfCm: leftCm,
            self: selfLeft,
            sub: leftEye,
            diff: diffLeft,
          },
          {
            eye: "Right eye",
            selfCm: rightCm,
            self: selfRight,
            sub: rightEye,
            diff: diffRight,
          },
        ].map((row) => (
          <div key={row.eye} className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 mb-3">{row.eye}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="text-xs text-zinc-600 mb-1">Self-measured</p>
                <p className="text-2xl font-bold text-amber-400">
                  -{row.self ? row.self.toFixed(2) : "—"} D
                </p>
                {row.selfCm && (
                  <p className="text-xs text-zinc-600 mt-0.5">
                    100 ÷ {Math.round(row.selfCm)} cm
                  </p>
                )}
              </div>
              <div className="text-center">
                <p className="text-xs text-zinc-600 mb-1">Your subscription</p>
                <p className="text-2xl font-bold text-zinc-400">
                  {row.sub.toFixed(2)} D
                </p>
                <p className="text-xs text-zinc-600 mt-0.5">optometrist exam</p>
              </div>
            </div>
            {row.diff !== null && (
              <div className="mt-3 border-t border-zinc-800 pt-3">
                <p className="text-xs text-center text-zinc-500">
                  Difference:{" "}
                  <span className={Math.abs(row.diff) > 0.25 ? "text-amber-400" : "text-zinc-400"}>
                    {row.diff > 0 ? "+" : ""}
                    {row.diff.toFixed(2)} D
                  </span>
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {insight() && (
        <div className="rounded-xl bg-amber-950/20 border border-amber-900/40 px-5 py-4">
          <p className="text-amber-200 text-sm leading-relaxed">{insight()}</p>
        </div>
      )}

      <p className="text-zinc-400 text-sm leading-relaxed">
        This is one measurement, at one moment in your day. That&apos;s exactly
        what makes it interesting — because your eyes are{" "}
        <strong className="text-zinc-200">not a fixed number</strong>. They
        change. And that variability is the first real signal that improvement is
        possible.
      </p>

      <button
        onClick={onContinue}
        className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-xl py-4 transition-colors cursor-pointer"
      >
        Next: What this variability means →
      </button>
    </div>
  );
}

// ── Screen 8: The Invitation ──────────────────────────────────────

function InvitationScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-widest text-amber-400 font-medium mb-3">
          The pattern
        </p>
        <h1 className="text-3xl font-bold text-zinc-100 leading-tight">
          Your vision is not a fixed number. It never was.
        </h1>
      </div>

      <p className="text-zinc-300 leading-relaxed">
        What you just measured is a snapshot. If you measured again right now —
        other eye first, different lighting, after a glass of water — you&apos;d
        get a slightly different number.
      </p>

      <div className="space-y-2">
        {[
          {
            time: "Morning (just woken up)",
            note: "Often clearest — ciliary muscle rested, minimal screen strain",
          },
          {
            time: "After 2+ hours of screens",
            note: "Often blurriest — muscle contracted, pseudomyopia at its peak",
          },
          {
            time: "After 30 min outdoors",
            note: "Usually noticeably clearer — distance viewing relaxes the muscle",
          },
          {
            time: "Evening",
            note: "Depends on your day — accumulated strain vs recovery time",
          },
        ].map((item, i) => (
          <div key={i} className="flex gap-3 items-start rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-3">
            <span className="text-amber-400 text-sm mt-0.5">→</span>
            <div>
              <p className="text-zinc-200 text-sm font-medium">{item.time}</p>
              <p className="text-zinc-500 text-xs mt-0.5">{item.note}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-zinc-900 border border-zinc-700 p-5 space-y-3">
        <p className="text-zinc-200 font-semibold">
          Your experiment for today:
        </p>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Measure again at a different time of day. Morning if you just measured
          evening. After screens if you&apos;re fresh. After a walk. See if the
          number moves.
        </p>
        <p className="text-zinc-400 text-sm leading-relaxed">
          That movement is your first real evidence. Not from a study. From your
          own eyes.
        </p>
      </div>

      <div className="rounded-xl bg-amber-950/20 border border-amber-900/40 px-5 py-4">
        <p className="text-amber-200 font-semibold mb-1">Phase 3: The Experiment</p>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Track your measurements over time. See your pattern. Understand what
          affects your vision. This is where the data starts telling a story.
        </p>
      </div>

      <button
        onClick={onContinue}
        className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl py-4 transition-colors cursor-pointer"
      >
        Start Phase 3: The Experiment →
      </button>
    </div>
  );
}

// ── Phase 3 Placeholder ───────────────────────────────────────────

function Phase3Placeholder() {
  return (
    <div className="space-y-5 py-6">
      <div className="text-center">
        <div className="text-5xl mb-4">📈</div>
        <h1 className="text-2xl font-bold text-zinc-100">Phase 3 is coming.</h1>
        <p className="text-zinc-400 mt-3 leading-relaxed">
          Next you&apos;ll track measurements over time, see your personal
          pattern, and discover what actually affects your vision day to day.
        </p>
      </div>
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 px-5 py-4 space-y-2">
        <p className="text-sm text-zinc-400 font-medium mb-3">In Phase 3 you&apos;ll:</p>
        {[
          "Log measurements in seconds (L cm, R cm, save)",
          "See your 7-day chart build in real time",
          "Discover your personal strain triggers",
          "Watch the variability become a pattern",
        ].map((item, i) => (
          <div key={i} className="flex gap-2 items-start">
            <span className="text-amber-400 text-sm mt-0.5">✓</span>
            <p className="text-zinc-400 text-sm">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Orchestrator ──────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState(0);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("em-progress");
      if (saved) {
        const { screen: s, userData: u } = JSON.parse(saved);
        if (typeof s === "number") setScreen(s);
        if (u) setUserData(u);
      }
    } catch {}
    setHydrated(true);
  }, []);

  const advance = (nextScreen: number, newUserData?: UserData) => {
    const nextUserData = newUserData ?? userData;
    setScreen(nextScreen);
    if (newUserData) setUserData(newUserData);
    try {
      localStorage.setItem(
        "em-progress",
        JSON.stringify({ screen: nextScreen, userData: nextUserData })
      );
    } catch {}
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const reset = () => {
    try { localStorage.removeItem("em-progress"); } catch {}
    setScreen(0);
    setUserData(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!hydrated) return null;

  const isPhase1 = screen >= 0 && screen <= 4;
  const isPhase2 = screen >= 5 && screen <= 8;

  return (
    <main className="flex-1 flex flex-col">
      <div className="max-w-lg mx-auto w-full px-5 pb-16">
        {screen > 0 && (
          <div className="flex justify-end pt-4 -mb-2">
            <button
              onClick={reset}
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer"
            >
              ↩ Start over
            </button>
          </div>
        )}

        {isPhase1 && <ProgressDots total={5} current={screen} />}
        {isPhase2 && <ProgressDots total={4} current={screen - 5} />}

        {screen === 0 && <InputScreen onComplete={(d) => advance(1, d)} />}
        {screen === 1 && userData && (
          <ShockScreen userData={userData} onContinue={() => advance(2)} />
        )}
        {screen === 2 && <BiologyScreen onContinue={() => advance(3)} />}
        {screen === 3 && <CauseScreen onContinue={() => advance(4)} />}
        {screen === 4 && <BusinessScreen onContinue={() => advance(5)} />}
        {screen === 5 && <ExamScreen onContinue={() => advance(6)} />}
        {screen === 6 && userData && (
          <MeasureScreen
            userData={userData}
            onComplete={(l, r) =>
              advance(7, { ...userData, leftCm: l, rightCm: r })
            }
          />
        )}
        {screen === 7 && userData && (
          <CalculatorScreen userData={userData} onContinue={() => advance(8)} />
        )}
        {screen === 8 && <InvitationScreen onContinue={() => advance(9)} />}
        {screen === 9 && <Phase3Placeholder />}
      </div>
    </main>
  );
}
