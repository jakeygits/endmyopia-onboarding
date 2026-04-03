"use client";

import { useState } from "react";
import {
  Assessment,
  AgeRange,
  YearsWearing,
  Goal,
  PriorKnowledge,
  LearningStyle,
} from "@/lib/assessment";

type Step = 1 | 2 | 3 | 4 | 5;
const TOTAL_STEPS = 5;

function ProgressBar({ step }: { step: Step }) {
  return (
    <div className="w-full bg-slate-100 rounded-full h-1 mb-10">
      <div
        className="bg-blue-500 h-1 rounded-full transition-all duration-500"
        style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
      />
    </div>
  );
}

type OptionCard<T> = {
  value: T;
  label: string;
  sub?: string;
};

function OptionGrid<T extends string>({
  options,
  selected,
  onSelect,
  cols = 2,
}: {
  options: OptionCard<T>[];
  selected: T | null;
  onSelect: (v: T) => void;
  cols?: 1 | 2;
}) {
  return (
    <div
      className={`grid gap-3 ${cols === 2 ? "grid-cols-2 md:grid-cols-2" : "grid-cols-1"}`}
    >
      {options.map((opt) => {
        const active = selected === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={`
              rounded-2xl border-2 px-4 py-5 text-left transition-all duration-150 cursor-pointer
              ${active
                ? "border-blue-400 bg-blue-50"
                : "border-slate-200 bg-white hover:border-slate-300"
              }
            `}
          >
            <p className={`font-semibold text-sm leading-snug ${active ? "text-blue-700" : "text-slate-900"}`}>
              {opt.label}
            </p>
            {opt.sub && (
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{opt.sub}</p>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Step 1: Age ───────────────────────────────────────────────────

function Step1({ onNext }: { onNext: (v: AgeRange) => void }) {
  const [val, setVal] = useState<AgeRange | null>(null);

  const options: OptionCard<AgeRange>[] = [
    { value: "under18", label: "Under 18" },
    { value: "18-30", label: "18 – 30" },
    { value: "31-45", label: "31 – 45" },
    { value: "46-60", label: "46 – 60" },
    { value: "60plus", label: "60+" },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs text-slate-400 uppercase tracking-widest">1 of 5</p>
        <h2 className="text-3xl font-bold text-slate-900 leading-tight">
          How old are you?
        </h2>
        <p className="text-slate-400 text-sm">
          Recovery speed and approach vary with age.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {options.map((opt) => {
          const active = val === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => {
                setVal(opt.value);
                setTimeout(() => onNext(opt.value), 180);
              }}
              className={`
                rounded-2xl border-2 px-4 py-5 text-center transition-all duration-150 cursor-pointer
                ${active ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"}
                ${opt.value === "60plus" ? "col-span-2 md:col-span-1" : ""}
              `}
            >
              <p className={`font-bold text-lg ${active ? "text-blue-700" : "text-slate-900"}`}>
                {opt.label}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 2: Years wearing ─────────────────────────────────────────

function Step2({ onNext }: { onNext: (v: YearsWearing) => void }) {
  const [val, setVal] = useState<YearsWearing | null>(null);

  const options: OptionCard<YearsWearing>[] = [
    { value: "under1", label: "Less than a year", sub: "Recent prescription" },
    { value: "1-5", label: "1 – 5 years", sub: "Still in the early window" },
    { value: "5-15", label: "5 – 15 years", sub: "Established myopia" },
    { value: "15plus", label: "15+ years", sub: "Long-term correction" },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs text-slate-400 uppercase tracking-widest">2 of 5</p>
        <h2 className="text-3xl font-bold text-slate-900 leading-tight">
          How long have you been wearing glasses or contacts?
        </h2>
      </div>
      <OptionGrid options={options} selected={val} onSelect={(v) => { setVal(v); setTimeout(() => onNext(v), 180); }} />
    </div>
  );
}

// ── Step 3: Goal ──────────────────────────────────────────────────

function Step3({ onNext }: { onNext: (v: Goal) => void }) {
  const [val, setVal] = useState<Goal | null>(null);

  const options: OptionCard<Goal>[] = [
    { value: "stop-progression", label: "Stop getting worse", sub: "Stabilize where I am" },
    { value: "reduce", label: "Reduce my prescription", sub: "Get down a diopter or two" },
    { value: "full-reversal", label: "Full reversal", sub: "I want 20/20 back" },
    { value: "exploring", label: "Just exploring", sub: "Not sure what's possible yet" },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs text-slate-400 uppercase tracking-widest">3 of 5</p>
        <h2 className="text-3xl font-bold text-slate-900 leading-tight">
          What&apos;s your goal?
        </h2>
        <p className="text-slate-400 text-sm">Be honest. All of these are valid.</p>
      </div>
      <OptionGrid options={options} selected={val} onSelect={(v) => { setVal(v); setTimeout(() => onNext(v), 180); }} />
    </div>
  );
}

// ── Step 4: Prior knowledge ───────────────────────────────────────

function Step4({ onNext }: { onNext: (v: PriorKnowledge) => void }) {
  const [val, setVal] = useState<PriorKnowledge | null>(null);

  const options: OptionCard<PriorKnowledge>[] = [
    { value: "none", label: "Total beginner", sub: "I wear glasses. That's all I know." },
    { value: "heard", label: "Heard about it", sub: "Know it might be possible, skeptical" },
    { value: "know-basics", label: "Know the basics", sub: "Ciliary muscle, reduced lenses, etc." },
    { value: "tried", label: "Tried before", sub: "Started but didn't stick with it" },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs text-slate-400 uppercase tracking-widest">4 of 5</p>
        <h2 className="text-3xl font-bold text-slate-900 leading-tight">
          What do you already know about vision improvement?
        </h2>
      </div>
      <OptionGrid options={options} selected={val} onSelect={(v) => { setVal(v); setTimeout(() => onNext(v), 180); }} />
    </div>
  );
}

// ── Step 5: Learning style ────────────────────────────────────────

function Step5({ onNext }: { onNext: (v: LearningStyle) => void }) {
  const [val, setVal] = useState<LearningStyle | null>(null);

  const options: OptionCard<LearningStyle>[] = [
    {
      value: "just-do-it",
      label: "Just tell me what to do",
      sub: "Skip the theory, give me the protocol",
    },
    {
      value: "understand",
      label: "I want to understand why",
      sub: "The science helps me commit",
    },
    {
      value: "evidence",
      label: "Show me the evidence",
      sub: "I need peer-reviewed proof before I trust this",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs text-slate-400 uppercase tracking-widest">5 of 5</p>
        <h2 className="text-3xl font-bold text-slate-900 leading-tight">
          How do you learn best?
        </h2>
        <p className="text-slate-400 text-sm">
          We&apos;ll calibrate how much detail you get.
        </p>
      </div>
      <OptionGrid
        options={options}
        selected={val}
        cols={1}
        onSelect={(v) => { setVal(v); setTimeout(() => onNext(v), 180); }}
      />
    </div>
  );
}

// ── Summary / result ──────────────────────────────────────────────

function AssessmentResult({
  assessment,
  onStart,
}: {
  assessment: Assessment;
  onStart: () => void;
}) {
  const goalLabels: Record<string, string> = {
    "stop-progression": "Stop the decline",
    reduce: "Reduce your prescription",
    "full-reversal": "Full reversal",
    exploring: "Explore what\u2019s possible",
  };

  const knowledgeLabels: Record<string, string> = {
    none: "Starting from scratch",
    heard: "Heard about it, want to know more",
    "know-basics": "Know the basics",
    tried: "Have tried this before",
  };

  const styleLabels: Record<string, string> = {
    "just-do-it": "Action-first",
    understand: "Science + action",
    evidence: "Evidence-first",
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs text-slate-400 uppercase tracking-widest">You&apos;re set</p>
        <h2 className="text-3xl font-bold text-slate-900 leading-tight">
          Here&apos;s what we&apos;re working with.
        </h2>
        <p className="text-slate-400 text-sm">
          We&apos;ll refer back to this throughout. You can always adjust.
        </p>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 divide-y divide-slate-100">
        {[
          { label: "Goal", value: goalLabels[assessment.goal] },
          { label: "Where you are", value: knowledgeLabels[assessment.priorKnowledge] },
          { label: "Learning style", value: styleLabels[assessment.learningStyle] },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between px-5 py-4">
            <p className="text-xs text-slate-400 uppercase tracking-wider">{row.label}</p>
            <p className="text-sm font-medium text-slate-800">{row.value}</p>
          </div>
        ))}
      </div>

      {assessment.goal === "full-reversal" && (
        <div className="rounded-2xl bg-blue-50 border border-blue-200 px-5 py-4">
          <p className="text-blue-700 text-sm font-semibold mb-1">Full reversal is real.</p>
          <p className="text-slate-500 text-sm leading-relaxed">
            Jake reversed 5 diopters. Others have done the same. It requires
            understanding the mechanism and consistency — both of which start
            right now.
          </p>
        </div>
      )}

      {assessment.priorKnowledge === "tried" && (
        <div className="rounded-2xl bg-white border border-slate-200 px-5 py-4">
          <p className="text-slate-800 text-sm font-semibold mb-1">You&apos;ve tried before.</p>
          <p className="text-slate-500 text-sm leading-relaxed">
            Most people who try and stop do so because they didn&apos;t have a
            system. That&apos;s what this is.
          </p>
        </div>
      )}

      <button
        onClick={onStart}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl py-5 transition-colors cursor-pointer text-base"
      >
        Start →
      </button>
    </div>
  );
}

// ── Orchestrator ──────────────────────────────────────────────────

export default function AssessmentFlow({
  onComplete,
}: {
  onComplete: (a: Assessment) => void;
}) {
  const [step, setStep] = useState<Step | "result">(1);
  const [data, setData] = useState<Partial<Assessment>>({});

  const update = (patch: Partial<Assessment>) => {
    setData((prev) => ({ ...prev, ...patch }));
  };

  return (
    <div className="space-y-0">
      {step !== "result" && <ProgressBar step={step as Step} />}

      {step === 1 && (
        <Step1 onNext={(v) => { update({ ageRange: v }); setStep(2); }} />
      )}
      {step === 2 && (
        <Step2 onNext={(v) => { update({ yearsWearing: v }); setStep(3); }} />
      )}
      {step === 3 && (
        <Step3 onNext={(v) => { update({ goal: v }); setStep(4); }} />
      )}
      {step === 4 && (
        <Step4 onNext={(v) => { update({ priorKnowledge: v }); setStep(5); }} />
      )}
      {step === 5 && (
        <Step5 onNext={(v) => {
          const full = { ...data, learningStyle: v } as Assessment;
          setData(full);
          setStep("result");
        }} />
      )}
      {step === "result" && data.goal && (
        <AssessmentResult
          assessment={data as Assessment}
          onStart={() => onComplete(data as Assessment)}
        />
      )}
    </div>
  );
}
