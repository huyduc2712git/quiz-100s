import React, { useEffect, useState, useRef } from "react";
import type { ImageQuizQuestion, ImageQuizResult } from "../../types/imageQuiz";
import {
  getRevealedCornersCount,
  shuffleArray,
} from "../../utils/imageQuizUtils";
import {
  playClickSound,
  playCorrectSound,
  playStreakSound,
  playWrongSound,
} from "../../utils/audio";
import { speakText, stopSpeech } from "../../utils/tts";

interface ImageQuizPlayScreenProps {
  question: ImageQuizQuestion;
  questionIndex: number;
  totalQuestions: number;
  score: number;
  streak: number;
  soundEnabled: boolean;
  onAnswerQuestion: (result: ImageQuizResult) => void;
  onExitQuiz?: () => void;
}

export const ImageQuizPlayScreen: React.FC<ImageQuizPlayScreenProps> = ({
  question,
  questionIndex,
  totalQuestions,
  score,
  streak,
  soundEnabled,
  onAnswerQuestion,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [imgLoaded, setImgLoaded] = useState<boolean>(false);
  const [imgError, setImgError] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const startTimeRef = useRef<number>(Date.now());
  const soundEnabledRef = useRef(soundEnabled);
  const revealOrderRef = useRef<number[]>([0, 1, 2, 3]);
  const prevRevealedCountRef = useRef<number>(0);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
    if (!soundEnabled) {
      stopSpeech();
    }
  }, [soundEnabled]);

  useEffect(() => {
    if (isAnswered) {
      stopSpeech();
    }
  }, [isAnswered]);

  const playQuestionSpeech = (q: ImageQuizQuestion) => {
    stopSpeech();
    const speechText = q.question.trim();
    speakText(speechText, {
      lang: "vi-VN",
      rate: 0.95,
    });
  };

  // Reset state, stop previous speech and auto-read new question
  useEffect(() => {
    setSelectedOption(null);
    setIsAnswered(false);
    setImgLoaded(false);
    setImgError(false);
    setIsZoomed(false);
    setElapsedSeconds(0);
    revealOrderRef.current = shuffleArray([0, 1, 2, 3]);
    prevRevealedCountRef.current = 0;
    startTimeRef.current = Date.now();

    if (soundEnabledRef.current) {
      playQuestionSpeech(question);
    }

    return () => {
      stopSpeech();
    };
  }, [question]);

  // Timer tick every 1s
  useEffect(() => {
    if (isAnswered) return;

    const timerId = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [isAnswered, question]);

  const revealedCount = getRevealedCornersCount(elapsedSeconds, isAnswered);
  const revealedIndices = isAnswered
    ? [0, 1, 2, 3]
    : revealOrderRef.current.slice(0, revealedCount);

  // Play audio cue when a new corner unlocks
  useEffect(() => {
    if (
      revealedCount > prevRevealedCountRef.current &&
      !isAnswered &&
      prevRevealedCountRef.current >= 0
    ) {
      playClickSound(soundEnabledRef.current);
    }
    prevRevealedCountRef.current = revealedCount;
  }, [revealedCount, isAnswered]);

  const handleOptionSelect = (option: string) => {
    if (isAnswered) return;

    stopSpeech();

    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect =
      option.trim().toLowerCase() ===
      question.correct_answer.trim().toLowerCase();

    if (isCorrect) {
      playCorrectSound(soundEnabledRef.current);
      if (streak + 1 >= 2) {
        playStreakSound(streak + 1, soundEnabledRef.current);
      }
    } else {
      playWrongSound(soundEnabledRef.current);
    }
  };

  const handleNextClick = () => {
    stopSpeech();
    playClickSound(soundEnabledRef.current);
    const isCorrect =
      selectedOption !== null &&
      selectedOption.trim().toLowerCase() ===
        question.correct_answer.trim().toLowerCase();

    const timeSpent = Math.max(
      1,
      Math.round((Date.now() - startTimeRef.current) / 1000),
    );

    onAnswerQuestion({
      question,
      selectedAnswer: selectedOption,
      isCorrect,
      timeSpentSeconds: timeSpent,
    });
  };

  // Keyboard shortcut listener (1, 2, 3, 4, Enter/Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnswered) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleNextClick();
        }
        return;
      }

      const keyIndex = ["1", "2", "3", "4"].indexOf(e.key);
      if (keyIndex !== -1 && question.options[keyIndex]) {
        e.preventDefault();
        handleOptionSelect(question.options[keyIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const isCorrectChoice =
    selectedOption !== null &&
    selectedOption.trim().toLowerCase() ===
      question.correct_answer.trim().toLowerCase();

  const progressPercent = Math.max(
    0,
    Math.min(100, ((questionIndex + 1) / totalQuestions) * 100),
  );
  const formattedIndex = String(questionIndex + 1).padStart(2, "0");

  return (
    <div className="image-play-screen fade-in">
      {/* 1. Top Status & Progress Bar */}
      <div className="quiz-top-status-row">
        <div className="status-pill-left">
          <span className="pill-icon">📸</span>
          <span>
            {questionIndex + 1} of {totalQuestions}
          </span>
        </div>

        <div className="status-progress-track">
          <div
            className="status-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="status-pill-right">
          <span className="star-icon">⭐</span>
          <span>{score} pts</span>
          {streak >= 2 && <span className="streak-tag">🔥 {streak}x</span>}
        </div>
      </div>

      {/* 2. Main Question Card with Image */}
      <div className="image-main-card">
        {/* Top Tag Header */}
        <div className="card-top-header">
          <div className="card-hint-badge">
            <span className="hint-icon">🚩</span>
            <span>
              {question.country} • {question.category}
            </span>
          </div>
        </div>

        {/* Question Header */}
        <h2 className="card-question-title">
          Câu hỏi <span className="highlight-num">{formattedIndex}</span>
        </h2>

        {/* Interactive Image Frame */}
        <div
          className={`image-stage-container ${imgLoaded ? "loaded" : "loading"}`}
          onClick={() => setIsZoomed(true)}
          title="Nhấn để phóng to ảnh"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") setIsZoomed(true);
          }}
        >
          {!imgLoaded && !imgError && (
            <div className="image-loading-skeleton">
              <span className="loading-spinner-ring" />
              <span className="loading-text">
                Đang tải hình ảnh địa danh...
              </span>
            </div>
          )}

          {imgError ? (
            <div className="image-error-fallback">
              <span className="error-icon">🏛️</span>
              <span>Hình ảnh địa danh: {question.landmark_name}</span>
            </div>
          ) : (
            <img
              src={question.image_url}
              alt={question.landmark_name}
              className="landmark-photo"
              loading="eager"
              decoding="async"
              onLoad={() => {
                setImgLoaded(true);
                setImgError(false);
              }}
              onError={() => {
                setImgLoaded(true);
                setImgError(true);
              }}
            />
          )}

          {/* 4 Quadrants Reveal Overlay */}
          {!imgError && (
            <div className="image-quadrants-overlay" aria-hidden="true">
              {[0, 1, 2, 3].map((quadrantIndex) => {
                const isRevealed =
                  isAnswered || revealedIndices.includes(quadrantIndex);
                const quadrantPositions = [
                  "top-left",
                  "top-right",
                  "bottom-left",
                  "bottom-right",
                ];
                const cornerBadges = [
                  "↖ Góc 1",
                  "↗ Góc 2",
                  "↙ Góc 3",
                  "↘ Góc 4",
                ];

                return (
                  <div
                    key={quadrantIndex}
                    className={`quadrant-tile quadrant-${quadrantPositions[quadrantIndex]} ${
                      isRevealed ? "is-revealed" : "is-covered"
                    }`}
                  >
                    <div className="quadrant-tile-inner">
                      <div className="quadrant-lock-badge">
                        <span className="quadrant-lock-icon">🔒</span>
                        <span className="quadrant-lock-text">
                          {cornerBadges[quadrantIndex]}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="image-zoom-badge">
            <span>🔍 Nhấn phóng to</span>
          </div>
        </div>

        {/* 10s Corner Reveal Status Bar */}
        <div className="image-reveal-bar">
          <div className="reveal-counter-tag">
            <span className="reveal-tag-icon">🧩</span>
            <span>
              {isAnswered
                ? "Đã mở toàn bộ 4/4 góc"
                : `Đã mở ${revealedCount}/4 góc ảnh`}
            </span>
          </div>
          {!isAnswered && revealedCount < 4 && (
            <div className="reveal-timer-countdown">
              <span className="timer-icon-spin">⏳</span>
              <span>
                Mở góc tiếp theo: <strong>{10 - (elapsedSeconds % 10)}s</strong>
              </span>
            </div>
          )}
        </div>

        {/* Prompt Text with Text-to-Speech */}
        <div className="card-prompt-wrapper">
          <div className="card-prompt-text">
            <span className="prompt-prefix">❓</span>
            {question.question}
          </div>
        </div>
      </div>

      {/* 3. 4 Options Vertical List */}
      <div className="quiz-options-vertical-list">
        {question.options.map((opt, idx) => {
          const isSelected = selectedOption === opt;
          const isCorrect =
            opt.trim().toLowerCase() ===
            question.correct_answer.trim().toLowerCase();

          let stateClass = "";
          if (isAnswered) {
            if (isCorrect) {
              stateClass = "opt-correct";
            } else if (isSelected) {
              stateClass = "opt-wrong";
            } else {
              stateClass = "opt-dimmed";
            }
          } else if (isSelected) {
            stateClass = "opt-selected";
          }

          return (
            <button
              key={idx}
              type="button"
              className={`quiz-option-row ${stateClass}`}
              onClick={() => handleOptionSelect(opt)}
              disabled={isAnswered}
            >
              <div className="option-row-left">
                <span className="option-key-label">{idx + 1}</span>
                <span className="option-row-text">{opt}</span>
              </div>
              <div className="option-radio-circle">
                {isAnswered && isCorrect ? (
                  <span>✓</span>
                ) : isAnswered && isSelected ? (
                  <span>✗</span>
                ) : isSelected ? (
                  <span className="radio-selected-dot" />
                ) : (
                  <span className="radio-empty-dot" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 4. Feedback Explanation & Fun Fact Card */}
      {isAnswered && (
        <div
          className={`image-feedback-card ${isCorrectChoice ? "feedback-ok" : "feedback-err"}`}
        >
          <div className="fb-headline">
            {isCorrectChoice ? "🎉 Chính xác!" : "❌ Chưa chính xác!"}
            <span className="fb-ans-text">
              Địa danh: <strong>{question.correct_answer}</strong>
            </span>
          </div>
          {question.location_detail && (
            <div className="fb-location-tag">
              📍 Vị trí: {question.location_detail}
            </div>
          )}
          <div className="fb-fun-fact">
            💡 <em>{question.fun_fact}</em>
          </div>
        </div>
      )}

      {/* 5. Bottom Next Action Bar */}
      <div className="quiz-bottom-action-bar">
        <button
          type="button"
          className="btn-quiz-next"
          onClick={handleNextClick}
          disabled={!isAnswered}
        >
          {questionIndex === totalQuestions - 1
            ? "🏆 XEM KẾT QUẢ VÁN CHƠI"
            : "TIẾP THEO ➔"}
        </button>
      </div>

      {/* 6. Lightbox Zoom Modal */}
      {isZoomed && (
        <div
          className="image-lightbox-overlay fade-in"
          onClick={() => setIsZoomed(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="lightbox-close-btn"
              onClick={() => setIsZoomed(false)}
              aria-label="Đóng"
            >
              ✕ Đóng
            </button>
            <div className="lightbox-image-wrapper">
              <img
                src={question.image_url}
                alt={question.landmark_name}
                className="lightbox-full-image"
              />
              {!isAnswered && !imgError && (
                <div className="image-quadrants-overlay" aria-hidden="true">
                  {[0, 1, 2, 3].map((quadrantIndex) => {
                    const isRevealed =
                      isAnswered || revealedIndices.includes(quadrantIndex);
                    const quadrantPositions = [
                      "top-left",
                      "top-right",
                      "bottom-left",
                      "bottom-right",
                    ];
                    return (
                      <div
                        key={quadrantIndex}
                        className={`quadrant-tile quadrant-${quadrantPositions[quadrantIndex]} ${
                          isRevealed ? "is-revealed" : "is-covered"
                        }`}
                      >
                        <div className="quadrant-tile-inner">
                          <div className="quadrant-lock-badge">
                            <span className="quadrant-lock-icon">🔒</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="lightbox-caption">
              <h3>
                {isAnswered ? question.landmark_name : "Ảnh phóng to địa danh"}
              </h3>
              <p>
                {isAnswered
                  ? question.country
                  : `Đang mở ${revealedCount}/4 góc • Mở thêm sau ${10 - (elapsedSeconds % 10)}s`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
