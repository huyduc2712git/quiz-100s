import { describe, it, expect } from "vitest";
import {
  extractYouTubeId,
  getYouTubeEmbedUrl,
  parseVnMovie100,
  parseVpop100,
  parseMovie50,
  pickRandomMusicQuestions,
  getAllMusicQuizPacks,
} from "../utils/musicQuizUtils";
import type { MusicQuizQuestion } from "../types/musicQuiz";

describe("Music & Movie Quiz Logic Unit Tests", () => {
  it("1. Trích xuất chính xác YouTube Video ID từ nhiều định dạng URL", () => {
    expect(
      extractYouTubeId("https://www.youtube.com/watch?v=0VC6euBtKkk"),
    ).toBe("0VC6euBtKkk");
    expect(extractYouTubeId("https://youtu.be/Llw9Q6akRo4")).toBe(
      "Llw9Q6akRo4",
    );
    expect(
      extractYouTubeId("https://www.youtube.com/embed/TD7sBUigDIU?start=30"),
    ).toBe("TD7sBUigDIU");
    expect(
      extractYouTubeId("https://youtube.com/watch?v=FN7ALfpGxiI&feature=share"),
    ).toBe("FN7ALfpGxiI");
    expect(extractYouTubeId("")).toBeNull();
  });

  it("2. Tạo đúng link Embed cho YouTube Player với mốc thời gian bắt đầu và kết thúc (30s)", () => {
    const embedUrl = getYouTubeEmbedUrl(
      "https://www.youtube.com/watch?v=0VC6euBtKkk",
      45,
      30,
    );
    expect(embedUrl).toContain(
      "https://www.youtube-nocookie.com/embed/0VC6euBtKkk",
    );
    expect(embedUrl).toContain("start=45");
    expect(embedUrl).toContain("end=75");
    expect(embedUrl).toContain("autoplay=1");
  });

  it("3. Parse bộ dữ liệu vn-movie-music-quiz-100.json từ 'sets' thành công", () => {
    const mockVnMovie = {
      sets: [
        {
          video_id: "video_001",
          youtube_url: "https://www.youtube.com/watch?v=0VC6euBtKkk",
          audio_start: 30,
          audio_duration: 30,
          metadata: {
            song: "Có Chàng Trai Viết Lên Cây",
            movie: "Mắt Biếc",
            artist: "Phan Mạnh Quỳnh",
            director: "Victor Vũ",
            release_year: 2019,
          },
          questions: [
            {
              id: 1,
              question: "Đây là bài hát nào?",
              options: ["A", "B", "C", "D"],
              correct_answer: "Có Chàng Trai Viết Lên Cây",
            },
            {
              id: 2,
              question: "Ca khúc này là nhạc phim của bộ phim nào?",
              options: ["Mắt Biếc", "Mai", "Em và Trịnh", "Bố Già"],
              correct_answer: "Mắt Biếc",
            },
          ],
        },
      ],
    };

    const parsed = parseVnMovie100(mockVnMovie);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].song).toBe("Có Chàng Trai Viết Lên Cây");
    expect(parsed[0].movie).toBe("Mắt Biếc");
    expect(parsed[0].artist).toBe("Phan Mạnh Quỳnh");
    expect(parsed[0].youtube_url).toBe(
      "https://www.youtube.com/watch?v=0VC6euBtKkk",
    );
    expect(parsed[0].audio_start).toBe(30);
  });

  it("4. Parse bộ dữ liệu vpop-2013-2025-100.json từ 'quizzes' và kết nối 'songs'", () => {
    const mockVpop = {
      songs: [
        {
          song: "Lạc Trôi",
          artist: "Sơn Tùng M-TP",
          composer: "Sơn Tùng M-TP",
          year: 2017,
          youtube_url: "https://www.youtube.com/watch?v=Llw9Q6akRo4",
          start: 30,
        },
      ],
      quizzes: [
        {
          id: 1,
          question: "Đây là bài hát nào?",
          song: "Lạc Trôi",
          youtube_url: "https://www.youtube.com/watch?v=Llw9Q6akRo4",
          audio_start: 30,
          audio_duration: 30,
          options: [
            "Lạc Trôi",
            "Nơi Này Có Anh",
            "Hãy Trao Cho Anh",
            "Muộn Rồi Mà Sao Còn",
          ],
          correct_answer: "Lạc Trôi",
        },
      ],
    };

    const parsed = parseVpop100(mockVpop);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].song).toBe("Lạc Trôi");
    expect(parsed[0].artist).toBe("Sơn Tùng M-TP");
    expect(parsed[0].release_year).toBe(2017);
    expect(parsed[0].correct_answer).toBe("Lạc Trôi");
  });

  it("5. Parse bộ dữ liệu 50-music-movie.json từ 'sets'", () => {
    const mockMovie50 = {
      sets: [
        {
          id: 1,
          question: "Ca khúc này có tên là gì?",
          youtube_url: "https://www.youtube.com/watch?v=TD7sBUigDIU",
          audio_start: 30,
          audio_duration: 30,
          options: [
            "Sao Cha Không",
            "Sau Lời Từ Khước",
            "Có Chàng Trai Viết Lên Cây",
            "Đóa Bạch Trà",
          ],
          correct_answer: "Sao Cha Không",
        },
      ],
    };

    const parsed = parseMovie50(mockMovie50);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].question).toBe("Ca khúc này có tên là gì?");
    expect(parsed[0].correct_answer).toBe("Sao Cha Không");
  });

  it("6. Tải toàn bộ 3 gói dữ liệu thực tế đầy đủ số lượng câu hỏi", () => {
    const packs = getAllMusicQuizPacks();
    expect(packs).toHaveLength(3);

    const vnMoviePack = packs.find((p) => p.id === "vn-movie-100");
    const vpopPack = packs.find((p) => p.id === "vpop-100");
    const movie50Pack = packs.find((p) => p.id === "vn-movie-50");

    expect(vnMoviePack).toBeDefined();
    expect(vnMoviePack?.totalQuestions).toBe(100);

    expect(vpopPack).toBeDefined();
    expect(vpopPack?.totalQuestions).toBe(100);

    expect(movie50Pack).toBeDefined();
    expect(movie50Pack?.totalQuestions).toBe(50);
  });

  it("7. Lấy ngẫu nhiên câu hỏi và xáo trộn 4 đáp án", () => {
    const mockQuestions: MusicQuizQuestion[] = Array.from(
      { length: 20 },
      (_, idx) => ({
        id: `q-${idx}`,
        song: `Bài hát ${idx}`,
        question: `Câu hỏi ${idx}`,
        youtube_url: `https://www.youtube.com/watch?v=vid_${idx}`,
        audio_start: 30,
        audio_duration: 30,
        options: ["A", "B", "C", "D"],
        correct_answer: "A",
        packId: "vn-movie-100",
        packTitle: "Nhạc Phim",
      }),
    );

    const picked = pickRandomMusicQuestions(mockQuestions, 5, true);
    expect(picked).toHaveLength(5);
    for (const q of picked) {
      expect(q.options).toHaveLength(4);
      expect(q.options).toContain("A");
    }
  });

  it("8. Đảm bảo random ưu tiên chọn các bài hát khác nhau (đa dạng bài hát)", () => {
    // 4 bài hát, mỗi bài có 3 câu hỏi (tổng 12 câu)
    const mockMultiQuestions: MusicQuizQuestion[] = [];
    ["Lạc Trôi", "Mắt Biếc", "Bố Già", "Cô Ba Sài Gòn"].forEach(
      (song, sIdx) => {
        for (let qIdx = 0; qIdx < 3; qIdx++) {
          mockMultiQuestions.push({
            id: `q-${sIdx}-${qIdx}`,
            song,
            question: `Câu hỏi ${qIdx + 1} về ${song}`,
            youtube_url: `https://www.youtube.com/watch?v=vid_${sIdx}`,
            audio_start: 30,
            audio_duration: 30,
            options: ["A", "B", "C", "D"],
            correct_answer: "A",
            packId: "pack-1",
            packTitle: "Pack",
          });
        }
      },
    );

    // Khi chọn 4 câu, cả 4 câu phải thuộc về 4 bài hát khác nhau
    const picked = pickRandomMusicQuestions(mockMultiQuestions, 4, true);
    expect(picked).toHaveLength(4);

    const pickedSongs = new Set(picked.map((q) => q.song));
    expect(pickedSongs.size).toBe(4);
  });
});
