export type Difficulty = "easy" | "medium" | "hard";

export type Card = {
  id: string;
  category: string;
  answer: string;
  hints: string[];
  difficulty: Difficulty;
  source_url: string;
};

export type GamePhase =
  | "loading"
  | "home"
  | "randomizing"
  | "ready"
  | "playing"
  | "timeout"
  | "finished";

export type QuestionResult = {
  card: Card;
  isCorrect: boolean;
  timeSpentSeconds: number; // 0..100
};

export type WikiExtract = {
  title: string;
  extract: string;
  pageUrl: string;
};
