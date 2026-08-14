// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  isTTSSupported,
  speakText,
  stopSpeech,
  splitTextIntoChunks,
} from "../utils/tts";

describe("Vietnamese Text-to-Speech (TTS) Utility Tests", () => {
  const originalAudio = window.Audio;

  let mockAudioPlay: ReturnType<typeof vi.fn>;
  let mockAudioPause: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockAudioPlay = vi.fn().mockResolvedValue(undefined);
    mockAudioPause = vi.fn();

    // Mock Audio constructor
    class MockAudio {
      src = "";
      currentTime = 0;
      onended: (() => void) | null = null;
      onerror: ((e: unknown) => void) | null = null;
      play = mockAudioPlay;
      pause = mockAudioPause;
      constructor(src?: string) {
        if (src) this.src = src;
      }
    }
    // @ts-expect-error Mocking Audio constructor
    window.Audio = MockAudio;
  });

  afterEach(() => {
    window.Audio = originalAudio;
    vi.clearAllMocks();
  });

  it("1. isTTSSupported trả về true khi môi trường hỗ trợ Audio", () => {
    expect(isTTSSupported()).toBe(true);
  });

  it("2. splitTextIntoChunks chia nhỏ câu dài chuẩn xác", () => {
    const shortText = "Việt Nam nằm ở khu vực nào?";
    const chunks = splitTextIntoChunks(shortText, 100);
    expect(chunks.length).toBe(1);
    expect(chunks[0]).toBe(shortText);

    const longText =
      "Việt Nam là một quốc gia nằm ở khu vực Đông Nam Á. Nước ta có bờ biển dài 3.260 km, trải dài từ Móng Cái đến Hà Tiên với cảnh quan thiên nhiên hùng vĩ.";
    const longChunks = splitTextIntoChunks(longText, 80);
    expect(longChunks.length).toBeGreaterThan(1);
  });

  it("3. speakText phát âm thanh luồng tiếng Việt tự nhiên", () => {
    const onStart = vi.fn();
    speakText("Việt Nam nằm ở đâu?", { onStart });
    expect(onStart).toHaveBeenCalled();
    expect(mockAudioPlay).toHaveBeenCalled();
  });

  it("4. stopSpeech dừng âm thanh ngay lập tức", () => {
    speakText("Câu hỏi thử nghiệm");
    stopSpeech();
    expect(mockAudioPause).toHaveBeenCalled();
  });
});
