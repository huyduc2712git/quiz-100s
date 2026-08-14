import React, { useState } from "react";
import type { MusicQuizPack } from "../../types/musicQuiz";

interface MusicQuizHomeScreenProps {
  packs: MusicQuizPack[];
  onStartQuiz: (packId: string | "all") => void;
}

interface CategoryPackConfig {
  id: string | "all";
  shortName: string;
  fullName: string;
  subtitle: string;
  icon: string;
  countLabel: string;
  totalQuestions: number;
  themeClass: string;
}

export const MusicQuizHomeScreen: React.FC<MusicQuizHomeScreenProps> = ({
  packs,
  onStartQuiz,
}) => {
  const [selectedPackId, setSelectedPackId] = useState<string | "all">("vn-movie-100");

  const totalAllQuestions = packs.reduce((acc, p) => acc + p.totalQuestions, 0);

  const categoryConfigs: CategoryPackConfig[] = [
    {
      id: "vn-movie-100",
      shortName: "Nhạc Phim",
      fullName: "Nhạc Phim Việt Nam",
      subtitle: "100 câu trích đoạn OST phim Việt nổi tiếng",
      icon: "🎬",
      countLabel: "100 câu",
      totalQuestions: 100,
      themeClass: "cat-theme-amber",
    },
    {
      id: "vpop-100",
      shortName: "V-Pop Hits",
      fullName: "Hit V-Pop 2013 – 2025",
      subtitle: "100 câu hit V-Pop đình đám được yêu thích",
      icon: "🎧",
      countLabel: "100 câu",
      totalQuestions: 100,
      themeClass: "cat-theme-violet",
    },
    {
      id: "vn-movie-50",
      shortName: "Tuyển Chọn",
      fullName: "Tuyển Chọn OST 50",
      subtitle: "50 câu chọn lọc đặc sắc phim điện ảnh",
      icon: "🍿",
      countLabel: "50 câu",
      totalQuestions: 50,
      themeClass: "cat-theme-cyan",
    },
    {
      id: "all",
      shortName: "Tổng Hợp",
      fullName: "Hỗn Hợp Tất Cả",
      subtitle: `Trộn ngẫu nhiên toàn bộ kho ${totalAllQuestions} câu hỏi`,
      icon: "🎲",
      countLabel: `${totalAllQuestions} câu`,
      totalQuestions: totalAllQuestions,
      themeClass: "cat-theme-magenta",
    },
  ];

  const selectedPack =
    categoryConfigs.find((p) => p.id === selectedPackId) || categoryConfigs[0];

  const handleStart = () => {
    onStartQuiz(selectedPackId);
  };

  return (
    <div className="music-home-screen fade-in">
      {/* App Mascot Top Hero Card */}
      <div className="app-mascot-hero-card">
        <div className="hero-card-content">
          <div className="hero-card-tag">🎵 QUIZ ÂM NHẠC & PHIM</div>
          <h1 className="hero-card-headline">Đoán Nhạc Việt!</h1>
          <p className="hero-card-subline">
            Lắng nghe 30s trích đoạn giấu tên và chọn đáp án chính xác!
          </p>
        </div>
        <div className="hero-card-mascot" aria-hidden="true">
          <div className="mascot-disc-bubble">
            <span className="mascot-icon">🎧</span>
          </div>
        </div>
      </div>

      {/* Rules Mini Bar */}
      <div className="rules-mini-banner">
        <div className="rule-mini-item">
          <span className="rule-dot dot-1" />
          <span>30s Trích đoạn</span>
        </div>
        <div className="rule-mini-item">
          <span className="rule-dot dot-2" />
          <span>4 Lựa chọn</span>
        </div>
        <div className="rule-mini-item">
          <span className="rule-dot dot-3" />
          <span>Combo chuỗi đúng</span>
        </div>
      </div>

      {/* Category Section Header */}
      <div className="category-section-title-row">
        <span className="category-section-heading">CHỌN BỘ ĐỀ QUIZ</span>
        <span className="category-count-tag">{categoryConfigs.length} chủ đề</span>
      </div>

      {/* Category App-Icon Grid (Hàng 4 cột dạng icon ứng dụng nhỏ gọn, mở rộng vô hạn) */}
      <div
        className="category-icons-grid"
        role="group"
        aria-label="Danh mục bộ đề âm nhạc"
      >
        {categoryConfigs.map((cat) => {
          const isSelected = selectedPackId === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              className={`category-icon-item ${cat.themeClass} ${isSelected ? "is-selected" : ""}`}
              onClick={() => setSelectedPackId(cat.id)}
              aria-pressed={isSelected}
            >
              {/* Rounded App Icon Bubble */}
              <div className="category-icon-bubble">
                <span className="cat-emoji">{cat.icon}</span>
                {isSelected && <span className="cat-active-check">✓</span>}
              </div>

              {/* Label & Count */}
              <span className="category-item-label">{cat.shortName}</span>
              <span className="category-item-count">{cat.countLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Category Info Card */}
      <div className="selected-category-banner fade-in">
        <div className="sel-cat-icon">{selectedPack.icon}</div>
        <div className="sel-cat-text">
          <div className="sel-cat-title">
            {selectedPack.fullName}{" "}
            <span className="sel-cat-badge">{selectedPack.countLabel}</span>
          </div>
          <div className="sel-cat-desc">{selectedPack.subtitle}</div>
        </div>
      </div>

      {/* Start Game Action Button */}
      <div className="action-area">
        <button
          type="button"
          className="btn btn-music-start pulse-button"
          onClick={handleStart}
        >
          🚀 BẮT ĐẦU CHƠI ({selectedPack.totalQuestions} CÂU)
        </button>
      </div>
    </div>
  );
};
