import React from "react";
import type { ImageQuizPack } from "../../types/imageQuiz";

interface ImageQuizHomeScreenProps {
  packs: ImageQuizPack[];
  selectedPackId: string;
  onSelectPack: (packId: string) => void;
  onStartGame: (packId: string) => void;
}

interface LandmarkCategoryConfig {
  id: string;
  shortName: string;
  fullName: string;
  subtitle: string;
  icon: string;
  countLabel: string;
  totalQuestions: number;
  themeClass: string;
}

export const ImageQuizHomeScreen: React.FC<ImageQuizHomeScreenProps> = ({
  selectedPackId,
  onSelectPack,
  onStartGame,
}) => {

  const categoryConfigs: LandmarkCategoryConfig[] = [
    {
      id: "geo-vietnam-world-1",
      shortName: "Địa Lý #1",
      fullName: "Địa Lý #1: Việt Nam & Thế Giới",
      subtitle: "26 câu hỏi hình ảnh địa lý: đảo Phú Quốc, Bản Giốc, Mỹ Khê, Tà Đùng, Machu Picchu, Petra...",
      icon: "🌏",
      countLabel: "26 câu",
      totalQuestions: 26,
      themeClass: "cat-theme-violet",
    },
    {
      id: "geo-vietnam-world-2",
      shortName: "Địa Lý #2",
      fullName: "Địa Lý #2: Khám Phá Thế Giới",
      subtitle: "69 câu hỏi địa lý phong phú: thủ đô, núi non, sông hồ, sa mạc, kỳ quan và các kỷ lục thế giới...",
      icon: "🧭",
      countLabel: "69 câu",
      totalQuestions: 69,
      themeClass: "cat-theme-magenta",
    },
    {
      id: "sea-landmarks-all",
      shortName: "Tất Cả ĐNÁ",
      fullName: "Kỳ Quan & Địa Danh Đông Nam Á",
      subtitle: "Khám phá 30+ danh thắng & di sản thế giới nổi tiếng khắp 11 nước ĐNÁ",
      icon: "🏛️",
      countLabel: "30 câu",
      totalQuestions: 30,
      themeClass: "cat-theme-cyan",
    },
    {
      id: "sea-heritage",
      shortName: "Di Sản Cổ",
      fullName: "Di Sản Cổ Kính & Đền Chùa ĐNÁ",
      subtitle: "Chiêm ngưỡng Angkor Wat, Borobudur, Bagan, Shwedagon, Hội An...",
      icon: "🕌",
      countLabel: "17 câu",
      totalQuestions: 17,
      themeClass: "cat-theme-amber",
    },
    {
      id: "sea-nature",
      shortName: "Kỳ Quan & Hiện Đại",
      fullName: "Kỳ Quan Thiên Nhiên & Hiện Đại",
      subtitle: "Vịnh Hạ Long, Marina Bay Sands, Tháp Petronas, Núi lửa Bromo...",
      icon: "🏝️",
      countLabel: "13 câu",
      totalQuestions: 13,
      themeClass: "cat-theme-emerald",
    },
  ];

  const selectedPack =
    categoryConfigs.find((p) => p.id === selectedPackId) || categoryConfigs[0];

  return (
    <div className="music-home-screen fade-in">
      {/* 1. App Mascot Hero Card */}
      <div className="app-mascot-hero-card image-mascot-hero">
        <div className="hero-card-content">
          <div className="hero-card-tag hero-tag-cyan">📸 NHÌN HÌNH ĐOÁN ĐỊA DANH</div>
          <h1 className="hero-card-headline">Khám Phá Đông Nam Á!</h1>
          <p className="hero-card-subline">
            Ngắm nhìn những bức ảnh danh lam thắng cảnh lộng lẫy và thử thách vốn hiểu biết du lịch của bạn!
          </p>
        </div>
        <div className="hero-card-mascot" aria-hidden="true">
          <div className="mascot-disc-bubble mascot-globe-bubble">
            <span className="mascot-icon">🌏</span>
          </div>
        </div>
      </div>

      {/* 2. Rules Mini Bar */}
      <div className="rules-mini-banner">
        <div className="rule-mini-item">
          <span className="rule-dot dot-1" />
          <span>📸 10 Câu ngẫu nhiên</span>
        </div>
        <div className="rule-mini-item">
          <span className="rule-dot dot-2" />
          <span>🧩 Mở 1 góc mỗi 10s</span>
        </div>
        <div className="rule-mini-item">
          <span className="rule-dot dot-3" />
          <span>💡 Khám phá Fun Fact</span>
        </div>
      </div>

      {/* 3. Category Section Header */}
      <div className="category-section-title-row">
        <span className="category-section-heading">CHỌN BỘ ĐỀ ĐỊA DANH</span>
        <span className="category-count-tag">{categoryConfigs.length} chủ đề</span>
      </div>

      {/* 4. Category App-Icon Grid */}
      <div
        className="category-icons-grid"
        role="group"
        aria-label="Danh mục bộ đề địa danh"
      >
        {categoryConfigs.map((cat) => {
          const isSelected = selectedPackId === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              className={`category-icon-item ${cat.themeClass} ${isSelected ? "is-selected" : ""}`}
              onClick={() => onSelectPack(cat.id)}
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

      {/* 5. Selected Category Info Banner */}
      <div className="selected-category-banner selected-landmark-banner fade-in">
        <div className="sel-cat-icon">{selectedPack.icon}</div>
        <div className="sel-cat-text">
          <div className="sel-cat-title">
            {selectedPack.fullName}{" "}
            <span className="sel-cat-badge badge-cyan">{selectedPack.countLabel}</span>
          </div>
          <div className="sel-cat-desc">{selectedPack.subtitle}</div>
        </div>
      </div>

      {/* 6. Start Action Button */}
      <div className="action-area">
        <button
          type="button"
          className="btn btn-music-start btn-image-start pulse-button"
          onClick={() => onStartGame(selectedPackId)}
        >
          🚀 BẮT ĐẦU CHƠI ({selectedPack.countLabel})
        </button>
      </div>
    </div>
  );
};
