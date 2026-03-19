"use client";

import { useState, useEffect } from "react";
import VideoPlaceholder from "@/components/VideoPlaceholder";
import QuizCard from "@/components/QuizCard";
import ProgressDots from "@/components/ProgressDots";

type UserData = {
  years: number;
  leftEye: number;
  rightEye: number;
};

const TOTAL_SCREENS = 5;

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
      setError(
        "Enter your left eye prescription (e.g. -2.50). Myopia only for now."
      );
      return;
    }
    if (r === null || r < -25) {
      setError(
        "Enter your right eye prescription (e.g. -3.00). Myopia only for now."
      );
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
          Your optometrist uses these to write prescriptions. We&apos;re going
          to use them to show you something they never did.
        </p>
      </div>

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
          Current prescription — sphere only (the first number on your script)
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
          Don&apos;t have your script handy? Estimate — it still works. Enter
          negative values for myopia (nearsightedness).
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

      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-3xl font-bold text-zinc-100">{userData.years}</p>
          <p className="text-xs text-zinc-500 mt-1">years in the system</p>
        </div>
        <div className="flex items-center justify-center text-zinc-600 text-xl">
          →
        </div>
        <div>
          <p className="text-3xl font-bold text-amber-400">~{progression}D</p>
          <p className="text-xs text-zinc-500 mt-1">estimated decline</p>
        </div>
      </div>

      <div className="rounded-xl bg-zinc-900 border border-zinc-800 px-5 py-4 text-sm text-zinc-400 leading-relaxed">
        <strong className="text-zinc-200">How this is calculated:</strong>{" "}
        Average myopia progression under standard full correction is ~0.5
        diopters per year. You&apos;ve been corrected for {userData.years}{" "}
        years. Your current prescription averages{" "}
        <strong className="text-zinc-200">-{avgStr}D</strong>. The math lines
        up.
      </div>

      <p className="text-zinc-300 leading-relaxed">
        This is not a coincidence. This is the{" "}
        <em>expected outcome</em> of the standard treatment model — and nobody
        told you.
      </p>

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
        label="Jake explains: How your eye focuses"
        duration="3:12"
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
        label="Jake explains: Lens-induced myopia"
        duration="4:28"
      />

      <p className="text-zinc-300 leading-relaxed">
        When you wear your full distance prescription and look at a screen 50cm
        away, your eye receives a{" "}
        <strong className="text-zinc-100">defocus signal</strong>. The image is
        forming slightly behind the retina.
      </p>

      <p className="text-zinc-300 leading-relaxed">
        Your eye interprets this as:{" "}
        <em className="text-zinc-200">
          &ldquo;I need to grow to bring that focal point forward.&rdquo;
        </em>{" "}
        So it does. Axial elongation. More myopia. Stronger prescription at your
        next visit. Repeat forever.
      </p>

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
          "Your prescription gets worse → you buy stronger lenses → you spend more",
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

      <p className="text-zinc-400 leading-relaxed text-sm">
        This isn&apos;t a conspiracy. Most optometrists believe in what they do.
        It&apos;s a system optimized for selling correction, not achieving
        recovery — and those are two very different things.
      </p>

      <VideoPlaceholder
        label="Jake explains: The business of blur"
        duration="5:15"
      />

      <div className="rounded-xl bg-zinc-900 border border-zinc-700 p-6 space-y-4 mt-2">
        <div className="text-center">
          <div className="text-4xl mb-3">👁</div>
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
            Phase 2: learn to measure your own eyes — and see for yourself that
            your vision is already variable throughout the day.
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

// ── Phase 2 Placeholder ───────────────────────────────────────────

function Phase2Placeholder() {
  return (
    <div className="space-y-5 text-center py-6">
      <div className="text-5xl">🔬</div>
      <h1 className="text-2xl font-bold text-zinc-100">Phase 2 is coming.</h1>
      <p className="text-zinc-400 leading-relaxed">
        Next you&apos;ll learn the centimeter method — how to measure your own
        eyes at home, convert to diopters, and see that your vision is already
        variable. No equipment needed.
      </p>
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 px-5 py-4 text-left space-y-2">
        <p className="text-sm text-zinc-400 font-medium mb-3">
          In Phase 2 you&apos;ll:
        </p>
        {[
          "Learn what the optometrist exam actually measures (and what it misses)",
          "Measure your blur point in centimeters",
          "Convert to diopters with one formula: 100 ÷ cm",
          "Compare your self-measurement to your prescription",
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

export default function Phase1() {
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

  if (!hydrated) return null;

  return (
    <main className="flex-1 flex flex-col">
      <div className="max-w-lg mx-auto w-full px-5 pb-16">
        {screen < TOTAL_SCREENS && (
          <ProgressDots total={TOTAL_SCREENS} current={screen} />
        )}

        {screen === 0 && (
          <InputScreen onComplete={(d) => advance(1, d)} />
        )}
        {screen === 1 && userData && (
          <ShockScreen userData={userData} onContinue={() => advance(2)} />
        )}
        {screen === 2 && <BiologyScreen onContinue={() => advance(3)} />}
        {screen === 3 && <CauseScreen onContinue={() => advance(4)} />}
        {screen === 4 && <BusinessScreen onContinue={() => advance(5)} />}
        {screen === 5 && <Phase2Placeholder />}
      </div>
    </main>
  );
}
