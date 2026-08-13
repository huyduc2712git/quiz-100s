import React from "react";
import type { QuestionResult } from "../types/game";
import { formatCategoryName } from "../utils/gameUtils";

interface ResultsScreenProps {
  category: string;
  results: QuestionResult[];
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  category,
  results,
  onPlayAgain,
  onGoHome,
}) => {
  const correctCount = results.filter((r) => r.isCorrect).length;
  const totalCount = results.length || 5;
  const percentage = Math.round((correctCount / totalCount) * 100);

  let medalIcon = "🎉";
  let gradeText = "Tuyệt vời!";
  if (percentage === 100) {
    medalIcon = "🥇";
    gradeText = "Xuất sắc! Đoán đúng 100%";
  } else if (percentage >= 60) {
    medalIcon = "🥈";
    gradeText = "Rất tốt! Phối hợp ăn ý!";
  } else if (percentage >= 40) {
    medalIcon = "🥉";
    gradeText = "Khá lắm! Thử lại để điểm cao hơn!";
  } else {
    medalIcon = "💪";
    gradeText = "Cố gắng lên ở ván tiếp theo!";
  }

  return (
    <div className="results-screen fade-in">
      <div className="results-header">
        <div className="results-medal">{medalIcon}</div>
        <h2 className="results-title">KẾT QUẢ VÁN CHƠI</h2>
        <div className="results-category-tag">Chủ đề: {formatCategoryName(category)}</div>
      </div>

      <div className="results-score-card">
        <div className="score-main">
          Bạn đoán đúng <strong className="highlight-score">{correctCount}/{totalCount}</strong> câu
        </div>
        <div className="score-percentage">{percentage}%</div>
        <div className="score-grade">{gradeText}</div>
      </div>

      {/* Questions Breakdown List */}
      <div className="results-list-section">
        <h3 className="section-title">Chi tiết 5 câu hỏi:</h3>
        <div className="results-list">
          {results.map((res, index) => (
            <div
              key={res.card.id || index}
              className={`result-item ${res.isCorrect ? "correct" : "timeout"}`}
            >
              <div className="result-item-left">
                <span className="result-index">Câu {index + 1}</span>
                <span className="result-answer">{res.card.answer}</span>
              </div>
              <div className="result-item-right">
                {res.isCorrect ? (
                  <span className="result-tag tag-correct">
                    ✓ Đúng ({res.timeSpentSeconds}s)
                  </span>
                ) : (
                  <span className="result-tag tag-timeout">
                    ⏱️ Hết giờ (100s)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
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
          className="btn btn-secondary btn-home"
          onClick={onGoHome}
        >
          🏠 VỀ TRANG ĐẦU
        </button>
      </div>
    </div>
  );
};
