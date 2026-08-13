// @vitest-environment jsdom

import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GamePlayScreen } from "../components/GamePlayScreen";
import { HomeScreen } from "../components/HomeScreen";
import { RandomizerScreen } from "../components/RandomizerScreen";
import { TimeoutScreen } from "../components/TimeoutScreen";
import type { Card } from "../types/game";
import {
  playClickSound,
  playHintSound,
  playTimeoutSound,
} from "../utils/audio";
import { fetchWikiSummary } from "../utils/wiki";

vi.mock("../utils/audio", () => ({
  playClickSound: vi.fn(),
  playCorrectSound: vi.fn(),
  playHintSound: vi.fn(),
  playTimeoutSound: vi.fn(),
}));

vi.mock("../utils/wiki", () => ({
  fetchWikiSummary: vi.fn(),
}));

const card: Card = {
  id: "test-card",
  category: "the-thao",
  answer: "Bóng đá",
  hints: ["Gợi ý 1", "Gợi ý 2", "Gợi ý 3", "Gợi ý 4", "Gợi ý 5"],
  difficulty: "easy",
  source_url: "https://vi.wikipedia.org/wiki/Bóng_đá",
};

describe("UI regressions", () => {
  beforeEach(() => {
    vi.mocked(fetchWikiSummary).mockResolvedValue({
      title: card.answer,
      extract: "Tóm tắt kiểm thử",
      pageUrl: card.source_url,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("does not reset the active timer when sound is toggled", () => {
    vi.useFakeTimers();
    const onTimeout = vi.fn();
    const onCorrectAnswer = vi.fn();
    const props = {
      card,
      questionIndex: 0,
      totalQuestions: 5,
      score: 0,
      onCorrectAnswer,
      onTimeout,
    };

    const { container, rerender } = render(
      <GamePlayScreen {...props} soundEnabled />,
    );

    act(() => {
      vi.advanceTimersByTime(1_100);
    });

    expect(container.querySelector(".timer-number")?.textContent).toBe("99");

    rerender(<GamePlayScreen {...props} soundEnabled={false} />);

    expect(container.querySelector(".timer-number")?.textContent).toBe("99");
    expect(playHintSound).not.toHaveBeenCalled();
  });

  it("does not restart the category animation when sound is toggled", () => {
    vi.useFakeTimers();
    const categories = ["the-thao", "am-nhac-viet-nam"];
    const onConfirmStart = vi.fn();

    const { rerender } = render(
      <RandomizerScreen
        categories={categories}
        chosenCategory="the-thao"
        soundEnabled
        onConfirmStart={onConfirmStart}
      />,
    );

    act(() => {
      vi.advanceTimersByTime(1_600);
    });

    expect(screen.getByRole("button", { name: /bắt đầu chơi/i })).toBeTruthy();

    rerender(
      <RandomizerScreen
        categories={categories}
        chosenCategory="the-thao"
        soundEnabled={false}
        onConfirmStart={onConfirmStart}
      />,
    );

    expect(screen.getByRole("button", { name: /bắt đầu chơi/i })).toBeTruthy();
    expect(playClickSound).toHaveBeenCalledTimes(15);
  });

  it("does not replay timeout audio or refetch Wikipedia on sound toggle", async () => {
    const onNextQuestion = vi.fn();
    const props = {
      card,
      questionIndex: 0,
      totalQuestions: 5,
      onNextQuestion,
    };

    const { rerender } = render(<TimeoutScreen {...props} soundEnabled />);

    await waitFor(() => {
      expect(screen.getByText("Tóm tắt kiểm thử")).toBeTruthy();
    });

    rerender(<TimeoutScreen {...props} soundEnabled={false} />);

    expect(playTimeoutSound).toHaveBeenCalledTimes(1);
    expect(fetchWikiSummary).toHaveBeenCalledTimes(1);
  });

  it("exposes the selected category to assistive technology", () => {
    render(
      <HomeScreen
        categories={["the-thao"]}
        totalCards={10}
        selectedCategory={null}
        onSelectCategory={vi.fn()}
        onStartGame={vi.fn()}
      />,
    );

    expect(screen.getByRole("group", { name: /chủ đề bài chơi/i })).toBeTruthy();
    expect(
      screen.getByRole("button", {
        name: /ngẫu nhiên tất cả/i,
        pressed: true,
      }),
    ).toBeTruthy();
  });
});
