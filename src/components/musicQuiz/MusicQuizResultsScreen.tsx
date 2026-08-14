import React from "react";
import type { MusicQuizResult } from "../../types/musicQuiz";

interface MusicQuizResultsScreenProps {
  packTitle: string;
  results: MusicQuizResult[];
  score: number;
  maxStreak: number;
  onPlayAgain: () => void;
  onChangePack: () => void;
  onGoHome: () => void;
}

export const MusicQuizResultsScreen: React.FC<MusicQuizResultsScreenProps> = ({
  packTitle,
  results,
  score,
  maxStreak,
  onPlayAgain,
  onChangePack,
  onGoHome,
}) => {
  const correctCount = results.filter((r) => r.isCorrect).length;
  const totalCount = results.length || 1;
  const percentage = Math.round((correctCount / totalCount) * 100);

  let medalIcon = "🎉";
  let gradeText = "Tuyệt vời!";
  if (percentage === 100) {
    medalIcon = "🏆";
    gradeText = "Đỉnh cao âm nhạc! Đoán đúng 100%!";
  } else if (percentage >= 80) {
    medalIcon = "🥇";
    gradeText = "Đôi tai vàng! Kiến thức âm nhạc xuất sắc!";
  } else if (percentage >= 60) {
    medalIcon = "🥈";
    gradeText = "Rất tốt! Bạn nghe nhạc rất sành!";
  } else if (percentage >= 40) {
    medalIcon = "🥉";
    gradeText = "Khá lắm! Luyện thêm để đạt điểm tuyệt đối nhé!";
  } else {
    medalIcon = "💪";
    gradeText = "Cố gắng lên ở ván tiếp theo!";
  }

  return (
    <div className="music-results-screen fade-in">
      <div className="results-header">
        <div className="results-medal">{medalIcon}</div>
        <h2 className="results-title">KẾT QUẢ QUIZ ÂM NHẠC</h2>
        <div className="results-category-tag">{packTitle}</div>
      </div>

      {/* Summary Score Card */}
      <div className="results-score-card music-score-card">
        <div className="score-main">
          Tổng điểm: <strong className="highlight-score">{score}</strong>
        </div>
        <div className="music-stats-row">
          <div className="stat-pill">
            <span className="stat-label">Số câu đúng</span>
            <span className="stat-val">{correctCount}/{totalCount}</span>
          </div>
          <div className="stat-pill">
            <span className="stat-label">Tỉ lệ chính xác</span>
            <span className="stat-val">{percentage}%</span>
          </div>
          {maxStreak >= 2 && (
            <div className="stat-pill">
              <span className="stat-label">Chuỗi đúng max</span>
              <span className="stat-val">🔥 {maxStreak}x</span>
            </div>
          )}
        </div>
        <div className="score-grade">{gradeText}</div>
      </div>

      {/* Detailed Breakdown */}
      <div className="results-list-section">
        <h3 className="section-title">Chi tiết từng câu hỏi:</h3>
        <div className="results-list">
          {results.map((res, index) => {
            const q = res.question;
            return (
              <div
                key={q.id || index}
                className={`result-item music-result-item ${res.isCorrect ? "correct" : "timeout"}`}
              >
                <div className="result-item-left">
                  <div className="result-q-header">
                    <span className="result-index">Câu {index + 1}</span>
                    <span className="result-q-title">{q.question}</span>
                  </div>

                  <div className="result-answers-meta">
                    <div className="meta-ans">
                      Đáp án đúng: <strong>{q.correct_answer}</strong>
                    </div>
                    {!res.isCorrect && res.selectedAnswer && (
                      <div className="meta-ans-wrong">
                        Bạn đã chọn: <span>{res.selectedAnswer}</span>
                      </div>
                    )}
                    {(q.song || q.artist || q.movie) && (
                      <div className="meta-song-info">
                        {q.song && <span>🎵 {q.song}</span>}
                        {q.artist && <span> • 🎤 {q.artist}</span>}
                        {q.movie && <span> • 🎬 {q.movie}</span>}
                      </div>
                    )}
                  </div>
                </div>

                <div className="result-item-right">
                  {res.isCorrect ? (
                    <span className="result-tag tag-correct">
                      ✓ Đúng ({res.timeSpentSeconds}s)
                    </span>
                  ) : res.selectedAnswer ? (
                    <span className="result-tag tag-wrong">
                      ✗ Sai ({res.timeSpentSeconds}s)
                    </span>
                  ) : (
                    <span className="result-tag tag-timeout">
                      ⏱️ Hết giờ
                    </span>
                  )}
                  {q.youtube_url && (
                    <a
                      href={q.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="youtube-link-btn"
                      title="Mở video trên YouTube"
                    >
                      ▶️ YouTube
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
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
          className="btn btn-secondary"
          onClick={onChangePack}
        >
          🎵 CHỌN BỘ CÂU HỎI KHÁC
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
