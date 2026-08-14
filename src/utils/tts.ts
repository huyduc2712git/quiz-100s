/**
 * Vietnamese Text-to-Speech (TTS) Engine
 * Uses High-Quality Natural Vietnamese Audio Stream exclusively.
 */

export interface TTSOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: unknown) => void;
}

export function isTTSSupported(): boolean {
  return typeof window !== "undefined" && typeof Audio !== "undefined";
}

let activeAudio: HTMLAudioElement | null = null;
let isSpeakingState = false;
let stopRequested = false;

/**
 * Split long text into natural sentence chunks (<= 160 chars) for smooth audio streaming
 */
export function splitTextIntoChunks(text: string, maxLen = 160): string[] {
  const clean = text.trim();
  if (clean.length <= maxLen) return [clean];

  const rawParts = clean.split(/([.,?!;:]+\s*)/);
  const chunks: string[] = [];
  let current = "";

  for (let i = 0; i < rawParts.length; i++) {
    const part = rawParts[i];
    if ((current + part).length > maxLen && current.trim().length > 0) {
      chunks.push(current.trim());
      current = part;
    } else {
      current += part;
    }
  }
  if (current.trim().length > 0) {
    chunks.push(current.trim());
  }

  return chunks.length > 0 ? chunks : [clean];
}

/**
 * Stop any current audio or speech
 */
export function stopSpeech(): void {
  stopRequested = true;
  isSpeakingState = false;

  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      activeAudio.removeAttribute("src");
      activeAudio.load();
    } catch {
      // ignore
    }
    activeAudio = null;
  }

  // Ensure system speech synthesis is never running
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

/**
 * Check if speaking
 */
export function isSpeaking(): boolean {
  return isSpeakingState;
}

/**
 * Speak text with natural Vietnamese voice stream
 */
export function speakText(
  text: string,
  options: TTSOptions = {}
): void {
  if (!text || text.trim().length === 0) return;

  stopSpeech();
  stopRequested = false;
  isSpeakingState = true;

  const chunks = splitTextIntoChunks(text, 160);
  let currentChunkIndex = 0;

  options.onStart?.();

  const playChunk = (index: number) => {
    if (stopRequested || index >= chunks.length) {
      isSpeakingState = false;
      options.onEnd?.();
      return;
    }

    const chunk = chunks[index];
    const encoded = encodeURIComponent(chunk);
    const audioUrl = `/api/tts?q=${encoded}`;

    try {
      const audio = new Audio(audioUrl);
      activeAudio = audio;

      audio.onended = () => {
        if (stopRequested) return;
        currentChunkIndex++;
        playChunk(currentChunkIndex);
      };

      audio.onerror = (e) => {
        if (stopRequested) return;
        isSpeakingState = false;
        activeAudio = null;
        options.onError?.(e);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (stopRequested) {
              try {
                audio.pause();
                audio.currentTime = 0;
                audio.removeAttribute("src");
                audio.load();
              } catch {
                // ignore
              }
              activeAudio = null;
              isSpeakingState = false;
            }
          })
          .catch((err) => {
            if (stopRequested) return;
            isSpeakingState = false;
            activeAudio = null;
            options.onError?.(err);
          });
      }
    } catch (err) {
      isSpeakingState = false;
      activeAudio = null;
      options.onError?.(err);
    }
  };

  playChunk(currentChunkIndex);
}
