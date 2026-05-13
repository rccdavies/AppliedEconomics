export type PublicationId =
  | "ft"
  | "economist"
  | "times"
  | "moneyweek"
  | "spectator";

export type CurriculumUnitCode = "WEC11" | "WEC12" | "WEC13" | "WEC14";

export interface CurriculumTopic {
  unitCode: CurriculumUnitCode;
  unitTitle: string;
  topicCode: string;
  topicTitle: string;
  specKeywords: string[];
}

export interface FeedArticle {
  id: string;
  publication: PublicationId;
  publicationLabel: string;
  title: string;
  link: string;
  summary: string;
  publishedAt: string | null;
  feedNote?: string;
}

export interface McqQuestion {
  id: string;
  stem: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CasebookQuestion {
  id: string;
  context: string;
  tasks: string[];
  textbookSolution: string;
  markHints: string[];
}

export interface EssayQuestion {
  id: string;
  prompt: string;
  suggestedPlan: string[];
  textbookSolution: string;
  indicativeMarking: string[];
}

export interface ArticleStudyPack {
  article: FeedArticle;
  primaryTopic: CurriculumTopic;
  relatedTopics: CurriculumTopic[];
  mcq: McqQuestion[];
  casebook: CasebookQuestion;
  essay: EssayQuestion;
}
