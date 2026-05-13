import { CURRICULUM_TOPICS } from "./curriculum";
import type { CurriculumTopic } from "./types";

function normalise(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

export function scoreTopics(text: string): { topic: CurriculumTopic; score: number }[] {
  const haystack = normalise(text);
  const scored = CURRICULUM_TOPICS.map((topic) => {
    let score = 0;
    for (const kw of topic.specKeywords) {
      if (haystack.includes(kw.toLowerCase())) score += 1;
    }
    if (haystack.includes(topic.topicTitle.toLowerCase())) score += 2;
    return { topic, score };
  });
  return scored.sort((a, b) => b.score - a.score);
}

export function pickPrimaryTopic(text: string): CurriculumTopic {
  const ranked = scoreTopics(text);
  const best = ranked.find((r) => r.score > 0);
  if (best) return best.topic;
  return ranked[0].topic;
}

export function pickRelatedTopics(
  text: string,
  primary: CurriculumTopic,
  limit = 2,
): CurriculumTopic[] {
  return scoreTopics(text)
    .filter((r) => r.topic.topicCode !== primary.topicCode && r.score > 0)
    .slice(0, limit)
    .map((r) => r.topic);
}
