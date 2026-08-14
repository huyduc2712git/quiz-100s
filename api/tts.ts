import type { IncomingMessage, ServerResponse } from "http";
import https from "https";

export default function handler(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url || "", `http://${req.headers.host}`);
  const text = url.searchParams.get("q") || "";

  if (!text) {
    res.statusCode = 400;
    res.end("Missing text parameter");
    return;
  }

  const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=vi&client=tw-ob`;

  const proxyReq = https.get(
    ttsUrl,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://translate.google.com/",
      },
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 200, {
        "Content-Type": "audio/mpeg",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=86400",
      });
      proxyRes.pipe(res);
    }
  );

  proxyReq.on("error", (err) => {
    console.error("Vercel TTS Proxy Error:", err);
    res.statusCode = 500;
    res.end("TTS Proxy Error");
  });
}
