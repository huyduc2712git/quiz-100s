import React, { useEffect, useRef, useState } from "react";
import type { Card, WikiExtract } from "../types/game";
import { formatCategoryName, generateOpeningClue } from "../utils/gameUtils";

import { playCorrectSound, playTimeoutSound } from "../utils/audio";
import { fetchWikiSummary } from "../utils/wiki";

interface GamePlayScreenProps {
  card: Card;
  questionIndex: number;
  totalQuestions: number;
  score: number;
  soundEnabled: boolean;
  onCorrectAnswer: (timeSpentSeconds: number) => void;
  onTimeout: () => void;
}

/**
 * Highlight answer keywords inside the Wikipedia text so Player 1 does not accidentally speak them out.
 */
function renderHighlightedWikiText(
  text: string,
  answer: string,
): React.ReactNode {
  if (!text || !answer) return text;

  const trimmed = answer.trim();
  const prefixes = [
    "Chiến thắng",
    "Chiến dịch",
    "Trận",
    "Khởi nghĩa",
    "Cách mạng",
    "Phong trào",
    "Hiệp định",
    "Hiệp ước",
    "Bài hát",
    "Ca khúc",
    "Bộ phim",
    "Hình",
  ];

  const searchTerms = [trimmed];
  for (const p of prefixes) {
    if (trimmed.toLowerCase().startsWith(p.toLowerCase())) {
      const remainder = trimmed
        .slice(p.length)
        .trim()
        .replace(/^[-–—]\s*/, "");
      if (remainder.length >= 2) {
        searchTerms.push(remainder);
      }
    }
  }

  // Also include "lăng trụ" for "hình lăng trụ" etc.
  if (trimmed.toLowerCase().startsWith("hình ")) {
    searchTerms.push(trimmed.slice(5).trim());
  }

  const escapedTerms = Array.from(new Set(searchTerms))
    .filter(Boolean)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .sort((a, b) => b.length - a.length);

  if (escapedTerms.length === 0) return text;

  const regex = new RegExp(`(${escapedTerms.join("|")})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, idx) => {
    const isMatch = searchTerms.some(
      (term) => term.toLowerCase() === part.toLowerCase(),
    );
    if (isMatch) {
      return (
        <mark
          key={idx}
          className="wiki-answer-keyword"
          title="⚠️ ĐÁP ÁN: Đừng đọc lộ từ này!"
        >
          {part}
        </mark>
      );
    }
    return part;
  });
}

export const GamePlayScreen: React.FC<GamePlayScreenProps> = ({
  card,
  questionIndex,
  totalQuestions,
  score,
  soundEnabled,
  onCorrectAnswer,
  onTimeout,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(100);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [wikiData, setWikiData] = useState<WikiExtract | null>(null);
  const [isLoadingWiki, setIsLoadingWiki] = useState<boolean>(true);

  const endTimeRef = useRef<number>(0);
  const timerIdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const soundEnabledRef = useRef(soundEnabled);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // Fetch Wikipedia summary for real-time dialogue
  useEffect(() => {
    let isMounted = true;
    setIsLoadingWiki(true);
    setWikiData(null);

    fetchWikiSummary(card.answer, card.source_url)
      .then((data) => {
        if (isMounted) {
          setWikiData(data);
          setIsLoadingWiki(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setWikiData({
            title: card.answer,
            extract:
              "Không tìm thấy dữ liệu tóm tắt từ Wikipedia cho đáp án này.",
            pageUrl:
              card.source_url ||
              `https://vi.wikipedia.org/w/index.php?search=${encodeURIComponent(card.answer)}`,
          });
          setIsLoadingWiki(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [card]);

  // Reset timer on card change
  useEffect(() => {
    setIsLocked(false);
    setTimeLeft(100);

    const durationMs = 100000; // 100 seconds
    endTimeRef.current = Date.now() + durationMs;

    if (timerIdRef.current) {
      clearInterval(timerIdRef.current);
    }

    timerIdRef.current = setInterval(() => {
      const remainingMs = endTimeRef.current - Date.now();
      const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));

      setTimeLeft(remainingSec);

      // Timeout condition
      if (remainingSec <= 0) {
        if (timerIdRef.current) {
          clearInterval(timerIdRef.current);
          timerIdRef.current = null;
        }
        setIsLocked(true);
        playTimeoutSound(soundEnabledRef.current);
        onTimeout();
      }
    }, 100);

    return () => {
      if (timerIdRef.current) {
        clearInterval(timerIdRef.current);
        timerIdRef.current = null;
      }
    };
  }, [card, onTimeout]);

  const handleCorrectClick = () => {
    const remainingMs = endTimeRef.current - Date.now();
    const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));

    if (isLocked || remainingSec <= 0 || timeLeft <= 0) {
      return;
    }

    setIsLocked(true);

    if (timerIdRef.current) {
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }

    const timeSpent = Math.min(100, Math.max(1, 100 - remainingSec));
    playCorrectSound(soundEnabled);
    onCorrectAnswer(timeSpent);
  };

  const handleSkipClick = () => {
    if (isLocked || timeLeft <= 0) return;
    setIsLocked(true);
    if (timerIdRef.current) {
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }
    playTimeoutSound(soundEnabledRef.current);
    onTimeout();
  };

  const openingClue = generateOpeningClue(card);
  const isUrgent = timeLeft <= 20;

  return (
    <div className="gameplay-screen hint-gameplay-compact fade-in">
      <p className="sr-only" role="status" aria-live="polite">
        Câu {questionIndex + 1} trên {totalQuestions}. Chủ đề{" "}
        {formatCategoryName(card.category)}.
      </p>

      {/* Top Compact Status Row */}
      <div className="status-bar compact-status-bar">
        <div className="status-badge category-badge">
          {formatCategoryName(card.category)}
        </div>
        <div className="status-badge progress-badge">
          Câu {questionIndex + 1}/{totalQuestions}
        </div>
        <div className="status-badge score-badge">
          Điểm: <strong>{score}</strong>
        </div>
      </div>

      {/* Compact Answer & Opening Clue Card */}
      <div className="compact-answer-timer-card">
        <div className="answer-left-info">
          {/* Spoken Opening Prompt for Player 1 */}

          <div className="opening-clue-quote">{openingClue}:</div>

          {/* Answer Display */}
          <div className="answer-main-display">
            <h2 className="compact-answer-title">{card.answer}</h2>
          </div>
        </div>

        {/* Compact Glowing Timer Badge */}
        <div
          className={`compact-timer-bubble ${isUrgent ? "urgent-pulse" : ""}`}
        >
          <span className="timer-number">{timeLeft}</span>
          <span className="timer-unit">GIÂY</span>
        </div>
      </div>

      {/* Primary Full Wikipedia Dialogue Knowledge Area (Chiếm diện tích chính để đối thoại) */}
      <div className="wiki-dialogue-card wiki-dialogue-main-card">
        <div className="wiki-dialogue-header">
          <div className="wiki-title-left">
            <span className="wiki-badge-icon">📖</span>
            <span className="wiki-badge-title">
              DỮ KIỆN WIKIPEDIA ĐỐI THOẠI
            </span>
            <span className="wiki-answer-warning-badge">
              ⚠️ Chữ tô hồng = Đáp án
            </span>
          </div>
          <a
            href={wikiData?.pageUrl || card.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="wiki-external-btn"
            title="Mở bài viết đầy đủ trên Wikipedia"
          >
            🔗 Wikipedia ↗
          </a>
        </div>

        <div className="wiki-dialogue-body wiki-dialogue-scrollable">
          {isLoadingWiki ? (
            <div className="wiki-dialogue-loading">
              <span className="wiki-spinner" />
              <span>Đang tải tóm tắt toàn diện từ Wikipedia...</span>
            </div>
          ) : (
            <div className="wiki-content-paragraphs">
              {(wikiData?.extract || "Không có đoạn tóm tắt.")
                .split("\n\n")
                .filter(Boolean)
                .map((para, i) => (
                  <p key={i} className="wiki-para-text">
                    {renderHighlightedWikiText(para, card.answer)}
                  </p>
                ))}

              {/* Quick Clue Bullets from Card dataset */}
              {card.hints && card.hints.length > 0 && (
                <div className="wiki-clues-sublist">
                  <div className="wiki-clues-subtitle">
                    💡 DỮ KIỆN MẤU CHỐT BỔ SUNG:
                  </div>
                  {card.hints.map((hint, idx) => (
                    <div key={idx} className="wiki-clue-pill">
                      <span className="wiki-clue-dot">•</span>
                      <span>
                        {renderHighlightedWikiText(hint, card.answer)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* In-Flow Bottom Action Controls (Bỏ qua / Đúng) */}
      <div className="hint-action-bar">
        <button
          type="button"
          className="btn btn-skip"
          onClick={handleSkipClick}
          disabled={isLocked || timeLeft <= 0}
          aria-label="Bỏ qua câu hỏi này"
        >
          Bỏ qua
        </button>
        <button
          type="button"
          className="btn btn-correct"
          onClick={handleCorrectClick}
          disabled={isLocked || timeLeft <= 0}
          aria-label="Người chơi đoán đúng"
        >
          ✓ ĐÚNG
        </button>
      </div>
    </div>
  );
};
