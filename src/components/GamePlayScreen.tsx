import React, { useEffect, useRef, useState } from "react";
import type { Card } from "../types/game";
import { formatCategoryName, getRevealedHintsCount } from "../utils/gameUtils";
import { playHintSound, playCorrectSound } from "../utils/audio";
import { fetchWikiSummary } from "../utils/wiki";

interface GamePlayScreenProps {
  card: Card;
  questionIndex: number; // 0..4
  totalQuestions: number; // 5
  score: number;
  soundEnabled: boolean;
  onCorrectAnswer: (timeSpentSeconds: number) => void;
  onTimeout: () => void;
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
  const prevHintCountRef = useRef<number>(1);
  const endTimeRef = useRef<number>(0);
  const timerIdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const soundEnabledRef = useRef(soundEnabled);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // Background fetch wikipedia extract for timeout screen
  useEffect(() => {
    if (card && card.answer) {
      fetchWikiSummary(card.answer, card.source_url).catch(() => {});
    }
  }, [card]);

  // Reset timer on card change
  useEffect(() => {
    setIsLocked(false);
    setTimeLeft(100);
    prevHintCountRef.current = 1;

    // Accurate timestamp end time calculation
    const durationMs = 100000; // 100 seconds
    endTimeRef.current = Date.now() + durationMs;

    if (timerIdRef.current) {
      clearInterval(timerIdRef.current);
    }

    timerIdRef.current = setInterval(() => {
      const remainingMs = endTimeRef.current - Date.now();
      const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));

      setTimeLeft(remainingSec);

      // Check hint reveal count change
      const newCount = getRevealedHintsCount(remainingSec);
      if (newCount > prevHintCountRef.current) {
        prevHintCountRef.current = newCount;
        playHintSound(soundEnabledRef.current);
      }

      // Timeout condition
      if (remainingSec <= 0) {
        if (timerIdRef.current) {
          clearInterval(timerIdRef.current);
          timerIdRef.current = null;
        }
        setIsLocked(true);
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
    // Priority rule: if timer already hit 0, ignore click
    const remainingMs = endTimeRef.current - Date.now();
    const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));

    if (isLocked || remainingSec <= 0 || timeLeft <= 0) {
      return;
    }

    // Lock button immediately to avoid double tap
    setIsLocked(true);

    if (timerIdRef.current) {
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }

    const timeSpent = Math.min(100, Math.max(1, 100 - remainingSec));
    playCorrectSound(soundEnabled);
    onCorrectAnswer(timeSpent);
  };

  const revealedCount = getRevealedHintsCount(timeLeft);
  const isUrgent = timeLeft <= 20;

  return (
    <div className="gameplay-screen fade-in">
      <p className="sr-only" role="status" aria-live="polite">
        Câu {questionIndex + 1} trên {totalQuestions}. Chủ đề {formatCategoryName(card.category)}.
      </p>
      {/* Top Status Bar */}
      <div className="status-bar">
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

      {/* Timer Section */}
      <div className={`timer-box ${isUrgent ? "urgent" : ""}`}>
        <div className="timer-circle">
          <span className="timer-number">{timeLeft}</span>
          <span className="timer-label">GIÂY</span>
        </div>
        {isUrgent && (
          <div className="urgent-warning" role="status">
            ⏱️ CÒN DƯỚI 20 GIÂY!
          </div>
        )}
      </div>

      {/* Answer Box for Player 1 */}
      <div className="answer-card">
        <div className="answer-label">ĐÁP ÁN (Dành cho người cầm máy):</div>
        <div className="answer-text">{card.answer}</div>
      </div>

      {/* Hints List (Revealed & Locked) */}
      <div className="hints-section">
        <div className="hints-header">
          <span>DANH SÁCH GỢI Ý</span>
          <span className="hints-count">
            Đã mở: {revealedCount}/{card.hints?.length || 5}
          </span>
        </div>
        <div className="hints-list" aria-live="polite" aria-relevant="additions">
          {(card.hints || []).map((hint, idx) => {
            const isRevealed = idx < revealedCount;
            const isLatest = idx === revealedCount - 1 && revealedCount > 1;
            const unlockAt = 100 - idx * 20;

            if (isRevealed) {
              return (
                <div
                  key={idx}
                  className={`hint-item hint-revealed ${isLatest ? "hint-latest" : ""}`}
                >
                  <span className="hint-num">{idx + 1}</span>
                  <div className="hint-body">
                    <span className="hint-content">{hint}</span>
                  </div>
                </div>
              );
            }

            return (
              <div key={idx} className="hint-item hint-locked">
                <span className="hint-num hint-num--locked">🔒</span>
                <div className="hint-body">
                  <span className="hint-locked-text">Gợi ý {idx + 1}</span>
                  <span className="hint-lock-badge">Mở ở mốc {unlockAt}s</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fixed Large Correct Button */}
      <div className="fixed-bottom-bar">
        <button
          type="button"
          className="btn btn-correct"
          onClick={handleCorrectClick}
          disabled={isLocked || timeLeft <= 0}
          aria-label="Đoán Đúng"
        >
          ✓ ĐÚNG!
        </button>
      </div>
    </div>
  );
};
