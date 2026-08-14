import { describe, it, expect } from "vitest";
import {
  parseSeaLandmarks,
  parseGeographyQuiz1,
  parseGeographyQuiz2,
  getImageQuizPacks,
  pickRandomImageQuestions,
  getRevealedCornersCount,
  shuffleArray,
} from "../utils/imageQuizUtils";
import seaLandmarksData from "../data/sea-landmarks-quiz.json";
import vnGeographyData from "../data/vn-geography-quiz-1.json";
import vnGeographyData2 from "../data/vn-geography-quiz-2.json";

describe("Image Quiz & Geography Quiz Tests", () => {
  it("1. Parse bộ dữ liệu sea-landmarks-quiz.json đầy đủ và hợp lệ", () => {
    const questions = parseSeaLandmarks(seaLandmarksData);
    expect(questions.length).toBeGreaterThanOrEqual(30);

    for (const q of questions) {
      expect(q.id).toBeDefined();
      expect(q.question).toBeTruthy();
      expect(q.image_url).toBeTruthy();
      expect(q.landmark_name).toBeTruthy();
      expect(q.country).toBeTruthy();
      expect(q.category).toBeTruthy();
      expect(q.options.length).toBe(4);
      expect(q.correct_answer).toBeTruthy();
      expect(q.fun_fact).toBeTruthy();
      // Đáp án đúng phải nằm trong danh sách 4 lựa chọn
      expect(q.options).toContain(q.correct_answer);
    }
  });

  it("2. Parse bộ dữ liệu vn-geography-quiz-1.json đầy đủ và hợp lệ", () => {
    const questions = parseGeographyQuiz1(vnGeographyData);
    expect(questions.length).toBe(26);

    for (const q of questions) {
      expect(q.id).toBeDefined();
      expect(q.question).toBeTruthy();
      expect(q.image_url).toBeTruthy();
      expect(q.landmark_name).toBeTruthy();
      expect(q.country).toBeTruthy();
      expect(q.options.length).toBe(4);
      expect(q.correct_answer).toBeTruthy();
      expect(q.fun_fact).toBeTruthy();
      expect(q.options).toContain(q.correct_answer);
    }
  });

  it("3. Parse bộ dữ liệu vn-geography-quiz-2.json đầy đủ và hợp lệ", () => {
    const questions = parseGeographyQuiz2(vnGeographyData2);
    expect(questions.length).toBe(69);

    for (const q of questions) {
      expect(q.id).toBeDefined();
      expect(q.question).toBeTruthy();
      expect(q.image_url).toBeTruthy();
      expect(q.landmark_name).toBeTruthy();
      expect(q.country).toBeTruthy();
      expect(q.options.length).toBe(4);
      expect(q.correct_answer).toBeTruthy();
      expect(q.fun_fact).toBeTruthy();
      expect(q.options).toContain(q.correct_answer);
    }
  });

  it("4. Đảm bảo đại diện đầy đủ các quốc gia Đông Nam Á", () => {
    const questions = parseSeaLandmarks(seaLandmarksData);
    const countries = new Set(questions.map((q) => q.country));

    expect(countries.has("Việt Nam")).toBe(true);
    expect(countries.has("Campuchia")).toBe(true);
    expect(countries.has("Thái Lan")).toBe(true);
    expect(countries.has("Singapore")).toBe(true);
    expect(countries.has("Indonesia")).toBe(true);
    expect(countries.has("Malaysia")).toBe(true);
    expect(countries.has("Lào")).toBe(true);
    expect(countries.has("Myanmar")).toBe(true);
    expect(countries.has("Philippines")).toBe(true);
    expect(countries.has("Brunei")).toBe(true);
    expect(countries.has("Đông Timor")).toBe(true);
  });

  it("5. Lấy danh sách gói câu hỏi Image Quiz Packs thành công", () => {
    const packs = getImageQuizPacks();
    expect(packs.length).toBe(5);
    expect(packs[0].id).toBe("geo-vietnam-world-1");
    expect(packs[1].id).toBe("geo-vietnam-world-2");
    expect(packs[2].id).toBe("sea-landmarks-all");
    expect(packs[3].id).toBe("sea-heritage");
    expect(packs[4].id).toBe("sea-nature");

    for (const pack of packs) {
      expect(pack.totalQuestions).toBeGreaterThan(0);
      expect(pack.questions.length).toBe(pack.totalQuestions);
    }
  });

  it("4. Chọn ngẫu nhiên N câu hỏi cho ván chơi và xáo trộn 4 đáp án", () => {
    const allQuestions = parseSeaLandmarks(seaLandmarksData);
    const selected = pickRandomImageQuestions(allQuestions, 10);

    expect(selected.length).toBe(10);
    for (const q of selected) {
      expect(q.options.length).toBe(4);
      expect(q.options).toContain(q.correct_answer);
    }
  });

  it("6. Thuật toán Fisher-Yates xáo trộn mảng không làm mất phần tử", () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(original);
    expect(shuffled.length).toBe(original.length);
    expect(shuffled.sort()).toEqual(original.sort());
  });

  it("7. Tính toán chính xác số góc ảnh được mở mỗi 10 giây", () => {
    // 0 - 9s: 0 góc
    expect(getRevealedCornersCount(0, false)).toBe(0);
    expect(getRevealedCornersCount(5, false)).toBe(0);
    expect(getRevealedCornersCount(9, false)).toBe(0);

    // 10 - 19s: 1 góc
    expect(getRevealedCornersCount(10, false)).toBe(1);
    expect(getRevealedCornersCount(19, false)).toBe(1);

    // 20 - 29s: 2 góc
    expect(getRevealedCornersCount(20, false)).toBe(2);
    expect(getRevealedCornersCount(29, false)).toBe(2);

    // 30 - 39s: 3 góc
    expect(getRevealedCornersCount(30, false)).toBe(3);
    expect(getRevealedCornersCount(39, false)).toBe(3);

    // >= 40s: 4 góc (toàn bộ)
    expect(getRevealedCornersCount(40, false)).toBe(4);
    expect(getRevealedCornersCount(60, false)).toBe(4);

    // Khi đã trả lời (isAnswered = true): luôn mở toàn bộ 4 góc
    expect(getRevealedCornersCount(0, true)).toBe(4);
    expect(getRevealedCornersCount(5, true)).toBe(4);
  });
});
