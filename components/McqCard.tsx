"use client";

import { useMemo, useState } from "react";
import type { McqQuestion } from "@/lib/types";
import { InlineText } from "./InlineText";

export function McqCard({ question }: { question: McqQuestion }) {
  const [choice, setChoice] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const status = useMemo(() => {
    if (choice === null) return "idle";
    if (choice === question.correctIndex) return "correct";
    return "wrong";
  }, [choice, question.correctIndex]);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Multiple choice
      </p>
      <div className="mt-2 whitespace-pre-line text-sm text-zinc-900">
        <InlineText text={question.stem} />
      </div>
      <div className="mt-3 space-y-2">
        {question.options.map((opt, idx) => {
          const selected = choice === idx;
          const isCorrect = idx === question.correctIndex;
          const showCorrect = revealed && isCorrect;
          const showWrong = revealed && selected && !isCorrect;
          return (
            <button
              type="button"
              key={opt}
              onClick={() => setChoice(idx)}
              className={[
                "w-full rounded-lg border px-3 py-2 text-left text-sm transition",
                selected && !revealed
                  ? "border-amber-400 bg-amber-50"
                  : "border-zinc-200 bg-zinc-50 hover:border-zinc-300",
                showCorrect ? "border-emerald-500 bg-emerald-50" : "",
                showWrong ? "border-rose-400 bg-rose-50" : "",
              ].join(" ")}
            >
              <span className="mr-2 font-mono text-xs text-zinc-500">
                {String.fromCharCode(65 + idx)}.
              </span>
              {opt}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800"
        >
          Reveal answer
        </button>
        <button
          type="button"
          onClick={() => {
            setChoice(null);
            setRevealed(false);
          }}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
        >
          Reset
        </button>
        {revealed && choice !== null ? (
          <span
            className={`text-xs font-semibold ${
              status === "correct" ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            {status === "correct" ? "Correct." : "Not quite—see explanation."}
          </span>
        ) : null}
      </div>
      {revealed ? (
        <p className="mt-3 text-xs leading-relaxed text-zinc-600">
          <span className="font-semibold text-zinc-800">Why: </span>
          {question.explanation}
        </p>
      ) : null}
    </div>
  );
}
