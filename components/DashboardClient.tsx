"use client";

import type { DashboardPayload } from "@/lib/dashboardPayload";
import { formatInstantUtc } from "@/lib/formatDate";
import { useMemo, useState } from "react";
import type { ArticleStudyPack } from "@/lib/types";
import { McqCard } from "./McqCard";
import { BlockText, InlineText } from "./InlineText";

const pubs = [
  { id: "all", label: "All sources" },
  { id: "ft", label: "FT" },
  { id: "economist", label: "Economist" },
  { id: "times", label: "The Times" },
  { id: "moneyweek", label: "MoneyWeek" },
  { id: "spectator", label: "Spectator" },
] as const;

type PubFilter = (typeof pubs)[number]["id"];

export function StudyPackCard({ pack }: { pack: ArticleStudyPack }) {
  const [open, setOpen] = useState(false);

  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-100 bg-gradient-to-r from-amber-50 to-white px-5 py-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600">
          <span className="rounded-full bg-zinc-900 px-2 py-0.5 font-semibold uppercase tracking-wide text-white">
            {pack.article.publicationLabel}
          </span>
          {pack.article.publishedAt ? (
            <time dateTime={pack.article.publishedAt}>
              {formatInstantUtc(pack.article.publishedAt)}
            </time>
          ) : (
            <span>Date unknown</span>
          )}
        </div>
        <h2 className="mt-2 text-lg font-semibold leading-snug text-zinc-950">
          <a
            href={pack.article.link}
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            {pack.article.title}
          </a>
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-700">
          {pack.article.summary}
        </p>
        {pack.article.feedNote ? (
          <p className="mt-2 text-xs leading-relaxed text-zinc-500">
            {pack.article.feedNote}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-md border border-amber-200 bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-950">
            {pack.primaryTopic.unitCode} · {pack.primaryTopic.topicCode}{" "}
            {pack.primaryTopic.topicTitle}
          </span>
          {pack.relatedTopics.map((t) => (
            <span
              key={t.topicCode}
              className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs text-zinc-700"
            >
              Also: {t.topicCode} {t.topicTitle}
            </span>
          ))}
        </div>
      </div>
      <div className="px-5 py-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-sm font-semibold text-amber-900 hover:underline"
        >
          {open ? "Hide study pack" : "Show MCQs, casebook, essay + textbook solutions"}
        </button>
      </div>
      {open ? (
        <div className="space-y-4 border-t border-zinc-100 bg-zinc-50 px-5 py-5">
          <div className="grid gap-4 lg:grid-cols-2">
            {pack.mcq.map((q) => (
              <McqCard key={q.id} question={q} />
            ))}
          </div>

          <section className="rounded-2xl border border-zinc-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-zinc-900">
              Casebook-style questions
            </h3>
            <div className="mt-2 text-sm text-zinc-800">
              <BlockText text={pack.casebook.context} />
            </div>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-900">
              {pack.casebook.tasks.map((t) => (
                <li key={t}>
                  <InlineText text={t} />
                </li>
              ))}
            </ol>
            <div className="mt-4 rounded-xl bg-emerald-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900">
                Textbook-style worked solution
              </p>
              <div className="mt-2">
                <BlockText text={pack.casebook.textbookSolution} />
              </div>
            </div>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-zinc-700">
              {pack.casebook.markHints.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-zinc-900">Essay question</h3>
            <p className="mt-2 whitespace-pre-line text-sm text-zinc-900">
              <InlineText text={pack.essay.prompt} />
            </p>
            <div className="mt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Suggested plan
              </p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-zinc-800">
                {pack.essay.suggestedPlan.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ol>
            </div>
            <div className="mt-4 rounded-xl bg-sky-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-900">
                Textbook-style model structure
              </p>
              <div className="mt-2">
                <BlockText text={pack.essay.textbookSolution} />
              </div>
            </div>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-zinc-700">
              {pack.essay.indicativeMarking.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}
    </article>
  );
}

export function DashboardClient({ initial }: { initial: DashboardPayload }) {
  const [data, setData] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [pub, setPub] = useState<PubFilter>("all");
  const [unit, setUnit] = useState<string>("all");

  const filtered = useMemo(() => {
    return data.packs.filter((p) => {
      if (pub !== "all" && p.article.publication !== pub) return false;
      if (unit !== "all" && p.primaryTopic.unitCode !== unit) return false;
      return true;
    });
  }, [data.packs, pub, unit]);

  async function refresh() {
    setBusy(true);
    try {
      const res = await fetch("/api/aggregated", { cache: "no-store" });
      const json = (await res.json()) as typeof initial;
      setData(json);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="border-b border-zinc-200 pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-800">
          Pearson Edexcel International A Level Economics · study lab
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
          News-to-curriculum workshop
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-700">
          This site aggregates recent items from the{" "}
          <strong>Financial Times</strong>, <strong>The Economist</strong>,{" "}
          <strong>The Times</strong>, <strong>MoneyWeek</strong>, and{" "}
          <strong>The Spectator</strong>, then maps each story to{" "}
          <strong>International A Level Economics</strong> style unit topics
          (WEC11–WEC14). Each article opens into{" "}
          <strong>two multiple-choice questions</strong>, a{" "}
          <strong>casebook-style task set</strong>, and{" "}
          <strong>one essay prompt</strong>, each with{" "}
          <strong>textbook-style solution notes</strong>.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-600">
          <span>
            Last refresh:{" "}
            <time dateTime={data.generatedAt}>
              {formatInstantUtc(data.generatedAt)}
            </time>
          </span>
          <span className="hidden sm:inline">·</span>
          <span>{data.articleCount} articles pulled this cycle</span>
          <button
            type="button"
            onClick={refresh}
            disabled={busy}
            className="ml-auto rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {busy ? "Refreshing…" : "Refresh feeds"}
          </button>
        </div>
      </header>

      <section className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Curriculum filter
            </p>
            <div className="mt-2 space-y-1 text-sm">
              {[
                { id: "all", label: "All units" },
                { id: "WEC11", label: "WEC11 — Markets in action" },
                { id: "WEC12", label: "WEC12 — Macro performance & policy" },
                { id: "WEC13", label: "WEC13 — Business behaviour" },
                { id: "WEC14", label: "WEC14 — Global economy" },
              ].map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setUnit(u.id)}
                  className={[
                    "flex w-full rounded-lg px-2 py-1.5 text-left hover:bg-zinc-100",
                    unit === u.id ? "bg-amber-50 font-semibold text-amber-950" : "",
                  ].join(" ")}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Source filter
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {pubs.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPub(p.id)}
                  className={[
                    "rounded-full border px-3 py-1 text-xs font-semibold",
                    pub === p.id
                      ? "border-amber-500 bg-amber-100 text-amber-950"
                      : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300",
                  ].join(" ")}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-zinc-50 p-3 text-xs leading-relaxed text-zinc-600">
            <p className="font-semibold text-zinc-800">Important notes</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>
                Topic tags are generated by keyword overlap with specification
                language—always sanity-check against the article and your scheme
                of work.
              </li>
              <li>
                Questions are templated study aids (not official Pearson
                materials).
              </li>
              <li>
                Some publishers do not expose reliable public RSS feeds; where
                noted, Google News RSS is used strictly as a headline index.
              </li>
            </ul>
          </div>
        </aside>

        <div className="space-y-5">
          {filtered.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-600">
              No articles match these filters (or feeds failed to load). Try
              refreshing, widening filters, or check your network connection.
            </p>
          ) : (
            filtered.map((pack) => <StudyPackCard key={pack.article.id} pack={pack} />)
          )}
        </div>
      </section>

      <footer className="mt-12 border-t border-zinc-200 pt-6 text-xs text-zinc-500">
        Built for classroom practice. Respect each publisher’s terms; do not
        republish full articles without permission.
      </footer>
    </div>
  );
}
