import type { Card } from "../types/game";
import vnFamousPeopleData from "../data/vn-famous-people-100.json";

const VIETNAMESE_FAMOUS_PEOPLE_100 = vnFamousPeopleData as Card[];


export const DATA_URL =
  "https://raw.githubusercontent.com/huyduc2712git/huyduc2712git/main/datasets/goi-y-100/v1/data.json";

export const LOCAL_STORAGE_KEY = "goi_y_100_cards_cache_v2";

/**
 * Fetches cards from remote endpoint or local storage cache fallback,
 * ensuring all "nhan-vat-noi-tieng" cards are strictly 100% standardized to Vietnamese figures.
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
      // Standardize: Replace any foreign figures with 100% Vietnamese personalities
      const otherCards = cards.filter((c) => c.category !== "nhan-vat-noi-tieng");
      const standardizedCards = [...otherCards, ...VIETNAMESE_FAMOUS_PEOPLE_100];

      try {
        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify(standardizedCards)
        );
      } catch (e) {
        console.warn("Could not save cards to localStorage", e);
      }
      return standardizedCards;
    }
    return VIETNAMESE_FAMOUS_PEOPLE_100;
  } catch {
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
    return VIETNAMESE_FAMOUS_PEOPLE_100;
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
 * Get colorful emoji icon for category identifier
 */
export function getCategoryEmoji(cat: string | null): string {
  if (!cat) return "🎲";
  const iconMap: Record<string, string> = {
    "am-nhac-viet-nam": "🎵",
    "dia-ly": "🗺️",
    "khoa-hoc": "🔬",
    "lich-su-viet-nam": "🏛️",
    "toan-hoc": "📐",
    "nhan-vat-noi-tieng": "👑",
    "am-thuc-viet-nam": "🍜",
    "dia-ly-viet-nam": "🏝️",
    "phim-anh-giai-tri": "🎬",
    "lich-su-van-hoa": "📜",
    "the-thao": "⚽",
  };
  return iconMap[cat] || "💡";
}

/**
 * Format category identifier into compact title for mobile icon grids
 */
export function formatCategoryShortName(cat: string): string {
  const shortMap: Record<string, string> = {
    "am-nhac-viet-nam": "Âm Nhạc",
    "dia-ly": "Địa Lý",
    "dia-ly-viet-nam": "Địa Lý",
    "khoa-hoc": "Khoa Học",
    "lich-su-viet-nam": "Lịch Sử",
    "lich-su-van-hoa": "Văn Hóa",
    "toan-hoc": "Toán Học",
    "nhan-vat-noi-tieng": "Nhân Vật",
    "am-thuc-viet-nam": "Ẩm Thực",
    "phim-anh-giai-tri": "Phim Ảnh",
    "the-thao": "Thể Thao",
  };
  if (shortMap[cat]) return shortMap[cat];
  return formatCategoryName(cat);
}

/**
 * Generate a natural spoken introductory clue (e.g. "Một nhân vật lịch sử gồm 2 từ")
 */
export function generateOpeningClue(card: Card): string {
  const ans = (card.answer || "").trim();
  const ansLower = ans.toLowerCase();
  const cat = (card.category || "").toLowerCase();
  const wordCount = ans.split(/\s+/).filter(Boolean).length;
  const countStr = wordCount > 0 ? ` gồm ${wordCount} từ` : "";

  // 1. History Category
  if (cat.includes("lich-su")) {
    // Check specific event / battle / campaign prefixes in ANSWER first
    if (
      /^(chiến thắng|chiến dịch|trận|khởi nghĩa|cách mạng|phong trào|hiệp định|hiệp ước|hội nghị|kháng chiến|cuộc|binh biến|vụ án|sự kiện|tổng khởi nghĩa)/i.test(
        ansLower
      )
    ) {
      return `Một sự kiện lịch sử${countStr}`;
    }
    // Check historical monuments / temples / relics
    if (
      /^(đền|chùa|lăng|lăng mộ|miếu|đình|nhà thờ|tháp|cố đô|kinh thành|địa đạo|khu di tích|di tích)/i.test(
        ansLower
      )
    ) {
      return `Một di tích lịch sử${countStr}`;
    }
    // Check ancient kingdoms / states
    if (
      /^(âu lạc|văn lang|đại việt|đại cồ việt|phù nam|chăm pa|champa|vạn xuân|đại ngu|nam việt|nhà nước|quốc gia cổ)/i.test(
        ansLower
      )
    ) {
      return `Một nhà nước / thời kỳ lịch sử${countStr}`;
    }
    // Check historical dynasties / eras
    if (/^(triều|nhà|thời kỳ|thời đại|vương triều)/i.test(ansLower)) {
      return `Một triều đại lịch sử${countStr}`;
    }
    // In Vietnamese history quizzes, almost all individual proper names (e.g. Võ Thị Sáu, Nguyễn Trãi, Quang Trung, Hai Bà Trưng, v.v.) are Historical Figures
    return `Một nhân vật lịch sử${countStr}`;
  }


  // 2. Celebrities / Famous Persons Category (100% Vietnamese Personalities)
  if (cat.includes("nhan-vat")) {
    const hintsLower = (card.hints || []).join(" ").toLowerCase();
    if (/nhà văn|nhà thơ|tiểu thuyết|truyện|thi sĩ|tác giả|kịch/i.test(hintsLower)) {
      return `Một nhà văn / tác giả Việt Nam${countStr}`;
    }
    if (/ca sĩ|nhạc sĩ|tân nhạc|v-pop|rap|rapper|nhạc viện|piano|âm nhạc/i.test(hintsLower)) {
      return `Một nghệ sĩ / ca sĩ Việt Nam${countStr}`;
    }
    if (/họa sĩ|hội họa|mỹ thuật|tranh/i.test(hintsLower)) {
      return `Một danh họa / họa sĩ Việt Nam${countStr}`;
    }
    if (/vận động viên|cầu thủ|bơi lội|bắn súng|cờ vua|boxing|cử tạ|muay/i.test(hintsLower)) {
      return `Một vận động viên thể thao Việt Nam${countStr}`;
    }
    if (/doanh nhân|tỷ phú|chủ tịch|tập đoàn/i.test(hintsLower)) {
      return `Một doanh nhân Việt Nam${countStr}`;
    }
    if (/bác sĩ|giáo sư|toán học|vật lý|y học|nhà khoa học|nhà bác học/i.test(hintsLower)) {
      return `Một nhà khoa học / giáo sư Việt Nam${countStr}`;
    }
    if (/hoa hậu|người mẫu|sắc đẹp/i.test(hintsLower)) {
      return `Một hoa hậu / người đẹp Việt Nam${countStr}`;
    }
    return `Một nhân vật nổi tiếng Việt Nam${countStr}`;
  }


  // 3. Food / Culinary Category
  if (cat.includes("am-thuc")) {
    return `Một món ăn đặc sản / ẩm thực${countStr}`;
  }

  // 4. Geography Category
  if (cat.includes("dia-ly")) {
    if (
      /^(vịnh|sông|núi|đèo|đảo|quần đảo|hồ|biển|thác|hang|động|rừng|mũi|suối|bán đảo|bãi biển|vườn quốc gia)/i.test(
        ansLower
      )
    ) {
      return `Một danh lam thắng cảnh${countStr}`;
    }
    if (/^(tỉnh|thành phố|thị xã|huyện|quận|thủ đô|thành)/i.test(ansLower)) {
      return `Một tỉnh thành / địa danh${countStr}`;
    }
    return `Một địa danh / địa lý${countStr}`;
  }

  // 5. Music Category
  if (cat.includes("am-nhac")) {
    const hintsLower = (card.hints || []).join(" ").toLowerCase();
    if (
      /ca sĩ|nhạc sĩ|ban nhạc|nghệ sĩ|thành viên|rapper/i.test(hintsLower) &&
      !/sáng tác bài|bài hát mang tên|ca khúc/i.test(hintsLower)
    ) {
      return `Một ca sĩ / nghệ sĩ âm nhạc${countStr}`;
    }
    return `Một bài hát / ca khúc âm nhạc${countStr}`;
  }

  // 6. Cinema / Entertainment Category
  if (cat.includes("phim-anh") || cat.includes("giai-tri")) {
    const hintsLower = (card.hints || []).join(" ").toLowerCase();
    if (/diễn viên|đạo diễn|nghệ sĩ ưu tú|nghệ sĩ nhân dân/i.test(hintsLower)) {
      return `Một diễn viên / nghệ sĩ điện ảnh${countStr}`;
    }
    return `Một bộ phim / tác phẩm điện ảnh${countStr}`;
  }

  // 7. Sports Category
  if (cat.includes("the-thao")) {
    const hintsLower = (card.hints || []).join(" ").toLowerCase();
    if (/cầu thủ|vận động viên|tiền đạo|thủ môn|huấn luyện viên/i.test(hintsLower)) {
      return `Một vận động viên thể thao${countStr}`;
    }
    return `Một môn thể thao / giải đấu${countStr}`;
  }

  // 8. Science Category
  if (cat.includes("khoa-hoc")) {
    return `Một phát minh / khái niệm khoa học${countStr}`;
  }

  // 9. Math Category
  if (cat.includes("toan-hoc")) {
    return `Một khái niệm toán học${countStr}`;
  }

  return `Một kiến thức chủ đề ${formatCategoryName(card.category || "Tổng hợp")}${countStr}`;
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
 * Randomly select `count` unique cards from a category or all cards without duplicates.
 * If count is omitted, returns all available unique cards shuffled.
 */
export function pickRandomQuestions(
  cards: Card[],
  category?: string | null,
  count?: number
): Card[] {
  let filtered = cards;
  if (category && category !== "all") {
    filtered = cards.filter((c) => c.category === category);
  }

  if (filtered.length === 0) {
    throw new Error(
      category ? `Chủ đề ${category} không có câu hỏi nào.` : "Không có câu hỏi nào."
    );
  }

  const targetCount = count && count > 0 ? Math.min(count, filtered.length) : filtered.length;

  // Shuffle copy using Fisher-Yates
  const shuffled = [...filtered];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Extra safety: ensure unique IDs
  const uniqueIds = new Set<string>();
  const result: Card[] = [];
  for (const card of shuffled) {
    if (!uniqueIds.has(card.id)) {
      uniqueIds.add(card.id);
      result.push(card);
      if (result.length === targetCount) break;
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
