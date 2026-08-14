export type MusicQuizQuestion = {
  id: string | number;
  question: string;
  youtube_url: string;
  audio_start: number;
  audio_duration: number;
  options: string[];
  correct_answer: string;
  song?: string;
  movie?: string;
  artist?: string;
  director?: string;
  composer?: string;
  release_year?: number | string;
  packId: string;
  packTitle: string;
};

export type MusicQuizPack = {
  id: "vn-movie-100" | "vpop-100" | "vn-movie-50";
  title: string;
  subtitle: string;
  icon: string;
  badge: string;
  totalQuestions: number;
  questions: MusicQuizQuestion[];
};

export type MusicQuizResult = {
  question: MusicQuizQuestion;
  selectedAnswer: string | null;
  isCorrect: boolean;
  timeSpentSeconds: number; // 0..30
};

export type AppMode = "hint100" | "musicQuiz";

export type MusicQuizPhase = "home" | "playing" | "finished";
