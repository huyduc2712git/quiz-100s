import React from "react";
import { formatCategoryName, formatCategoryShortName, getCategoryEmoji } from "../utils/gameUtils";


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
  const currentCategoryName = selectedCategory
    ? formatCategoryName(selectedCategory)
    : "Ngẫu Nhiên Tất Cả Chủ Đề";
  const currentCategoryEmoji = getCategoryEmoji(selectedCategory);

  return (
    <div className="home-screen fade-in">
      {/* App Mascot Top Hero Card */}
      <div className="app-mascot-hero-card">
        <div className="hero-card-content">
          <div className="hero-card-tag">🎮 GAME SHOW 2 NGƯỜI</div>
          <h1 className="hero-card-headline">Gợi Ý 100!</h1>
          <p className="hero-card-subline">
            Người cầm máy dựa vào Wikipedia đối thoại, người đối diện hỏi và đoán đáp án!
          </p>
        </div>
        <div className="hero-card-mascot" aria-hidden="true">
          <div className="mascot-disc-bubble">
            <span className="mascot-icon">🎯</span>
          </div>
        </div>
      </div>

      {/* Rules Mini Bar */}
      <div className="rules-mini-banner">
        <div className="rule-mini-item">
          <span className="rule-dot dot-1" />
          <span>100s Đếm ngược</span>
        </div>
        <div className="rule-mini-item">
          <span className="rule-dot dot-2" />
          <span>Wiki đối thoại</span>
        </div>
        <div className="rule-mini-item">
          <span className="rule-dot dot-3" />
          <span>Đoán đúng bấm điểm</span>
        </div>
      </div>

      {/* Category Section Header */}
      <div className="category-section-title-row">
        <span className="category-section-heading">CHỌN CHỦ ĐỀ CHƠI</span>
        <span className="category-count-tag">{categories.length + 1} chủ đề</span>
      </div>

      {/* 4-Column Category App-Icon Grid */}
      <div
        className="category-icons-grid"
        role="group"
        aria-label="Chủ đề bài chơi"
      >
        {/* All Random Option */}
        <button
          type="button"
          className={`category-icon-item cat-theme-magenta ${selectedCategory === null ? "is-selected" : ""}`}
          onClick={() => onSelectCategory(null)}
          aria-pressed={selectedCategory === null}
          aria-label="Ngẫu nhiên tất cả"
        >
          <div className="category-icon-bubble">
            <span className="cat-emoji">🎲</span>
            {selectedCategory === null && <span className="cat-active-check">✓</span>}
          </div>
          <span className="category-item-label">Tất Cả</span>
          <span className="category-item-count">{totalCards} câu</span>
        </button>

        {/* Dynamic Categories */}
        {categories.map((cat, idx) => {
          const isSelected = selectedCategory === cat;
          const emoji = getCategoryEmoji(cat);
          const shortName = formatCategoryShortName(cat);
          const themeClasses = [
            "cat-theme-amber",
            "cat-theme-violet",
            "cat-theme-cyan",
            "cat-theme-magenta",
          ];
          const themeClass = themeClasses[idx % themeClasses.length];

          return (
            <button
              key={cat}
              type="button"
              className={`category-icon-item ${themeClass} ${isSelected ? "is-selected" : ""}`}
              onClick={() => onSelectCategory(cat)}
              aria-pressed={isSelected}
            >
              <div className="category-icon-bubble">
                <span className="cat-emoji">{emoji}</span>
                {isSelected && <span className="cat-active-check">✓</span>}
              </div>
              <span className="category-item-label">{shortName}</span>
              <span className="category-item-count">Chủ đề</span>
            </button>
          );
        })}
      </div>

      {/* Selected Category Banner Info */}
      <div className="selected-category-banner fade-in">
        <div className="sel-cat-icon">{currentCategoryEmoji}</div>
        <div className="sel-cat-text">
          <div className="sel-cat-title">
            {currentCategoryName}{" "}
            <span className="sel-cat-badge">
              {selectedCategory === null ? `${totalCards} câu hỏi` : "Toàn bộ chủ đề"}
            </span>
          </div>
          <div className="sel-cat-desc">
            {selectedCategory === null
              ? `Chơi liên tục qua toàn bộ kho ${totalCards} câu hỏi ngẫu nhiên`
              : `Chơi liên tục qua tất cả các câu hỏi thuộc chủ đề ${currentCategoryName}`}
          </div>
        </div>
      </div>


      {/* Start Game Action Button */}
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
