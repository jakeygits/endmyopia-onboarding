"use client";

import { useState } from "react";

type QuizCardProps = {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  onPass: () => void;
};

export default function QuizCard({
  question,
  options,
  correct,
  explanation,
  onPass,
}: QuizCardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [passed, setPassed] = useState(false);

  const choose = (i: number) => {
    if (passed) return;
    setSelected(i);
    if (i === correct) {
      setPassed(true);
      onPass();
    }
  };

  const answered = selected !== null;
  const wasWrong = answered && selected !== correct;

  return (
    <div className="my-8 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-xs uppercase tracking-widest text-amber-400 mb-3 font-medium">
        Quick check
      </p>
      <p className="text-zinc-100 font-medium mb-4">{question}</p>
      <div className="space-y-2">
        {options.map((opt, i) => {
          let cls =
            "w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ";
          if (!answered) {
            cls +=
              "border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 cursor-pointer";
          } else if (i === correct) {
            cls += "border-green-600 bg-green-950/40 text-green-300";
          } else if (i === selected) {
            cls += "border-red-700 bg-red-950/30 text-red-400";
          } else {
            cls += "border-zinc-800 text-zinc-600 cursor-default";
          }
          return (
            <button key={i} className={cls} onClick={() => choose(i)}>
              {opt}
            </button>
          );
        })}
      </div>
      {answered && (
        <div
          className={`mt-4 rounded-lg px-4 py-3 text-sm ${
            passed
              ? "bg-green-950/30 text-green-300 border border-green-900"
              : "bg-zinc-800 text-zinc-300"
          }`}
        >
          {wasWrong && (
            <p className="text-red-400 font-medium mb-1">Not quite.</p>
          )}
          {passed && (
            <p className="text-green-400 font-medium mb-1">Correct.</p>
          )}
          <p>{explanation}</p>
        </div>
      )}
    </div>
  );
}
