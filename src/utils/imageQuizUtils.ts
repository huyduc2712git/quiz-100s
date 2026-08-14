import type {
  ImageQuizPack,
  ImageQuizQuestion,
} from "../types/imageQuiz";
import seaLandmarksData from "../data/sea-landmarks-quiz.json";
import vnGeographyData from "../data/vn-geography-quiz-1.json";
import vnGeographyData2 from "../data/vn-geography-quiz-2.json";

export const IMAGE_QUIZ_STORAGE_KEYS = {
  SEA_LANDMARKS: "image_quiz_sea_landmarks_cache",
  STATS: "image_quiz_player_stats_v1",
};

interface LandmarkRaw {
  id: number | string;
  question: string;
  image_url: string;
  landmark_name: string;
  country: string;
  location_detail?: string;
  category: string;
  options: string[];
  correct_answer: string;
  fun_fact: string;
}

/**
 * Fisher-Yates shuffle helper
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Parse SEA Landmarks Dataset
 */
export function parseSeaLandmarks(rawData: unknown = seaLandmarksData): ImageQuizQuestion[] {
  const data = rawData as { landmarks?: LandmarkRaw[] };
  if (!data || !Array.isArray(data.landmarks)) return [];

  return data.landmarks.map((item, index) => ({
    id: `sea-landmark-${item.id || index + 1}`,
    question: item.question,
    image_url: item.image_url,
    landmark_name: item.landmark_name,
    country: item.country,
    location_detail: item.location_detail,
    category: item.category as ImageQuizQuestion["category"],
    options: shuffleArray(item.options || []),
    correct_answer: item.correct_answer,
    fun_fact: item.fun_fact,
    packId: "sea-landmarks-all",
    packTitle: "Địa Danh Đông Nam Á",
  }));
}

/**
 * Parse VN Geography Quiz #1 Dataset
 */
export function parseGeographyQuiz1(rawData: unknown = vnGeographyData): ImageQuizQuestion[] {
  const data = rawData as { questions?: LandmarkRaw[] };
  if (!data || !Array.isArray(data.questions)) return [];

  return data.questions.map((item, index) => ({
    id: `geo-vn-1-${item.id || index + 1}`,
    question: item.question,
    image_url: item.image_url,
    landmark_name: item.landmark_name,
    country: item.country,
    location_detail: item.location_detail,
    category: "Kiến trúc biểu tượng",
    options: shuffleArray(item.options || []),
    correct_answer: item.correct_answer,
    fun_fact: item.fun_fact,
    packId: "geo-vietnam-world-1",
    packTitle: "Địa Lý #1 - VN & Thế Giới",
  }));
}

/**
 * Parse VN Geography Quiz #2 Dataset
 */
export function parseGeographyQuiz2(rawData: unknown = vnGeographyData2): ImageQuizQuestion[] {
  const data = rawData as { questions?: LandmarkRaw[] };
  if (!data || !Array.isArray(data.questions)) return [];

  return data.questions.map((item, index) => ({
    id: `geo-vn-2-${item.id || index + 1}`,
    question: item.question,
    image_url: item.image_url,
    landmark_name: item.landmark_name,
    country: item.country,
    location_detail: item.location_detail,
    category: (item.category as ImageQuizQuestion["category"]) || "Kiến trúc biểu tượng",
    options: shuffleArray(item.options || []),
    correct_answer: item.correct_answer,
    fun_fact: item.fun_fact,
    packId: "geo-vietnam-world-2",
    packTitle: "Địa Lý #2 - Khám Phá Thế Giới",
  }));
}

/**
 * Get available Image Quiz Packs
 */
export function getImageQuizPacks(): ImageQuizPack[] {
  const geoQuestions1 = parseGeographyQuiz1(vnGeographyData);
  const geoQuestions2 = parseGeographyQuiz2(vnGeographyData2);
  const allSeaQuestions = parseSeaLandmarks(seaLandmarksData);

  const heritageQuestions = allSeaQuestions.filter(
    (q) => q.category === "Di sản thế giới" || q.category === "Đền chùa cổ kính"
  );
  const natureIconicQuestions = allSeaQuestions.filter(
    (q) => q.category === "Kỳ quan thiên nhiên" || q.category === "Kiến trúc biểu tượng"
  );

  return [
    {
      id: "geo-vietnam-world-1",
      title: "Địa Lý #1: VN & Thế Giới",
      subtitle: "26 câu hỏi hình ảnh địa lý: đảo Phú Quốc, Bản Giốc, Mỹ Khê, Tà Đùng, Machu Picchu, Petra...",
      icon: "🌏",
      badge: "26 câu",
      totalQuestions: geoQuestions1.length,
      questions: geoQuestions1,
    },
    {
      id: "geo-vietnam-world-2",
      title: "Địa Lý #2: Khám Phá Thế Giới",
      subtitle: "69 câu hỏi hình ảnh địa lý phong phú: thủ đô, núi non, sông hồ, sa mạc, kỳ quan và các kỷ lục thế giới...",
      icon: "🧭",
      badge: "Mới • 69 câu",
      totalQuestions: geoQuestions2.length,
      questions: geoQuestions2,
    },
    {
      id: "sea-landmarks-all",
      title: "Kỳ Quan & Địa Danh Đông Nam Á",
      subtitle: "Khám phá 30+ danh thắng & di sản thế giới nổi tiếng khắp 11 nước ĐNÁ",
      icon: "🏛️",
      badge: "Đầy đủ 30 câu",
      totalQuestions: allSeaQuestions.length,
      questions: allSeaQuestions,
    },
    {
      id: "sea-heritage",
      title: "Di Sản Cổ Kính & Đền Chùa ĐNÁ",
      subtitle: "Chiêm ngưỡng Angkor Wat, Borobudur, Bagan, Shwedagon, Hội An...",
      icon: "🕌",
      badge: `${heritageQuestions.length} câu`,
      totalQuestions: heritageQuestions.length,
      questions: heritageQuestions,
    },
    {
      id: "sea-nature",
      title: "Kỳ Quan Thiên Nhiên & Biểu Tượng Hiện Đại",
      subtitle: "Vịnh Hạ Long, Marina Bay Sands, Tháp Petronas, Núi lửa Bromo...",
      icon: "🏝️",
      badge: `${natureIconicQuestions.length} câu`,
      totalQuestions: natureIconicQuestions.length,
      questions: natureIconicQuestions,
    },
  ];
}


/**
 * Pick random questions with option shuffling
 */
export function pickRandomImageQuestions(
  pool: ImageQuizQuestion[],
  count = 10
): ImageQuizQuestion[] {
  if (!pool || pool.length === 0) return [];
  const shuffled = shuffleArray(pool);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  return selected.map((q) => ({
    ...q,
    options: shuffleArray(q.options),
  }));
}

/**
 * Determines revealed image corners count based on elapsed seconds (0 -> 40s+).
 * 0 - 9s: 0 corners (all covered)
 * 10 - 19s: 1 corner
 * 20 - 29s: 2 corners
 * 30 - 39s: 3 corners
 * >= 40s or isAnswered: 4 corners (all revealed)
 */
export function getRevealedCornersCount(
  elapsedSeconds: number,
  isAnswered = false
): number {
  if (isAnswered) return 4;
  return Math.min(4, Math.floor(Math.max(0, elapsedSeconds) / 10));
}
