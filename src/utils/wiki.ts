import type { WikiExtract } from "../types/game";

const wikiCache = new Map<string, WikiExtract>();

/**
 * Clean Wikipedia raw text extract:
 * Removes bracket citations [1], Hanzi characters (chữ Hán: ...), language parentheticals,
 * section markdown == Headers ==, and normalizes whitespaces.
 */
function cleanWikiText(raw: string): string {
  return raw
    .replace(/\[\d+\]/g, "")
    .replace(/\{\\displaystyle[^}]*\}/gi, "")
    .replace(/\{\\textstyle[^}]*\}/gi, "")
    .replace(/\(chữ Hán:[^)]*\)/gi, "")
    .replace(/\(tiếng [^:]+:[^)]*\)/gi, "")
    .replace(/==+[^=]+==+/g, "")
    .replace(/ISBN\s+[\d-–]+/gi, "")
    .replace(/\uFFFD/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s{2,}/g, " ")
    .trim();
}


/**
 * Fetch rich Wikipedia summary for a given answer keyword using Vietnamese MediaWiki API.
 * Uses in-memory Map cache + fallback handling.
 */
export async function fetchWikiSummary(
  answer: string,
  fallbackSourceUrl: string,
  customFetch?: typeof fetch
): Promise<WikiExtract> {
  const normalizedKey = (answer || "").trim().toLowerCase();

  if (!normalizedKey) {
    return {
      title: "",
      extract: "Không có thông tin.",
      pageUrl: fallbackSourceUrl || "",
    };
  }

  // Check cache first
  if (wikiCache.has(normalizedKey)) {
    return wikiCache.get(normalizedKey)!;
  }

  const fetchFn = customFetch || fetch;

  // Extract exact title from source URL if available (e.g., https://vi.wikipedia.org/wiki/Âu_Lạc)
  let titleFromUrl = "";
  if (fallbackSourceUrl && fallbackSourceUrl.includes("wikipedia.org/wiki/")) {
    try {
      const urlParts = fallbackSourceUrl.split("/wiki/");
      if (urlParts.length > 1) {
        titleFromUrl = decodeURIComponent(urlParts[1].split("#")[0].replace(/_/g, " "));
      }
    } catch {
      // ignore decoding error
    }
  }

  const searchTarget = titleFromUrl || answer;
  // Use exchars=1200 without exintro=1 to guarantee full biographical and historical depth
  const endpoint = `https://vi.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrsearch=${encodeURIComponent(
    searchTarget
  )}&gsrlimit=1&prop=extracts&explaintext=1&exchars=1200`;

  try {
    const res = await fetchFn(endpoint);
    if (!res.ok) {
      throw new Error(`Wikipedia API error ${res.status}`);
    }
    const data = await res.json();
    const pages = data?.query?.pages;

    if (pages) {
      const pageKeys = Object.keys(pages);
      if (pageKeys.length > 0) {
        const page = pages[pageKeys[0]];
        const title = page.title || answer;
        const rawExtract = page.extract ? String(page.extract).trim() : "";
        const extract = cleanWikiText(rawExtract);

        if (extract) {
          const wikiUrl = `https://vi.wikipedia.org/wiki/${encodeURIComponent(
            title.replace(/ /g, "_")
          )}`;

          const result: WikiExtract = {
            title,
            extract,
            pageUrl: wikiUrl,
          };
          wikiCache.set(normalizedKey, result);
          return result;
        }
      }
    }

    // Fallback if no page or no extract found
    const fallbackResult: WikiExtract = {
      title: answer,
      extract: "Không tìm thấy đoạn tóm tắt chi tiết trên Wikipedia cho đáp án này.",
      pageUrl:
        fallbackSourceUrl ||
        `https://vi.wikipedia.org/w/index.php?search=${encodeURIComponent(answer)}`,
    };
    wikiCache.set(normalizedKey, fallbackResult);
    return fallbackResult;
  } catch (err) {
    console.warn("Error fetching Wikipedia extract:", err);
    const fallbackResult: WikiExtract = {
      title: answer,
      extract:
        "Không thể kết nối tới Wikipedia. Người cầm máy hãy dùng dữ kiện gợi ý bên dưới để đối thoại.",
      pageUrl:
        fallbackSourceUrl ||
        `https://vi.wikipedia.org/w/index.php?search=${encodeURIComponent(answer)}`,
    };
    return fallbackResult;
  }
}
