import React from "react";
import type { AppMode } from "../types/musicQuiz";

interface HeaderProps {
  mode: AppMode;
  onSwitchMode: (mode: AppMode) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onGoHome?: () => void;
  isMatchActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onSwitchMode,
  soundEnabled,
  onToggleSound,
  onGoHome,
  isMatchActive = false,
}) => {
  return (
    <header className="game-header">
      <div className="header-brand">
        <span
          className={`logo-badge ${mode === "musicQuiz" ? "logo-badge--music" : ""}`}
        >
          {mode === "musicQuiz" ? "🎵" : "100"}
        </span>
        <span className="logo-title">
          {mode === "musicQuiz" ? "QUIZ ÂM NHẠC" : "GỢI Ý 100"}
        </span>
      </div>

      {/* Mode Switcher Tabs (Only shown when not inside a game round, or allows switching home screens) */}
      {!isMatchActive && (
        <div className="header-mode-nav">
          <button
            type="button"
            className={`mode-nav-btn ${mode === "hint100" ? "active" : ""}`}
            onClick={() => onSwitchMode("hint100")}
            aria-pressed={mode === "hint100"}
          >
            🎮 Gợi Ý 100
          </button>
          <button
            type="button"
            className={`mode-nav-btn ${mode === "musicQuiz" ? "active" : ""}`}
            onClick={() => onSwitchMode("musicQuiz")}
            aria-pressed={mode === "musicQuiz"}
          >
            🎵 Quiz Âm Nhạc
          </button>
        </div>
      )}

      <div className="header-actions">
        {onGoHome && (
          <button
            type="button"
            className="header-control-btn"
            onClick={onGoHome}
            aria-label="Thoát ván và về trang đầu"
            title="Thoát ván"
          >
            <span aria-hidden="true">
              <span className="header-control-text">Thoát</span>
            </span>
          </button>
        )}
        <button
          type="button"
          className="header-control-btn sound-toggle-btn"
          onClick={onToggleSound}
          aria-label={soundEnabled ? "Tắt âm thanh" : "Bật âm thanh"}
          aria-pressed={soundEnabled}
          title={soundEnabled ? "Tắt âm thanh" : "Bật âm thanh"}
        >
          {soundEnabled ? (
            <span className="sound-icon sound-on" aria-hidden="true">
              🔊 <span className="header-control-text">Bật</span>
            </span>
          ) : (
            <span className="sound-icon sound-off" aria-hidden="true">
              🔇 <span className="header-control-text">Tắt</span>
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
