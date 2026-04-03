"use client";

import { useState, useEffect } from "react";
import VideoPlaceholder from "@/components/VideoPlaceholder";
import QuizCard from "@/components/QuizCard";
import ProgressDots from "@/components/ProgressDots";
import ProgressionChart from "@/components/ProgressionChart";
import Tracker from "@/components/Tracker";
import AssessmentFlow from "@/components/AssessmentFlow";
import { Assessment, saveAssessment, loadAssessment, clearAssessment } from "@/lib/assessment";

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
    <div className="rounded-lg border-l-2 border-blue-500 bg-white/60 px-4 py-3 text-sm text-slate-500">
      <span className="text-slate-800 font-medium">Note:</span> We don&apos;t
      call them prescriptions here. A prescription fixes something. What you
      were given is a{" "}
      <span className="text-blue-600 font-semibold">subscription</span> —
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
    "w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors";
  const labelCls = "block text-sm text-slate-500 mb-1.5";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-blue-600 font-medium mb-3">
          Phase 1 of 5
        </p>
        <h1 className="text-3xl font-bold text-slate-900 leading-tight">
          Before we start, I need a few numbers.
        </h1>
        <p className="text-slate-500 mt-3 leading-relaxed">
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
            <p className="text-xs text-slate-400 mb-1.5">Left eye (OS)</p>
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
            <p className="text-xs text-slate-400 mb-1.5">Right eye (OD)</p>
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
        <p className="text-xs text-slate-300 mt-2">
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
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl py-4 transition-colors text-base cursor-pointer"
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
        <p className="text-xs uppercase tracking-widest text-blue-600 font-medium mb-3">
          The math they never ran for you
        </p>
        <h1 className="text-3xl font-bold text-slate-900 leading-tight">
          Your eyes got approximately{" "}
          <span className="text-blue-600">~{progression}D worse</span> while
          under professional care.
        </h1>
      </div>

      <ProgressionChart
        years={userData.years}
        leftEye={userData.leftEye}
        rightEye={userData.rightEye}
      />

      <div className="rounded-xl bg-white border border-slate-200 px-5 py-4 text-sm text-slate-500 leading-relaxed">
        <strong className="text-slate-800">How this is calculated:</strong>{" "}
        Average myopia progression under standard full correction is ~0.5D per
        year. You&apos;ve been subscribed for {userData.years} years. Your
        subscription currently averages{" "}
        <strong className="text-slate-800">-{avgStr}D</strong>. The math lines
        up.
      </div>

      <p className="text-slate-700 leading-relaxed">
        This is not a coincidence. This is the{" "}
        <em>expected outcome</em> of the standard treatment model — and nobody
        told you.
      </p>

      <div className="rounded-xl bg-white border border-blue-200 px-5 py-4">
        <p className="text-xs text-blue-600 uppercase tracking-widest font-medium mb-1">
          But here&apos;s what they also didn&apos;t tell you
        </p>
        <p className="text-slate-700 text-sm leading-relaxed">
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
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl py-4 transition-colors cursor-pointer"
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
        <p className="text-xs uppercase tracking-widest text-blue-600 font-medium mb-3">
          How your eye actually works
        </p>
        <h1 className="text-3xl font-bold text-slate-900 leading-tight">
          Your eye isn&apos;t broken. It&apos;s responding perfectly to the
          wrong signal.
        </h1>
      </div>

      <VideoPlaceholder
        label="Is Bad Eyesight Genetic? Why You Are Nearsighted"
        duration="1:58"
        videoId="h0XmmsZpXNk"
      />

      <p className="text-slate-700 leading-relaxed">
        Inside your eye is the{" "}
        <strong className="text-slate-900">ciliary muscle</strong> — a ring of
        muscle that controls the shape of your lens. When you look close, it
        contracts. When you look far, it relaxes.
      </p>

      <p className="text-slate-700 leading-relaxed">
        After hours of close-up work — screens, books, anything under a meter —
        this muscle can get stuck in a contracted state. It can&apos;t fully
        relax. Result: blur at distance.
      </p>

      <div className="rounded-xl bg-blue-50 border border-blue-200 px-5 py-4">
        <p className="text-blue-700 font-semibold mb-1">
          This is called pseudomyopia.
        </p>
        <p className="text-slate-500 text-sm leading-relaxed">
          It&apos;s the first stage of myopia — and at this stage,{" "}
          <strong className="text-slate-700">
            it&apos;s completely reversible
          </strong>
          . The eyeball hasn&apos;t changed. It&apos;s just a muscle spasm.
        </p>
      </div>

      <p className="text-slate-500 leading-relaxed text-sm">
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
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl py-4 transition-colors cursor-pointer"
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
        <p className="text-xs uppercase tracking-widest text-blue-600 font-medium mb-3">
          The mechanism
        </p>
        <h1 className="text-3xl font-bold text-slate-900 leading-tight">
          Full distance correction. Used for close-up work. Your eye elongates.
        </h1>
      </div>

      <VideoPlaceholder
        label="How Glasses Make Your Eyesight Worse"
        duration="1:38"
        videoId="zJJQdue_mzc"
      />

      <p className="text-slate-700 leading-relaxed">
        When you wear your full distance subscription and look at a screen 50cm
        away, your eye receives a{" "}
        <strong className="text-slate-900">defocus signal</strong>. The image is
        forming slightly behind the retina.
      </p>

      <p className="text-slate-700 leading-relaxed">
        Your eye interprets this as:{" "}
        <em className="text-slate-800">
          &ldquo;I need to grow to bring that focal point forward.&rdquo;
        </em>{" "}
        So it does. Axial elongation. More myopia. Stronger subscription at your
        next renewal. Repeat forever.
      </p>

      {/* Focal point diagram */}
      <div className="rounded-xl bg-white border border-slate-200 p-4">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">
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

      <div className="rounded-xl bg-blue-50 border border-blue-200 px-5 py-4">
        <p className="text-blue-700 font-semibold mb-1">
          The animal studies are unambiguous.
        </p>
        <p className="text-slate-500 text-sm leading-relaxed">
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
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl py-4 transition-colors cursor-pointer"
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
        <p className="text-xs uppercase tracking-widest text-blue-600 font-medium mb-3">
          The bigger picture
        </p>
        <h1 className="text-3xl font-bold text-slate-900 leading-tight">
          $140 billion per year. And the product is your ongoing blur.
        </h1>
      </div>

      <p className="text-slate-700 leading-relaxed">
        The global eyewear market is a{" "}
        <strong className="text-slate-900">$140B/year subscription business</strong>
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
            className="flex gap-3 items-start px-4 py-3 rounded-lg bg-white border border-slate-200"
          >
            <span className="text-blue-600 text-sm mt-0.5">→</span>
            <p className="text-slate-700 text-sm leading-relaxed">{point}</p>
          </div>
        ))}
      </div>

      {/* Subscription trap cycle diagram */}
      <div className="rounded-xl bg-white border border-slate-200 p-4">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-3 text-center">
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

      <p className="text-slate-500 leading-relaxed text-sm">
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
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 space-y-3">
        <p className="text-blue-700 font-bold text-lg leading-tight">
          The loop has an exit.
        </p>
        <p className="text-slate-700 text-sm leading-relaxed">
          The same biology that drove your eyes down can drive them back. People
          who understand the mechanism — and act on it — see measurable,
          documented improvement. Diopters. Real numbers. On an eye chart.
        </p>
        <p className="text-slate-500 text-sm leading-relaxed">
          That&apos;s what Phase 2 is about. Not hope. Not supplements. Your
          eyes, your data, your measurements — starting right now.
        </p>
      </div>

      <div className="rounded-xl bg-white border border-slate-300 p-6 space-y-4 mt-2">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900">
            You now know what 99% of glasses wearers don&apos;t.
          </h2>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed">
            The mechanism. The incentive. The window you were never told
            existed.
          </p>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <p className="text-slate-700 text-sm text-center mb-4">
            Phase 2: learn to measure your own eyes — no equipment, no
            optometrist, no dark room.
          </p>
          <button
            onClick={onContinue}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl py-4 transition-colors text-base cursor-pointer"
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
        <p className="text-xs uppercase tracking-widest text-blue-600 font-medium mb-3">
          Phase 2 · What the exam actually is
        </p>
        <h1 className="text-3xl font-bold text-slate-900 leading-tight">
          One dark room. One moment. Maximum correction. That&apos;s the whole
          system.
        </h1>
      </div>

      <p className="text-slate-700 leading-relaxed">
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
            className="rounded-lg bg-white border border-slate-200 px-4 py-3"
          >
            <p className="text-slate-800 font-medium text-sm">{item.label}</p>
            <p className="text-slate-400 text-sm mt-0.5 leading-relaxed">
              {item.detail}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-blue-50 border border-blue-200 px-5 py-4">
        <p className="text-blue-700 font-semibold mb-1">
          You&apos;re about to do something your optometrist never did.
        </p>
        <p className="text-slate-500 text-sm leading-relaxed">
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
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl py-4 transition-colors cursor-pointer"
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
    <div className="rounded-xl bg-white border border-slate-200 p-4 space-y-3">
      <p className="text-sm font-medium text-slate-700">{label}</p>

      {mode === "card" ? (
        <>
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => adjustCards(-1)}
              disabled={cards === 0}
              className="w-12 h-12 rounded-full bg-slate-100 hover:bg-zinc-700 disabled:opacity-30 text-slate-900 text-2xl font-light transition-colors cursor-pointer flex items-center justify-center"
            >
              −
            </button>
            <div className="text-center flex-1">
              <p className="text-5xl font-bold text-slate-900 tabular-nums">
                {cards}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                card{cards !== 1 ? "s" : ""}
              </p>
              {cm > 0 && (
                <p className="text-sm text-blue-600 mt-1">≈ {cm} cm</p>
              )}
            </div>
            <button
              onClick={() => adjustCards(1)}
              className="w-12 h-12 rounded-full bg-slate-100 hover:bg-zinc-700 text-slate-900 text-2xl font-light transition-colors cursor-pointer flex items-center justify-center"
            >
              +
            </button>
          </div>
          <button
            onClick={() => setMode("manual")}
            className="text-xs text-slate-300 hover:text-slate-500 transition-colors w-full text-center cursor-pointer"
          >
            No card? Enter cm directly →
          </button>
        </>
      ) : (
        <>
          <div className="flex gap-3 items-center">
            <input
              type="number"
              className="flex-1 bg-slate-100 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="e.g. 30"
              value={manualCm}
              onChange={(e) => {
                setManualCm(e.target.value);
                const n = parseFloat(e.target.value);
                if (!isNaN(n) && n > 0) onChange(n);
              }}
            />
            <span className="text-slate-400 text-sm">cm</span>
          </div>
          <button
            onClick={() => setMode("card")}
            className="text-xs text-slate-300 hover:text-slate-500 transition-colors cursor-pointer"
          >
            ← Use card counter
          </button>
        </>
      )}

      {diopters && (
        <div className="border-t border-slate-200 pt-3 text-center">
          <p className="text-xs text-slate-400 mb-0.5">your blur point</p>
          <p className="text-2xl font-bold text-blue-600">-{diopters} D</p>
          <p className="text-xs text-slate-300 mt-0.5">100 ÷ {cm} cm</p>
        </div>
      )}
    </div>
  );
}

// ── Screen 6: Measure Your Eyes ───────────────────────────────────

function MeasureScreen({
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
          <p className="text-xs uppercase tracking-widest text-blue-600 font-medium mb-3">
            The centimeter method
          </p>
          <h1 className="text-3xl font-bold text-slate-900 leading-tight">
            You&apos;re about to measure your own eyes. It takes 2 minutes.
          </h1>
        </div>

        <p className="text-slate-500 leading-relaxed">
          This is called the <strong className="text-slate-800">centimeter method</strong>.
          You find the point where things blur, measure the distance, and convert
          it to diopters with one formula:{" "}
          <strong className="text-blue-600">100 ÷ cm</strong>.
        </p>

        <div className="space-y-2">
          <p className="text-sm text-slate-400 uppercase tracking-wider font-medium">What you need</p>
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
            <div key={i} className="flex gap-3 items-start rounded-lg bg-white border border-slate-200 px-4 py-3">
              <span className="text-blue-600 text-sm mt-0.5">✓</span>
              <div>
                <p className="text-slate-800 text-sm font-medium">{r.item}</p>
                <p className="text-slate-400 text-xs mt-0.5">{r.note}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-white border border-slate-300 px-5 py-4 space-y-3">
          <p className="text-sm font-medium text-slate-700">How to measure</p>
          {[
            "Remove glasses and contacts",
            "Hold your phone at arm's length — text visible on screen",
            "Slowly bring it toward your face",
            "Stop the moment the text first blurs",
            "Hold still — count card widths from phone to eye",
            "Tap the counter for each card width",
          ].map((s, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-600 text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-slate-500 text-sm leading-relaxed">{s}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => setStep("measure")}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl py-4 transition-colors cursor-pointer"
        >
          I&apos;m ready — glasses off →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-widest text-blue-600 font-medium mb-3">
          Measure now
        </p>
        <h1 className="text-2xl font-bold text-slate-900 leading-tight">
          Glasses off. Find your blur point. Count the cards.
        </h1>
      </div>

      <div className="rounded-lg bg-white/60 border border-slate-200 px-4 py-3 text-xs text-slate-400 leading-relaxed">
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
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl py-4 transition-colors cursor-pointer"
        >
          See what this means →
        </button>
      )}

      {!canContinue && (
        <p className="text-center text-xs text-slate-300">
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
        <p className="text-xs uppercase tracking-widest text-blue-600 font-medium mb-3">
          Your numbers
        </p>
        <h1 className="text-2xl font-bold text-slate-900 leading-tight">
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
          <div key={row.eye} className="rounded-xl bg-white border border-slate-200 p-4">
            <p className="text-xs text-slate-400 mb-3">{row.eye}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="text-xs text-slate-300 mb-1">Self-measured</p>
                <p className="text-2xl font-bold text-blue-600">
                  -{row.self ? row.self.toFixed(2) : "—"} D
                </p>
                {row.selfCm && (
                  <p className="text-xs text-slate-300 mt-0.5">
                    100 ÷ {Math.round(row.selfCm)} cm
                  </p>
                )}
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-300 mb-1">Your subscription</p>
                <p className="text-2xl font-bold text-slate-500">
                  {row.sub.toFixed(2)} D
                </p>
                <p className="text-xs text-slate-300 mt-0.5">optometrist exam</p>
              </div>
            </div>
            {row.diff !== null && (
              <div className="mt-3 border-t border-slate-200 pt-3">
                <p className="text-xs text-center text-slate-400">
                  Difference:{" "}
                  <span className={Math.abs(row.diff) > 0.25 ? "text-blue-600" : "text-slate-500"}>
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
        <div className="rounded-xl bg-blue-50 border border-blue-200 px-5 py-4">
          <p className="text-blue-700 text-sm leading-relaxed">{insight()}</p>
        </div>
      )}

      <p className="text-slate-500 text-sm leading-relaxed">
        This is one measurement, at one moment in your day. That&apos;s exactly
        what makes it interesting — because your eyes are{" "}
        <strong className="text-slate-800">not a fixed number</strong>. They
        change. And that variability is the first real signal that improvement is
        possible.
      </p>

      <button
        onClick={onContinue}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl py-4 transition-colors cursor-pointer"
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
        <p className="text-xs uppercase tracking-widest text-blue-600 font-medium mb-3">
          The pattern
        </p>
        <h1 className="text-3xl font-bold text-slate-900 leading-tight">
          Your vision is not a fixed number. It never was.
        </h1>
      </div>

      <p className="text-slate-700 leading-relaxed">
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
          <div key={i} className="flex gap-3 items-start rounded-lg bg-white border border-slate-200 px-4 py-3">
            <span className="text-blue-600 text-sm mt-0.5">→</span>
            <div>
              <p className="text-slate-800 text-sm font-medium">{item.time}</p>
              <p className="text-slate-400 text-xs mt-0.5">{item.note}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-white border border-slate-300 p-5 space-y-3">
        <p className="text-slate-800 font-semibold">
          Your experiment for today:
        </p>
        <p className="text-slate-500 text-sm leading-relaxed">
          Measure again at a different time of day. Morning if you just measured
          evening. After screens if you&apos;re fresh. After a walk. See if the
          number moves.
        </p>
        <p className="text-slate-500 text-sm leading-relaxed">
          That movement is your first real evidence. Not from a study. From your
          own eyes.
        </p>
      </div>

      <div className="rounded-xl bg-blue-50 border border-blue-200 px-5 py-4">
        <p className="text-blue-700 font-semibold mb-1">Phase 3: The Experiment</p>
        <p className="text-slate-500 text-sm leading-relaxed">
          Track your measurements over time. See your pattern. Understand what
          affects your vision. This is where the data starts telling a story.
        </p>
      </div>

      <button
        onClick={onContinue}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl py-4 transition-colors cursor-pointer"
      >
        Start Phase 3: The Experiment →
      </button>
    </div>
  );
}

// ── Screen 10: The Strain Signal ─────────────────────────────────

function StrainSignalScreen({
  onContinue,
}: {
  userData: UserData;
  onContinue: () => void;
}) {
  const [quizPassed, setQuizPassed] = useState(false);

  // Pull strain range from localStorage measurements if available
  const strainRange = (() => {
    try {
      const raw = localStorage.getItem("em-measurements");
      if (!raw) return null;
      const ms: { leftCm: number; ts: number }[] = JSON.parse(raw);
      if (ms.length < 2) return null;
      const diopters = ms.map((m) => 100 / m.leftCm);
      const best = Math.min(...diopters);
      const worst = Math.max(...diopters);
      return worst - best > 0.05 ? (worst - best).toFixed(2) : null;
    } catch {
      return null;
    }
  })();

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-widest text-blue-600 font-medium mb-3">
          Phase 4 · Understanding strain
        </p>
        <h1 className="text-3xl font-bold text-slate-900 leading-tight">
          Your ciliary muscle is sending you signals. You just don&apos;t know
          how to read them yet.
        </h1>
      </div>

      <p className="text-slate-700 leading-relaxed">
        Every hour of screen time with your full distance subscription is
        forcing your ciliary muscle to over-accommodate. It slowly locks into
        a contracted state — and your vision gets measurably worse as the
        day goes on.
      </p>

      {strainRange ? (
        <div className="rounded-xl border border-blue-300 bg-blue-50 px-5 py-4">
          <p className="text-xs text-blue-600 uppercase tracking-wider font-medium mb-1">
            Your data confirms it
          </p>
          <p className="text-slate-800 leading-relaxed">
            Across your logged measurements, your left eye has varied by{" "}
            <strong className="text-blue-600">{strainRange}D</strong>. That
            range is your ciliary strain — the difference between your relaxed
            eye and your strained one.
          </p>
        </div>
      ) : (
        <div className="rounded-xl bg-white border border-slate-200 px-5 py-4">
          <p className="text-slate-500 text-sm leading-relaxed">
            The more measurements you log at different times of day, the more
            clearly you&apos;ll see this pattern in your own data.
          </p>
        </div>
      )}

      <p className="text-slate-700 leading-relaxed">
        The problem: you can&apos;t feel it happening. By the time your vision
        is noticeably blurrier at the end of the day, you&apos;ve already been
        in strain for hours. You need a{" "}
        <strong className="text-slate-900">real-time signal</strong>.
      </p>

      <div className="rounded-xl bg-blue-50 border border-blue-200 px-5 py-4">
        <p className="text-blue-700 font-semibold mb-1">
          That signal is an eye chart.
        </p>
        <p className="text-slate-500 text-sm leading-relaxed">
          Not for measuring. For monitoring. Placed at the right distance, it
          becomes a live readout of your ciliary muscle state — blurring
          gradually as strain builds, clearing up when you recover.
        </p>
      </div>

      {/* Strain visual */}
      <div className="rounded-xl bg-white border border-slate-200 p-4">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-3 text-center">
          What strain looks like over a work session
        </p>
        <svg viewBox="0 0 300 90" className="w-full" style={{ height: 90 }}>
          {/* Axes */}
          <line x1="36" y1="8" x2="36" y2="66" stroke="#3f3f46" strokeWidth="1" />
          <line x1="36" y1="66" x2="290" y2="66" stroke="#3f3f46" strokeWidth="1" />

          {/* Y labels */}
          <text x="32" y="12" textAnchor="end" fill="#52525b" fontSize="7">Blurry</text>
          <text x="32" y="64" textAnchor="end" fill="#52525b" fontSize="7">Clear</text>

          {/* Strain curve — climbs then recovery dip */}
          <path
            d="M 40 62 C 80 60, 120 48, 160 30 C 180 22, 195 18, 200 18 L 205 18 C 210 18, 215 22, 220 28 C 235 46, 255 56, 290 60"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Break zone shading */}
          <rect x="200" y="8" width="30" height="58" fill="#4ade80" fillOpacity="0.06" />
          <line x1="200" y1="8" x2="200" y2="66" stroke="#4ade80" strokeWidth="1" strokeDasharray="3,2" strokeOpacity="0.4" />
          <line x1="230" y1="8" x2="230" y2="66" stroke="#4ade80" strokeWidth="1" strokeDasharray="3,2" strokeOpacity="0.4" />
          <text x="215" y="6" textAnchor="middle" fill="#4ade80" fontSize="6" opacity="0.7">break</text>

          {/* "Chart starts blurring" annotation */}
          <circle cx="160" cy="30" r="3" fill="#f87171" />
          <text x="158" y="25" textAnchor="middle" fill="#f87171" fontSize="6.5">chart blurs</text>

          {/* X labels */}
          <text x="40" y="78" textAnchor="middle" fill="#52525b" fontSize="7">Start</text>
          <text x="160" y="78" textAnchor="middle" fill="#52525b" fontSize="7">~45 min</text>
          <text x="290" y="78" textAnchor="middle" fill="#52525b" fontSize="7">After break</text>
        </svg>
      </div>

      <QuizCard
        question="Why does vision get worse during a long screen session?"
        options={[
          "Blue light from screens damages the retina over time",
          "Eyes dry out, causing optical distortion",
          "The ciliary muscle locks in contraction, shortening the blur point",
          "Blood pressure drops from sitting too long",
        ]}
        correct={2}
        explanation="As you focus at near distances, the ciliary muscle stays contracted. Over time it loses the ability to fully relax — a temporary state called pseudomyopia. Your blur point shortens, and anything further away gets hazier."
        onPass={() => setQuizPassed(true)}
      />

      {quizPassed && (
        <button
          onClick={onContinue}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl py-4 transition-colors cursor-pointer"
        >
          Next: Set up your strain monitor →
        </button>
      )}
    </div>
  );
}

// ── Screen 11: Set Up Your Eye Chart ─────────────────────────────

function EyeChartSetupScreen({
  userData,
  onContinue,
}: {
  userData: UserData;
  onContinue: () => void;
}) {
  // Calculate ideal chart distance: 40% beyond their measured blur point
  const avgCm = userData.leftCm && userData.rightCm
    ? (userData.leftCm + userData.rightCm) / 2
    : 100 / Math.abs((userData.leftEye + userData.rightEye) / 2);

  const chartCm = Math.round(avgCm * 1.45 / 5) * 5; // round to nearest 5cm
  const chartFt = (chartCm / 30.48).toFixed(1);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-widest text-blue-600 font-medium mb-3">
          Your strain monitor
        </p>
        <h1 className="text-3xl font-bold text-slate-900 leading-tight">
          One eye chart. One wall. One new habit.
        </h1>
      </div>

      <p className="text-slate-700 leading-relaxed">
        A standard Snellen eye chart costs nothing to print. Placed at the
        right distance from your workspace, it becomes the most useful tool
        you&apos;ll own for managing screen strain.
      </p>

      {/* Calculated distance */}
      <div className="rounded-xl border border-blue-300 bg-blue-50 px-5 py-5 text-center">
        <p className="text-xs text-blue-600 uppercase tracking-wider font-medium mb-2">
          Your calculated chart distance
        </p>
        <p className="text-5xl font-bold text-slate-900">{chartCm}<span className="text-2xl text-slate-500 ml-1">cm</span></p>
        <p className="text-slate-400 text-sm mt-1">{chartFt} feet</p>
        <p className="text-slate-500 text-xs mt-3 leading-relaxed">
          Based on your blur point of ~{Math.round(avgCm)}cm. At this distance
          you should be able to read some lines clearly — but not all. That
          margin is what makes it useful.
        </p>
      </div>

      {/* Setup steps */}
      <div className="space-y-2">
        <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Setup</p>
        {[
          {
            step: "Print a free Snellen chart",
            detail: "Search \u201cSnellen eye chart PDF\u201d \u2014 any standard one works. Print at 100% scale, no scaling.",
          },
          {
            step: `Tape it at ${chartCm}cm from your eyes`,
            detail: "Measure from where your eyes sit at your desk. Wall directly ahead is ideal.",
          },
          {
            step: "Glasses off (or differentials on)",
            detail: "The chart only works as a strain monitor without your full distance subscription.",
          },
          {
            step: "Find your baseline line",
            detail: "The lowest line you can read clearly right now — before screens. That's your reference.",
          },
          {
            step: "Check it every 20–30 minutes",
            detail: "One glance. Can you still read your baseline line? If it blurs — strain is building.",
          },
        ].map((item, i) => (
          <div key={i} className="flex gap-3 items-start rounded-lg bg-white border border-slate-200 px-4 py-3">
            <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-600 text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
              {i + 1}
            </span>
            <div>
              <p className="text-slate-800 text-sm font-medium">{item.step}</p>
              <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-white border border-slate-200 px-5 py-4">
        <p className="text-blue-700 text-sm font-semibold mb-1">The rule is simple</p>
        <p className="text-slate-500 text-sm leading-relaxed">
          When your baseline line starts to blur → your ciliary is locking up
          → it&apos;s time for a break. Not in 10 minutes. Now. The longer you
          push through, the longer it takes to recover.
        </p>
      </div>

      <button
        onClick={onContinue}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl py-4 transition-colors cursor-pointer"
      >
        Next: Build your break schedule →
      </button>
    </div>
  );
}

// ── Screen 12: Break Schedule Builder ────────────────────────────

function BreakScheduleScreen({ onContinue }: { onContinue: () => void }) {
  const [strainMins, setStrainMins] = useState<number | null>(null);
  const [recoveryMins, setRecoveryMins] = useState<number | null>(null);
  const [scheduleReady, setScheduleReady] = useState(false);

  const canBuild = strainMins !== null && strainMins > 0
    && recoveryMins !== null && recoveryMins > 0;

  const build = () => {
    if (!canBuild) return;
    try {
      localStorage.setItem("em-break-schedule", JSON.stringify({ strainMins, recoveryMins, savedAt: Date.now() }));
    } catch {}
    setScheduleReady(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sliderCls = "w-full accent-amber-500";

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-widest text-blue-600 font-medium mb-3">
          Your break schedule
        </p>
        <h1 className="text-3xl font-bold text-slate-900 leading-tight">
          {scheduleReady ? "Your schedule." : "Let\u2019s find your numbers."}
        </h1>
      </div>

      {!scheduleReady ? (
        <>
          <p className="text-slate-500 leading-relaxed text-sm">
            Set up your eye chart, then work normally. Come back here once
            you&apos;ve observed your pattern. These two numbers are all we need.
          </p>

          {/* Strain onset */}
          <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-4">
            <div>
              <p className="text-slate-800 font-medium mb-1">
                How many minutes before your chart starts to blur?
              </p>
              <p className="text-slate-400 text-xs">
                From the start of a fresh work session — glasses off, rested eyes.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={5}
                max={120}
                step={5}
                value={strainMins ?? 45}
                onChange={(e) => setStrainMins(parseInt(e.target.value))}
                className={sliderCls}
              />
              <span className="text-2xl font-bold text-blue-600 w-16 text-right tabular-nums">
                {strainMins ?? "—"}<span className="text-sm font-normal text-slate-400">m</span>
              </span>
            </div>
            {strainMins && strainMins <= 20 && (
              <p className="text-xs text-blue-600">
                Under 20 minutes — significant strain load. Your ciliary is working hard.
              </p>
            )}
            {strainMins && strainMins >= 80 && (
              <p className="text-xs text-green-400">
                Over 80 minutes — good baseline resilience. Differentials will push this further.
              </p>
            )}
          </div>

          {/* Recovery time */}
          <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-4">
            <div>
              <p className="text-slate-800 font-medium mb-1">
                How many minutes of break before the chart clears again?
              </p>
              <p className="text-slate-400 text-xs">
                Look out a window, close eyes, walk outside. Not at your phone.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={1}
                max={30}
                step={1}
                value={recoveryMins ?? 10}
                onChange={(e) => setRecoveryMins(parseInt(e.target.value))}
                className={sliderCls}
              />
              <span className="text-2xl font-bold text-blue-600 w-16 text-right tabular-nums">
                {recoveryMins ?? "—"}<span className="text-sm font-normal text-slate-400">m</span>
              </span>
            </div>
            {recoveryMins && recoveryMins >= 15 && (
              <p className="text-xs text-blue-600">
                15+ minutes to recover — your ciliary strain is deep. Earlier breaks will shorten this.
              </p>
            )}
            {recoveryMins && recoveryMins <= 5 && (
              <p className="text-xs text-green-400">
                Fast recovery — your ciliary is responsive. Good sign.
              </p>
            )}
          </div>

          <button
            onClick={build}
            disabled={!canBuild}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl py-4 transition-colors cursor-pointer"
          >
            Build my schedule →
          </button>
        </>
      ) : (
        <>
          {/* The schedule card */}
          <div className="rounded-xl border-2 border-blue-400 bg-white p-6 space-y-5">
            <div className="text-center space-y-1">
              <p className="text-xs text-blue-600 uppercase tracking-widest font-medium">Your custom break schedule</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="rounded-xl bg-slate-100 p-4">
                <p className="text-4xl font-bold text-slate-900">{strainMins}</p>
                <p className="text-xs text-slate-400 mt-1">minutes of work</p>
              </div>
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
                <p className="text-4xl font-bold text-blue-600">{recoveryMins}</p>
                <p className="text-xs text-slate-400 mt-1">minute break</p>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 space-y-2">
              {[
                `Work ${strainMins} minutes → break ${recoveryMins} minutes`,
                "Break = window / walk / eyes closed. Not your phone.",
                "Chart check: one glance every 20 min during work",
                "If chart blurs before your interval — take the break now",
              ].map((rule, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="text-blue-600 text-xs mt-0.5 flex-shrink-0">→</span>
                  <p className="text-slate-500 text-xs leading-relaxed">{rule}</p>
                </div>
              ))}
            </div>

            {recoveryMins && strainMins && recoveryMins / strainMins > 0.25 && (
              <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
                <p className="text-blue-700 text-xs leading-relaxed">
                  <strong>Note:</strong> Your recovery takes {Math.round((recoveryMins / strainMins) * 100)}% as long as your work interval. As you implement this schedule consistently, that ratio will improve — recovery gets faster.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-xl bg-white border border-slate-200 px-5 py-4">
            <p className="text-slate-700 text-sm font-medium mb-2">What this means long-term</p>
            <p className="text-slate-500 text-sm leading-relaxed">
              Every time you catch strain early and recover fully, you&apos;re
              preventing the axial elongation signal. Over weeks and months,
              your strain onset time increases — your ciliary gets more
              resilient. That&apos;s measurable. You&apos;ll see it in your
              morning vs evening measurements.
            </p>
          </div>

          <button
            onClick={onContinue}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl py-4 transition-colors cursor-pointer"
          >
            Continue → Phase 5: Your First Step Out
          </button>
        </>
      )}
    </div>
  );
}

// ── Orchestrator ──────────────────────────────────────────────────

export default function App() {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [screen, setScreen] = useState(0);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setAssessment(loadAssessment());
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
    try {
      localStorage.removeItem("em-progress");
      clearAssessment();
    } catch {}
    setScreen(0);
    setUserData(null);
    setAssessment(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!hydrated) return null;

  // Show assessment first if not yet completed
  if (!assessment) {
    return (
      <main className="flex-1 flex flex-col items-center justify-start">
        <div className="w-full max-w-xl lg:max-w-2xl px-5 md:px-8 pt-10 pb-16">
          <AssessmentFlow
            onComplete={(a) => {
              saveAssessment(a);
              setAssessment(a);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      </main>
    );
  }

  const isPhase1 = screen >= 0 && screen <= 4;
  const isPhase2 = screen >= 5 && screen <= 8;
  const isPhase4 = screen >= 10 && screen <= 12;

  return (
    <main className="flex-1 flex flex-col items-center">
      <div className="w-full max-w-xl lg:max-w-2xl px-5 md:px-8 pb-16">
        {screen > 0 && (
          <div className="flex justify-end pt-4 -mb-2">
            <button
              onClick={reset}
              className="text-xs text-slate-300 hover:text-slate-500 transition-colors cursor-pointer"
            >
              ↩ Start over
            </button>
          </div>
        )}

        {isPhase1 && <ProgressDots total={5} current={screen} />}
        {isPhase2 && <ProgressDots total={4} current={screen - 5} />}
        {isPhase4 && <ProgressDots total={3} current={screen - 10} />}

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
        {screen === 9 && userData && (
          <Tracker userData={userData} onContinue={() => advance(10)} />
        )}
        {screen === 10 && userData && (
          <StrainSignalScreen userData={userData} onContinue={() => advance(11)} />
        )}
        {screen === 11 && userData && (
          <EyeChartSetupScreen userData={userData} onContinue={() => advance(12)} />
        )}
        {screen === 12 && (
          <BreakScheduleScreen onContinue={() => advance(13)} />
        )}
      </div>
    </main>
  );
}
