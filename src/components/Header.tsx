import React from "react";

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onGoHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  soundEnabled,
  onToggleSound,
  onGoHome,
}) => {
  return (
    <header className="game-header">
      <div className="header-brand">
        <span className="logo-badge">100</span>
        <span className="logo-title">GỢI Ý 100</span>
      </div>
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
              🏠 <span className="header-control-text">Thoát</span>
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
