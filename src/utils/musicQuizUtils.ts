import type {
  MusicQuizPack,
  MusicQuizQuestion,
} from "../types/musicQuiz";
import vnMovie100Data from "../data/vn-movie-music-quiz-100.json";
import vpop100Data from "../data/vpop-2013-2025-100.json";
import movie50Data from "../data/50-music-movie.json";

export const MUSIC_STORAGE_KEYS = {
  VN_MOVIE_100: "music_quiz_vn_movie_100_cache",
  VPOP_100: "music_quiz_vpop_100_cache",
  MOVIE_50: "music_quiz_movie_50_cache",
  STATS: "music_quiz_player_stats_v1",
};

interface VnMovieSetQuestionRaw {
  id: number | string;
  question: string;
  youtube_url?: string;
  audio_start?: number;
  audio_duration?: number;
  options: string[];
  correct_answer: string;
}

interface VnMovieSetRaw {
  video_id?: string;
  youtube_url: string;
  audio_start: number;
  audio_duration: number;
  metadata?: {
    song?: string;
    movie?: string;
    artist?: string;
    director?: string;
    release_year?: number;
  };
  questions: VnMovieSetQuestionRaw[];
}

interface VpopSongRaw {
  song: string;
  artist?: string;
  composer?: string;
  year?: number;
  youtube_url?: string;
  start?: number;
  category?: string;
}

interface VpopQuizRaw {
  id: number | string;
  question: string;
  youtube_url: string;
  audio_start: number;
  audio_duration: number;
  song?: string;
  options: string[];
  correct_answer: string;
}

interface Movie50QuestionRaw {
  id: number | string;
  question: string;
  youtube_url: string;
  audio_start: number;
  audio_duration: number;
  options: string[];
  correct_answer: string;
}

/**
 * Extract YouTube Video ID from various URL formats
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp =
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/;
  const match = url.match(regExp);
  return match && match[1].length === 11 ? match[1] : null;
}

/**
 * Build safe embed URL for YouTube Player with start and end boundaries
 */
export function getYouTubeEmbedUrl(
  url: string,
  startSeconds = 30,
  durationSeconds = 30,
  autoplay = 1
): string {
  const videoId = extractYouTubeId(url);
  if (!videoId) return "";
  const start = Math.max(0, Math.floor(startSeconds));
  const duration = Math.max(5, Math.floor(durationSeconds));
  const end = start + duration;
  return `https://www.youtube-nocookie.com/embed/${videoId}?start=${start}&end=${end}&autoplay=${autoplay}&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;
}


/**
 * Parse Vietnamese Movie Music 100 Quiz Dataset (taking from `sets`)
 */
export function parseVnMovie100(rawData: unknown): MusicQuizQuestion[] {
  const data = rawData as { sets?: VnMovieSetRaw[] };
  if (!data || !Array.isArray(data.sets)) return [];

  const questions: MusicQuizQuestion[] = [];

  for (const set of data.sets) {
    const defaultUrl = set.youtube_url || "";
    const defaultStart = typeof set.audio_start === "number" ? set.audio_start : 30;
    const defaultDuration = typeof set.audio_duration === "number" ? set.audio_duration : 30;
    const meta = set.metadata || {};

    if (Array.isArray(set.questions)) {
      for (const q of set.questions) {
        questions.push({
          id: `vn-movie-100-${q.id || questions.length + 1}`,
          question: q.question,
          youtube_url: q.youtube_url || defaultUrl,
          audio_start: typeof q.audio_start === "number" ? q.audio_start : defaultStart,
          audio_duration: typeof q.audio_duration === "number" ? q.audio_duration : defaultDuration,
          options: q.options || [],
          correct_answer: q.correct_answer,
          song: meta.song,
          movie: meta.movie,
          artist: meta.artist,
          director: meta.director,
          release_year: meta.release_year,
          packId: "vn-movie-100",
          packTitle: "Nhạc Phim Việt Nam (100 câu)",
        });
      }
    }
  }

  return questions;
}

/**
 * Parse V-Pop 2013-2025 Dataset (taking from `quizzes`)
 */
export function parseVpop100(rawData: unknown): MusicQuizQuestion[] {
  const data = rawData as { songs?: VpopSongRaw[]; quizzes?: VpopQuizRaw[] };
  if (!data || !Array.isArray(data.quizzes)) return [];

  const songMap = new Map<string, VpopSongRaw>();
  if (Array.isArray(data.songs)) {
    for (const s of data.songs) {
      if (s.song) songMap.set(s.song.trim().toLowerCase(), s);
    }
  }

  const questions: MusicQuizQuestion[] = [];

  for (const q of data.quizzes) {
    const matchedSong = q.song ? songMap.get(q.song.trim().toLowerCase()) : undefined;

    questions.push({
      id: `vpop-100-${q.id || questions.length + 1}`,
      question: q.question,
      youtube_url: q.youtube_url || (matchedSong?.youtube_url || ""),
      audio_start: typeof q.audio_start === "number" ? q.audio_start : (matchedSong?.start || 30),
      audio_duration: typeof q.audio_duration === "number" ? q.audio_duration : 30,
      options: q.options || [],
      correct_answer: q.correct_answer,
      song: q.song || matchedSong?.song,
      artist: matchedSong?.artist,
      composer: matchedSong?.composer,
      release_year: matchedSong?.year,
      packId: "vpop-100",
      packTitle: "V-Pop 2013–2025 (100 câu)",
    });
  }

  return questions;
}

/**
 * Parse Movie Music 50 Dataset (taking from `sets`)
 */
export function parseMovie50(rawData: unknown): MusicQuizQuestion[] {
  const data = rawData as { sets?: Movie50QuestionRaw[] };
  if (!data || !Array.isArray(data.sets)) return [];

  const questions: MusicQuizQuestion[] = [];

  for (const q of data.sets) {
    questions.push({
      id: `movie-50-${q.id || questions.length + 1}`,
      question: q.question,
      youtube_url: q.youtube_url || "",
      audio_start: typeof q.audio_start === "number" ? q.audio_start : 30,
      audio_duration: typeof q.audio_duration === "number" ? q.audio_duration : 30,
      options: q.options || [],
      correct_answer: q.correct_answer,
      packId: "vn-movie-50",
      packTitle: "Nhạc Phim Tuyển Chọn (50 câu)",
    });
  }

  return questions;
}

/**
 * Load all available Music Quiz Packs
 */
export function getAllMusicQuizPacks(): MusicQuizPack[] {
  const vnMovieQuestions = parseVnMovie100(vnMovie100Data);
  const vpopQuestions = parseVpop100(vpop100Data);
  const movie50Questions = parseMovie50(movie50Data);

  return [
    {
      id: "vn-movie-100",
      title: "Nhạc Phim Việt Nam",
      subtitle: "20 bộ phim kinh điển (Mắt Biếc, Mai, Em và Trịnh, Bố Già...)",
      icon: "🎬",
      badge: "100 Câu Hỏi",
      totalQuestions: vnMovieQuestions.length,
      questions: vnMovieQuestions,
    },
    {
      id: "vpop-100",
      title: "V-Pop 2013 – 2025",
      subtitle: "20 bản hit đình đám (Sơn Tùng, Chillies, Hoàng Thùy Linh...)",
      icon: "🎧",
      badge: "100 Câu Hỏi",
      totalQuestions: vpopQuestions.length,
      questions: vpopQuestions,
    },
    {
      id: "vn-movie-50",
      title: "Nhạc Phim Tuyển Chọn",
      subtitle: "Bộ 50 câu trắc nghiệm đoán tên bài hát, ca sĩ & nhạc phim",
      icon: "🍿",
      badge: "50 Câu Hỏi",
      totalQuestions: movie50Questions.length,
      questions: movie50Questions,
    },
  ];
}

/**
 * Randomize and pick `count` questions ensuring maximum song diversity (distinct songs per question).
 */
export function pickRandomMusicQuestions(
  questions: MusicQuizQuestion[],
  count = 10,
  shuffleOptions = true
): MusicQuizQuestion[] {
  if (!questions || questions.length === 0) return [];

  // Group questions by song / audio source identifier to ensure variety
  const songMap = new Map<string, MusicQuizQuestion[]>();
  for (const q of questions) {
    const key = (q.song || q.youtube_url || String(q.id)).trim().toLowerCase();
    if (!songMap.has(key)) {
      songMap.set(key, []);
    }
    songMap.get(key)!.push(q);
  }

  // Shuffle list of distinct songs using Fisher-Yates
  const songKeys = Array.from(songMap.keys());
  for (let i = songKeys.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [songKeys[i], songKeys[j]] = [songKeys[j], songKeys[i]];
  }

  const selectedQuestions: MusicQuizQuestion[] = [];
  const targetCount = Math.min(count, questions.length);

  // Round-robin pick 1 random question from each distinct song
  let songIndex = 0;
  while (selectedQuestions.length < targetCount) {
    const currentKey = songKeys[songIndex % songKeys.length];
    const pool = songMap.get(currentKey) || [];

    if (pool.length > 0) {
      // Pick 1 random question from this song
      const qIdx = Math.floor(Math.random() * pool.length);
      const chosen = pool.splice(qIdx, 1)[0];
      selectedQuestions.push(chosen);
    }

    songIndex++;
    // Safety check if all pools are exhausted
    if (songKeys.every((k) => (songMap.get(k)?.length || 0) === 0)) {
      break;
    }
  }

  // Final shuffle of the selected questions list
  for (let i = selectedQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [selectedQuestions[i], selectedQuestions[j]] = [selectedQuestions[j], selectedQuestions[i]];
  }

  if (!shuffleOptions) return selectedQuestions;

  // Shuffle 4 options for each question
  return selectedQuestions.map((q) => {
    const options = [...q.options];
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return {
      ...q,
      options,
    };
  });
}

