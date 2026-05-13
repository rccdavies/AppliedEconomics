import { createHash } from "crypto";
import type { ArticleStudyPack, CurriculumTopic, FeedArticle, McqQuestion } from "./types";
import { pickPrimaryTopic, pickRelatedTopics } from "./mapArticle";

function hashId(parts: string[]): string {
  return createHash("sha1").update(parts.join("|")).digest("hex").slice(0, 12);
}

function clip(text: string, max: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function textbookBlock(topic: CurriculumTopic): string {
  return [
    `**Textbook framing (${topic.unitCode} · ${topic.topicTitle})**`,
    "",
    "Use precise definitions, clear chains of reasoning, and labelled diagrams where the question asks for analysis.",
    "In exams, always qualify direction of shifts (e.g. AD to the right) and link micro decisions to market outcomes, or macro shocks to objectives/trade-offs.",
  ].join("\n");
}

function buildMcq(
  article: FeedArticle,
  topic: CurriculumTopic,
): McqQuestion[] {
  const base = clip(`${article.title}. ${article.summary}`, 320);

  const pools: Record<
    string,
    { stem: string; correct: string; wrong: string[]; why: string }
  > = {
    "1.2": {
      stem: `A news story discusses price pressures in a market. Which statement best fits a supply-and-demand explanation in ${topic.topicTitle}?`,
      correct:
        "A sustained rise in demand, with supply relatively slow to adjust, tends to raise equilibrium price.",
      wrong: [
        "A rise in supply with unchanged demand always increases equilibrium price.",
        "If a price ceiling is set above the equilibrium price, a shortage will definitely occur.",
        "Movement along the demand curve is the same thing as a shift in demand.",
      ],
      why: "Price changes can come from shifts in demand/supply or both; the correct option states the standard comparative-static result when demand rises faster than supply can respond.",
    },
    "2.1": {
      stem: `Macro coverage like “${clip(article.title, 80)}” is often interpreted through AD/AS. Which statement is most consistent with ${topic.topicTitle}?`,
      correct:
        "A negative demand shock tends to reduce real output and can reduce inflationary pressure in the short run.",
      wrong: [
        "A negative demand shock always raises the price level and real output together.",
        "Long-run aggregate supply is typically modelled as independent of the labour force and technology.",
        "Aggregate demand only includes household consumption, not investment or government spending.",
      ],
      why: "AD/AS separates short-run fluctuations from capacity constraints; a demand shock moves along/up the SRAS schedule depending on conditions.",
    },
    "2.3": {
      stem: `Policy stories map to ${topic.topicTitle}. Which option is most accurate?`,
      correct:
        "Contractionary monetary policy (e.g. higher policy rates) tends to dampen aggregate demand with a lag.",
      wrong: [
        "Higher interest rates immediately and permanently remove inflation without affecting output.",
        "Fiscal policy cannot influence aggregate demand because taxes only affect firms.",
        "Quantitative easing is identical to raising reserve requirements in all circumstances.",
      ],
      why: "Monetary policy works through the transmission mechanism (credit conditions, expectations, exchange rate) and operates with recognition/implementation/impact lags.",
    },
    "4.1": {
      stem: `Trade and integration content links to ${topic.topicTitle}. Which statement is most defensible?`,
      correct:
        "Tariffs raise the domestic price of protected imports and can reduce the volume traded.",
      wrong: [
        "Tariffs always improve welfare for the importing country in every market structure.",
        "Comparative advantage implies the country with lower absolute costs should not trade.",
        "A customs union removes all barriers to labour mobility between members by definition.",
      ],
      why: "Tariffs create a wedge between world and domestic prices; welfare effects depend on market power, retaliation, and how revenues are used.",
    },
  };

  const key = topic.topicCode in pools ? topic.topicCode : "1.2";
  const pack = pools[key];

  const mcq1: McqQuestion = {
    id: hashId(["mcq1", article.id, topic.topicCode]),
    stem: `${pack.stem}\n\nContext: ${base}`,
    options: stableOptionOrder(article.id, [pack.correct, ...pack.wrong]),
    correctIndex: 0,
    explanation: pack.why,
  };
  const withIndex = fixCorrectIndex(mcq1, pack.correct);

  const mcq2: McqQuestion = {
    id: hashId(["mcq2", article.id, topic.topicCode]),
    stem: `Which curriculum label best matches the likely main focus of the article for ${topic.unitCode}?`,
    options: stableOptionOrder(article.id, [
      `${topic.topicCode} — ${topic.topicTitle}`,
      "1.2 — Demand, supply, and market equilibrium",
      "2.2 — Growth, inflation, and unemployment",
      "4.3 — The financial sector",
    ]),
    correctIndex: 0,
    explanation:
      "This is a study aid mapping: the classifier uses keyword overlap with specification language; always verify against the article body and your teacher’s scheme of work.",
  };
  const correctLabel = `${topic.topicCode} — ${topic.topicTitle}`;
  return [fixCorrectIndex(mcq2, correctLabel), withIndex];
}

function stableOptionOrder(seed: string, opts: string[]): string[] {
  return [...opts].sort((a, b) =>
    hashId([seed, "opt", a]).localeCompare(hashId([seed, "opt", b])),
  );
}

function fixCorrectIndex(q: McqQuestion, correctText: string): McqQuestion {
  const idx = q.options.findIndex((o) => o === correctText);
  return { ...q, correctIndex: idx >= 0 ? idx : 0 };
}

function buildCasebook(article: FeedArticle, topic: CurriculumTopic) {
  const context = [
    `You are given a contemporary extract drawn from **${article.publicationLabel}** (headline and summary only in this lab).`,
    "",
    `Headline: “${article.title}”`,
    "",
    `Summary: ${clip(article.summary, 520)}`,
  ].join("\n");

  const tasks = [
    `Explain **one** economic mechanism relevant to **${topic.topicTitle}** (${topic.unitCode}). Use a clear chain of reasoning (at least three linked steps).`,
    `Discuss **one** limitation of using only a headline/summary when applying ${topic.unitCode} concepts to real policy debates.`,
    `Identify **one** government or central-bank policy lever that might plausibly be debated in follow-up reporting, and state whether it is primarily micro or macro in focus.`,
  ];

  const textbookSolution = [
    textbookBlock(topic),
    "",
    "**Worked approach (casebook / short-answer style)**",
    "",
    `1) Mechanism: anchor the story to ${topic.topicTitle}. Define the key term(s), state the direction of change (e.g. higher input costs / tighter financial conditions), then link to an outcome variable (price, output, employment, inflation, external balance).`,
    "2) Limitation: news summaries omit magnitudes, elasticities, time horizons, and general equilibrium feedbacks; they may also conflate correlation with causation.",
    "3) Policy lever: choose a lever consistent with the article’s implied shock (e.g. taxes/subsidies/regulation for micro market failure; interest rates/QE/taxes/transfers for macro stabilisation).",
  ].join("\n");

  const markHints = [
    "Definitions: precise, relevant, and used—not bolted on.",
    "Analysis: clear steps; at least one diagram if the question demands it (label axes and shifts).",
    "Evaluation: two-sided argument with a mini-judgement tied to evidence from the extract.",
  ];

  return {
    id: hashId(["case", article.id]),
    context,
    tasks,
    textbookSolution,
    markHints,
  };
}

function buildEssay(article: FeedArticle, topic: CurriculumTopic) {
  const prompt = [
    `Essay (suggested 25 marks / 45 minutes practice pacing):`,
    "",
    `Using the context of recent reporting (“${clip(article.title, 120)}”),`,
    `evaluate the extent to which **${topic.topicTitle}** (${topic.unitCode}) helps explain the economic issues implied by the story.`,
    "",
    "In your answer, consider both short-run and longer-run effects, and discuss at least one policy response.",
  ].join("\n");

  const suggestedPlan = [
    "Introduction: define the market/macro problem implied by the extract; state your line of argument.",
    `Paragraphs 2–3: core theory for ${topic.topicTitle} (diagram + mechanism).`,
    "Paragraph 4: counter-argument / alternative explanation (different shock, expectations, international linkages).",
    "Paragraph 5: policy evaluation (effectiveness, time lags, constraints, unintended consequences).",
    "Conclusion: reasoned judgement with explicit criteria (e.g. magnitude, persistence, evidence gaps).",
  ];

  const textbookSolution = [
    textbookBlock(topic),
    "",
    "**Model essay skeleton (not a memorised “perfect” answer)**",
    "",
    `- Set up the economic question implied by the headline: what behaviour or aggregate outcome is changing?`,
    `- Deploy ${topic.topicTitle}: define terms, draw and explain one relevant diagram (e.g. demand/supply, AD/AS, market structure, externality diagram, trade diagram—pick what matches your argument).`,
    `- Evaluate: use “it depends on” language tied to elasticities, spare capacity, credibility of institutions, and open-economy complications.`,
    `- Policy: match instrument to market failure or macro objective; discuss implementation lags and distributional effects.`,
  ].join("\n");

  const indicativeMarking = [
    "Level 4 (strong): sustained analysis with clear diagrams; perceptive evaluation grounded in the extract’s limits.",
    "Level 3: accurate analysis but evaluation thinner or less well prioritised.",
    "Level 2: descriptive with some relevant concepts; limited chains of reasoning.",
    "Level 1: fragmented relevance; lacks clear economic model.",
  ];

  return {
    id: hashId(["essay", article.id]),
    prompt,
    suggestedPlan,
    textbookSolution,
    indicativeMarking,
  };
}

export function buildStudyPack(article: FeedArticle): ArticleStudyPack {
  const blob = `${article.title}\n${article.summary}`;
  const primary = pickPrimaryTopic(blob);
  const related = pickRelatedTopics(blob, primary, 2);

  return {
    article,
    primaryTopic: primary,
    relatedTopics: related,
    mcq: buildMcq(article, primary),
    casebook: buildCasebook(article, primary),
    essay: buildEssay(article, primary),
  };
}
