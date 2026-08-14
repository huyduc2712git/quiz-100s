export type ImageQuizQuestion = {
  id: string | number;
  question: string;
  image_url: string;
  landmark_name: string;
  country: string;
  location_detail?: string;
  category: "Di sản thế giới" | "Kỳ quan thiên nhiên" | "Kiến trúc biểu tượng" | "Đền chùa cổ kính" | "Thành phố lịch sử";
  options: string[];
  correct_answer: string;
  fun_fact: string;
  packId: string;
  packTitle: string;
};

export type ImageQuizPack = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  badge: string;
  totalQuestions: number;
  questions: ImageQuizQuestion[];
};

export type ImageQuizResult = {
  question: ImageQuizQuestion;
  selectedAnswer: string | null;
  isCorrect: boolean;
  timeSpentSeconds: number;
};

export type ImageQuizPhase = "home" | "playing" | "finished";
