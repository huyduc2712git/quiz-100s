import React from "react";
import type { ImageQuizResult } from "../../types/imageQuiz";

interface ImageQuizResultsScreenProps {
  packTitle: string;
  results: ImageQuizResult[];
  score: number;
  maxStreak: number;
  onPlayAgain: () => void;
  onChangePack: () => void;
  onGoHome: () => void;
}

export const ImageQuizResultsScreen: React.FC<ImageQuizResultsScreenProps> = ({
  packTitle,
  results,
  score,
  maxStreak,
  onPlayAgain,
  onChangePack,
  onGoHome,
}) => {
  const correctCount = results.filter((r) => r.isCorrect).length;
  const totalCount = results.length || 10;
  const percentage = Math.round((correctCount / totalCount) * 100);

  let medalIcon = "🎉";
  let gradeText = "Khám phá rất cừ khôi!";
  if (percentage === 100) {
    medalIcon = "👑";
    gradeText = "Bậc thầy địa lý & du lịch Đông Nam Á!";
  } else if (percentage >= 80) {
    medalIcon = "🥇";
    gradeText = "Xuất sắc! Bạn là một nhà thám hiểm tài ba!";
  } else if (percentage >= 60) {
    medalIcon = "🥈";
    gradeText = "Rất tốt! Kiến thức địa danh rất vững vàng!";
  } else if (percentage >= 40) {
    medalIcon = "🥉";
    gradeText = "Khá lắm! Thử lại để đạt điểm tối đa nhé!";
  } else {
    medalIcon = "🧭";
    gradeText = "Cùng thử lại để khám phá thêm nhiều địa danh nhé!";
  }

  return (
    <div className="image-results-screen fade-in">
      {/* 1. Header with Medal */}
      <div className="results-header">
        <div className="results-medal">{medalIcon}</div>
        <h2 className="results-title">KẾT QUẢ ĐOÁN ĐỊA DANH</h2>
        <div className="results-category-tag">{packTitle}</div>
      </div>

      {/* 2. Score Hero Card */}
      <div className="results-score-card landmark-score-card">
        <div className="score-main">
          Đoán đúng{" "}
          <strong className="highlight-score">
            {correctCount}/{totalCount}
          </strong>{" "}
          địa danh
        </div>
        <div className="score-percentage">{percentage}%</div>
        <div className="score-grade">{gradeText}</div>

        <div className="music-stats-row">
          <div className="stat-pill">
            <span className="stat-pill-num">{score}</span>
            <span className="stat-pill-lbl">Tổng điểm</span>
          </div>
          <div className="stat-pill">
            <span className="stat-pill-num">🔥 {maxStreak}</span>
            <span className="stat-pill-lbl">Chuỗi đúng cao nhất</span>
          </div>
        </div>
      </div>

      {/* 3. Detailed Breakdown of Landmarks Guessed */}
      <div className="results-list-section">
        <h3 className="section-title">Chi tiết các địa danh đã chơi:</h3>
        <div className="results-list">
          {results.map((res, index) => (
            <div
              key={res.question.id || index}
              className={`result-item landmark-result-item ${
                res.isCorrect ? "correct" : "timeout"
              }`}
            >
              {/* Mini Thumbnail */}
              <div className="landmark-thumb-wrapper">
                <img
                  src={res.question.image_url}
                  alt={res.question.landmark_name}
                  className="landmark-result-thumb"
                  loading="lazy"
                />
              </div>

              {/* Info Left */}
              <div className="result-item-left">
                <span className="result-index">
                  #{index + 1} • {res.question.country}
                </span>
                <span className="result-answer">
                  {res.question.landmark_name}
                </span>
              </div>

              {/* Tag Right */}
              <div className="result-item-right">
                {res.isCorrect ? (
                  <span className="result-tag tag-correct">
                    ✓ Đúng ({res.timeSpentSeconds}s)
                  </span>
                ) : (
                  <span className="result-tag tag-timeout">
                    ✗ Chọn: {res.selectedAnswer || "Bỏ qua"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Action Buttons */}
      <div className="results-actions">
        <button
          type="button"
          className="btn btn-primary btn-replay pulse-button"
          onClick={onPlayAgain}
        >
          🔄 CHƠI LẠI VÁN MỚI
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-change-pack"
          onClick={onChangePack}
        >
          🗺️ CHỌN GÓI ĐỊA DANH KHÁC
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-home"
          onClick={onGoHome}
        >
          🏠 VỀ TRANG ĐẦU
        </button>
      </div>
    </div>
  );
};
