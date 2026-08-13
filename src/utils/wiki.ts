import type { WikiExtract } from "../types/game";

const wikiCache = new Map<string, WikiExtract>();

/**
 * Fetch Wikipedia summary for a given answer keyword using Vietnamese MediaWiki API.
 * Uses in-memory Map cache + fallback handling.
 */
export async function fetchWikiSummary(
  answer: string,
  fallbackSourceUrl: string,
  customFetch?: typeof fetch
): Promise<WikiExtract> {
  const normalizedKey = answer.trim().toLowerCase();

  // Check cache first
  if (wikiCache.has(normalizedKey)) {
    return wikiCache.get(normalizedKey)!;
  }

  const fetchFn = customFetch || fetch;
  const endpoint = `https://vi.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrsearch=${encodeURIComponent(
    answer
  )}&gsrlimit=1&prop=extracts&exintro=1&explaintext=1&exsentences=3`;

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
        const extract = page.extract ? page.extract.trim() : "";

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
      pageUrl: fallbackSourceUrl || `https://vi.wikipedia.org/w/index.php?search=${encodeURIComponent(answer)}`,
    };
    wikiCache.set(normalizedKey, fallbackResult);
    return fallbackResult;
  } catch (err) {
    console.warn("Error fetching Wikipedia extract:", err);
    const fallbackResult: WikiExtract = {
      title: answer,
      extract: "Không thể kết nối tới Wikipedia. Vui lòng kiểm tra kết nối mạng.",
      pageUrl: fallbackSourceUrl || `https://vi.wikipedia.org/w/index.php?search=${encodeURIComponent(answer)}`,
    };
    return fallbackResult;
  }
}
