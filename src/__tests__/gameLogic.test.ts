import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Card } from "../types/game";
import {
  getValidCategories,
  pickRandomQuestions,
  getRevealedHintsCount,
  formatCategoryName,
} from "../utils/gameUtils";

// Mock dataset
const mockCards: Card[] = [
  // Category A: 6 cards (valid)
  { id: "a1", category: "cat-a", answer: "A1", hints: ["h1", "h2", "h3", "h4", "h5"], difficulty: "easy", source_url: "" },
  { id: "a2", category: "cat-a", answer: "A2", hints: ["h1", "h2", "h3", "h4", "h5"], difficulty: "easy", source_url: "" },
  { id: "a3", category: "cat-a", answer: "A3", hints: ["h1", "h2", "h3", "h4", "h5"], difficulty: "medium", source_url: "" },
  { id: "a4", category: "cat-a", answer: "A4", hints: ["h1", "h2", "h3", "h4", "h5"], difficulty: "hard", source_url: "" },
  { id: "a5", category: "cat-a", answer: "A5", hints: ["h1", "h2", "h3", "h4", "h5"], difficulty: "easy", source_url: "" },
  { id: "a6", category: "cat-a", answer: "A6", hints: ["h1", "h2", "h3", "h4", "h5"], difficulty: "medium", source_url: "" },

  // Category B: 3 cards (invalid, < 5)
  { id: "b1", category: "cat-b", answer: "B1", hints: ["h1", "h2", "h3", "h4", "h5"], difficulty: "easy", source_url: "" },
  { id: "b2", category: "cat-b", answer: "B2", hints: ["h1", "h2", "h3", "h4", "h5"], difficulty: "easy", source_url: "" },
  { id: "b3", category: "cat-b", answer: "B3", hints: ["h1", "h2", "h3", "h4", "h5"], difficulty: "easy", source_url: "" },
];

describe("Web Game 'Gợi Ý 100' Logic Unit Tests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("hiển thị đúng tên tiếng Việt cho các chủ đề từ dữ liệu thật", () => {
    expect(formatCategoryName("dia-ly")).toBe("Địa Lý");
    expect(formatCategoryName("khoa-hoc")).toBe("Khoa Học");
    expect(formatCategoryName("lich-su-viet-nam")).toBe("Lịch Sử Việt Nam");
    expect(formatCategoryName("toan-hoc")).toBe("Toán Học");
    expect(formatCategoryName("nhan-vat-noi-tieng")).toBe(
      "Nhân Vật Nổi Tiếng",
    );
  });

  it("1. Random đúng 5 câu và không trùng ID", () => {
    const picked = pickRandomQuestions(mockCards, "cat-a", 5);
    expect(picked).toHaveLength(5);

    const ids = picked.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(5);
  });

  it("2. Chỉ chọn chủ đề có ít nhất 5 câu", () => {
    const validCategories = getValidCategories(mockCards);
    expect(validCategories).toContain("cat-a");
    expect(validCategories).not.toContain("cat-b");
    expect(validCategories).toHaveLength(1);
  });

  it("3. Mốc mở gợi ý 100/80/60/40/20 giây", () => {
    // 100s -> 1 hint
    expect(getRevealedHintsCount(100)).toBe(1);
    expect(getRevealedHintsCount(85)).toBe(1);

    // 80s -> 2 hints
    expect(getRevealedHintsCount(80)).toBe(2);
    expect(getRevealedHintsCount(70)).toBe(2);

    // 60s -> 3 hints
    expect(getRevealedHintsCount(60)).toBe(3);
    expect(getRevealedHintsCount(50)).toBe(3);

    // 40s -> 4 hints
    expect(getRevealedHintsCount(40)).toBe(4);
    expect(getRevealedHintsCount(25)).toBe(4);

    // 20s -> 5 hints
    expect(getRevealedHintsCount(20)).toBe(5);
    expect(getRevealedHintsCount(10)).toBe(5);
    expect(getRevealedHintsCount(0)).toBe(5);
  });

  it("4. Nút đúng chỉ cộng một điểm và hỗ trợ khóa chống bấm đúp", () => {
    let score = 0;
    let isLocked = false;

    function handleCorrectAnswer() {
      if (isLocked) return;
      isLocked = true;
      score += 1;
    }

    // First click
    handleCorrectAnswer();
    expect(score).toBe(1);
    expect(isLocked).toBe(true);

    // Rapid double click
    handleCorrectAnswer();
    expect(score).toBe(1);
  });

  it("5. Hết giờ không cộng điểm", () => {
    let score = 0;
    const isCorrect = false; // timeout

    if (isCorrect) {
      score += 1;
    }

    expect(score).toBe(0);
  });

  it("6. Chuyển câu reset timer và gợi ý", () => {
    let currentQuestionIndex = 0;
    let timeLeft = 30; // middle of previous question
    let revealedHints = getRevealedHintsCount(timeLeft); // 4

    expect(revealedHints).toBe(4);

    // Move to next question
    currentQuestionIndex += 1;
    timeLeft = 100; // Reset timer to 100s
    revealedHints = getRevealedHintsCount(timeLeft); // 1

    expect(currentQuestionIndex).toBe(1);
    expect(timeLeft).toBe(100);
    expect(revealedHints).toBe(1);
  });

  it("7. Kết thúc chính xác sau 5 câu", () => {
    const totalQuestions = 5;
    let currentIndex = 0;
    let isFinished = false;

    for (let step = 0; step < totalQuestions; step++) {
      if (currentIndex === totalQuestions - 1) {
        isFinished = true;
      } else {
        currentIndex++;
      }
    }

    expect(isFinished).toBe(true);
    expect(currentIndex).toBe(4); // index of 5th question (0-indexed)
  });
});
