import React from "react";
import { formatCategoryName } from "../utils/gameUtils";
import { PWAInstallBanner } from "./PWAInstallBanner";

interface HomeScreenProps {
  categories: string[];
  totalCards: number;
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  onStartGame: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  categories,
  totalCards,
  selectedCategory,
  onSelectCategory,
  onStartGame,
}) => {
  return (
    <div className="home-screen fade-in">
      <div className="hero-banner">
        <div className="hero-badge">Game Show 2 Người</div>
        <h1 className="hero-title">GỢI Ý 100</h1>
        <p className="hero-subtitle">
          Thử thách đoán nhanh cùng bạn bè với {totalCards} câu hỏi hấp dẫn!
        </p>
      </div>

      {/* PWA Install Banner */}
      <PWAInstallBanner />

      <div className="rules-card">
        <h2 className="rules-title">🎮 Cách chơi đơn giản</h2>
        <div className="rules-steps">
          <div className="rule-step">
            <span className="step-num">1</span>
            <div className="step-text">
              <strong>Người 1 cầm điện thoại:</strong> Nhìn đáp án và đọc từng gợi ý xuất hiện.
            </div>
          </div>
          <div className="rule-step">
            <span className="step-num">2</span>
            <div className="step-text">
              <strong>Người 2 quay đi:</strong> Không nhìn màn hình và liên tục đoán đáp án.
            </div>
          </div>
          <div className="rule-step">
            <span className="step-num">3</span>
            <div className="step-text">
              <strong>Thời gian & Nút bấm:</strong> Mỗi câu có <strong>100 giây</strong>. Đoán đúng bấm <strong>"Đúng"</strong> ngay!
            </div>
          </div>
        </div>
      </div>

      <fieldset className="category-selection-box">
        <legend className="section-label">Chủ đề bài chơi:</legend>
        <div className="category-chips">
          <button
            type="button"
            className={`chip ${selectedCategory === null ? "active" : ""}`}
            onClick={() => onSelectCategory(null)}
            aria-pressed={selectedCategory === null}
          >
            🎲 Ngẫu nhiên tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`chip ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => onSelectCategory(cat)}
              aria-pressed={selectedCategory === cat}
            >
              {formatCategoryName(cat)}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="action-area">
        <button
          type="button"
          className="btn btn-start pulse-button"
          onClick={onStartGame}
        >
          🚀 BẮT ĐẦU VÁN MỚI
        </button>
      </div>
    </div>
  );
};
