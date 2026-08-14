import React, { useEffect, useRef, useState, useCallback } from "react";
import type { MusicQuizQuestion, MusicQuizResult } from "../../types/musicQuiz";
import { MusicAudioPlayer } from "./MusicAudioPlayer";
import {
  playClickSound,
  playCorrectSound,
  playStreakSound,
  playTimeoutSound,
  playWrongSound,
} from "../../utils/audio";

interface MusicQuizPlayScreenProps {
  question: MusicQuizQuestion;
  questionIndex: number;
  totalQuestions: number;
  score: number;
  streak: number;
  soundEnabled: boolean;
  onAnswerQuestion: (result: MusicQuizResult) => void;
  onExitQuiz?: () => void;
}

const QUESTION_DURATION = 30; // 30 seconds per question
const TOTAL_MS = QUESTION_DURATION * 1000;

export const MusicQuizPlayScreen: React.FC<MusicQuizPlayScreenProps> = ({
  question,
  questionIndex,
  totalQuestions,
  score,
  streak,
  soundEnabled,
  onAnswerQuestion,
}) => {
  const [remainingMs, setRemainingMs] = useState<number>(TOTAL_MS);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);

  const lastTickRef = useRef<number>(Date.now());
  const soundEnabledRef = useRef(soundEnabled);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  const handleTimeOut = useCallback(() => {
    setIsAnswered((prev) => {
      if (prev) return prev;
      playTimeoutSound(soundEnabledRef.current);
      return true;
    });
    setIsPlaying(false);
  }, []);

  // Reset state on new question
  useEffect(() => {
    setRemainingMs(TOTAL_MS);
    setIsPlaying(true);
    setSelectedOption(null);
    setIsAnswered(false);
    lastTickRef.current = Date.now();
  }, [question]);

  // Smooth 60fps timer engine synchronized with isPlaying
  useEffect(() => {
    if (!isPlaying || isAnswered) return;

    lastTickRef.current = Date.now();

    const timerId = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;

      setRemainingMs((prev) => {
        const next = prev - delta;
        if (next <= 0) {
          clearInterval(timerId);
          handleTimeOut();
          return 0;
        }
        return next;
      });
    }, 25);

    return () => clearInterval(timerId);
  }, [isPlaying, isAnswered, handleTimeOut]);

  const handleTogglePlay = () => {
    if (isAnswered) return;
    setIsPlaying((prev) => !prev);
  };

  const handleOptionSelect = (option: string) => {
    if (isAnswered || remainingMs <= 0) return;

    setSelectedOption(option);
    setIsAnswered(true);
    setIsPlaying(false);

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
    playClickSound(soundEnabledRef.current);
    const isCorrect =
      selectedOption !== null &&
      selectedOption.trim().toLowerCase() ===
        question.correct_answer.trim().toLowerCase();

    const timeSpent = Math.min(
      QUESTION_DURATION,
      Math.max(1, Math.round((TOTAL_MS - remainingMs) / 1000)),
    );

    onAnswerQuestion({
      question,
      selectedAnswer: selectedOption,
      isCorrect,
      timeSpentSeconds: timeSpent,
    });
  };

  // Keyboard shortcut listener (1, 2, 3, 4)
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

  const timeLeft = Math.max(0, Math.ceil(remainingMs / 1000));
  const _isUrgent = timeLeft <= 8 && !isAnswered;
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
    <div className="music-play-screen-ref fade-in">
      {/* 1. Top Status & Progress Bar (Giống hình mẫu) */}
      <div className="quiz-top-status-row">
        <div className="status-pill-left">
          <span className="pill-icon">👤</span>
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
          <span className="pill-icon">⭐</span>
          <span>{score} pts</span>
          {streak >= 2 && <span className="streak-tag">🔥 {streak}x</span>}
        </div>
      </div>

      {/* 2. Main Question Card with Floating Timer Bubble (Giống hình mẫu) */}
      <div className="quiz-main-card">
        {/* Floating Circular Timer on Top Border */}
        {/* <div className={`floating-timer-bubble ${isUrgent ? "urgent" : ""}`}>
          <div className="timer-bubble-inner">
            <span className="timer-val">{timeLeft}</span>
          </div>
        </div> */}

        {/* Top Hint / Pack Badge */}
        <div className="card-top-header">
          <div className="card-hint-badge">
            <span className="hint-icon">💡</span>
            <span>{question.packTitle || "Quiz"}</span>
          </div>
        </div>

        {/* Question Title Header */}
        <h2 className="card-question-title">
          Question <span className="highlight-num">{formattedIndex}</span>
        </h2>

        {/* Inner Audio Player Box (Hộp phát nhạc ở giữa với nút play to tròn) */}
        <MusicAudioPlayer
          youtubeUrl={question.youtube_url}
          audioStart={question.audio_start}
          audioDuration={question.audio_duration || 30}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          isAnswered={isAnswered}
        />

        {/* Dotted Divider */}
        <div className="card-dotted-divider" />

        {/* Question Prompt Text */}
        <div className="card-prompt-text">{question.question}</div>
      </div>

      {/* 3. 4 Options Vertical List (Dạng thanh ngang bo cong với nút radio tròn bên phải) */}
      <div
        className="quiz-options-vertical-list"
        role="group"
        aria-label="Các lựa chọn đáp án"
      >
        {question.options.map((opt, idx) => {
          const isSelected = selectedOption === opt;
          const isCorrect =
            opt.trim().toLowerCase() ===
            question.correct_answer.trim().toLowerCase();

          let optClass = "quiz-option-row";
          if (isAnswered) {
            if (isCorrect) {
              optClass += " opt-correct";
            } else if (isSelected && !isCorrect) {
              optClass += " opt-wrong";
            } else {
              optClass += " opt-dimmed";
            }
          } else if (isSelected) {
            optClass += " opt-selected";
          }

          return (
            <button
              key={idx}
              type="button"
              className={optClass}
              onClick={() => handleOptionSelect(opt)}
              disabled={isAnswered}
              aria-pressed={isSelected}
            >
              <span className="option-row-text">{opt}</span>

              {/* Radio Indicator Circle on Right */}
              <div className="option-radio-circle">
                {isAnswered ? (
                  isCorrect ? (
                    <span className="radio-icon">✓</span>
                  ) : isSelected ? (
                    <span className="radio-icon">✗</span>
                  ) : (
                    <span className="radio-empty-dot" />
                  )
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

      {/* 4. Feedback Explanation (Hiển thị chi tiết khi đã trả lời) */}
      {isAnswered && (
        <div
          className={`quiz-feedback-mini ${
            isCorrectChoice ? "feedback-ok" : "feedback-err"
          } fade-in`}
        >
          <div className="fb-headline">
            {isCorrectChoice ? "🎉 Chính xác!" : "❌ Chưa đúng!"}{" "}
            <span className="fb-ans-text">
              Đáp án: <strong>{question.correct_answer}</strong>
            </span>
          </div>

          {(question.song ||
            question.artist ||
            question.movie ||
            question.release_year) && (
            <div className="fb-meta-line">
              {question.song && <span>🎵 {question.song}</span>}
              {question.artist && <span>🎤 {question.artist}</span>}
              {question.movie && <span>🎬 {question.movie}</span>}
              {question.release_year && <span>📅 {question.release_year}</span>}
            </div>
          )}
        </div>
      )}

      {/* 5. Bottom Next Button (Nút Next bo cong toàn chiều rộng như hình) */}
      <div className="quiz-bottom-action-bar">
        <button
          type="button"
          className="btn-quiz-next pulse-button"
          onClick={handleNextClick}
          disabled={!isAnswered && remainingMs > 0}
        >
          {questionIndex < totalQuestions - 1 ? "Next ➔" : "Xem Kết Quả 🏆"}
        </button>
      </div>
    </div>
  );
};
