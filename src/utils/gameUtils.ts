import type { Card } from "../types/game";

export const DATA_URL =
  "https://raw.githubusercontent.com/huyduc2712git/huyduc2712git/main/datasets/goi-y-100/v1/data.json";

export const LOCAL_STORAGE_KEY = "goi_y_100_cards_cache_v1";

/**
 * Fetches cards from remote endpoint or local storage cache fallback.
 */
export async function fetchCards(customFetch?: typeof fetch): Promise<Card[]> {
  const fetchFn = customFetch || fetch;
  try {
    const res = await fetchFn(DATA_URL);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const json: unknown = await res.json();
    let cards: Card[] = [];
    if (Array.isArray(json)) {
      cards = json as Card[];
    } else if (json && typeof json === "object") {
      const obj = json as Record<string, unknown>;
      if (Array.isArray(obj.cards)) {
        cards = obj.cards as Card[];
      } else if (Array.isArray(obj.data)) {
        cards = obj.data as Card[];
      }
    }

    if (cards.length > 0) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cards));
      } catch (e) {
        console.warn("Could not save cards to localStorage", e);
      }
      return cards;
    }
    throw new Error("Dữ liệu không hợp lệ");
  } catch (err) {
    // Try localStorage fallback
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.warn("Failed to parse cached cards", e);
      }
    }
    throw err;
  }
}

/**
 * Filter categories that have at least 5 cards.
 */
export function getValidCategories(cards: Card[]): string[] {
  const counts: Record<string, number> = {};
  for (const card of cards) {
    if (card.category) {
      counts[card.category] = (counts[card.category] || 0) + 1;
    }
  }
  return Object.keys(counts).filter((cat) => counts[cat] >= 5);
}

/**
 * Format category identifier into user-friendly Vietnamese title.
 */
export function formatCategoryName(cat: string): string {
  const map: Record<string, string> = {
    "am-nhac-viet-nam": "Âm Nhạc Việt Nam",
    "dia-ly": "Địa Lý",
    "khoa-hoc": "Khoa Học",
    "lich-su-viet-nam": "Lịch Sử Việt Nam",
    "toan-hoc": "Toán Học",
    "nhan-vat-noi-tieng": "Nhân Vật Nổi Tiếng",
    "am-thuc-viet-nam": "Ẩm Thực Việt Nam",
    "dia-ly-viet-nam": "Địa Lý Việt Nam",
    "phim-anh-giai-tri": "Phim Ảnh & Giải Trí",
    "lich-su-van-hoa": "Lịch Sử & Văn Hóa",
    "the-thao": "Thể Thao",
  };
  if (map[cat]) return map[cat];
  // Fallback: title case
  return cat
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Randomly select `count` unique cards from a category without duplicates.
 */
export function pickRandomQuestions(
  cards: Card[],
  category: string,
  count = 5
): Card[] {
  const filtered = cards.filter((c) => c.category === category);
  if (filtered.length < count) {
    throw new Error(
      `Chủ đề ${category} không có đủ ${count} câu hỏi (chỉ có ${filtered.length})`
    );
  }

  // Shuffle copy using Fisher-Yates
  const shuffled = [...filtered];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const selected = shuffled.slice(0, count);

  // Extra safety: ensure unique IDs
  const uniqueIds = new Set<string>();
  const result: Card[] = [];
  for (const card of selected) {
    if (!uniqueIds.has(card.id)) {
      uniqueIds.add(card.id);
      result.push(card);
    }
  }

  // If duplicate IDs existed in raw dataset, grab more unique ones
  if (result.length < count) {
    for (const card of shuffled) {
      if (!uniqueIds.has(card.id)) {
        uniqueIds.add(card.id);
        result.push(card);
        if (result.length === count) break;
      }
    }
  }

  return result;
}

/**
 * Determines revealed hints count based on remaining time (100 -> 0).
 * 100s: 1 hint
 * 80s: 2 hints
 * 60s: 3 hints
 * 40s: 4 hints
 * 20s: 5 hints
 */
export function getRevealedHintsCount(timeRemaining: number): number {
  if (timeRemaining > 80) return 1;
  if (timeRemaining > 60) return 2;
  if (timeRemaining > 40) return 3;
  if (timeRemaining > 20) return 4;
  return 5;
}
