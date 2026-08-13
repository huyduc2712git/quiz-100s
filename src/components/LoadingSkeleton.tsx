import React from "react";

export const LoadingSkeleton: React.FC = () => {
  return (
    <div
      className="skeleton-container"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Đang tải dữ liệu..."
    >
      <div className="skeleton-header skeleton-pulse"></div>
      <div className="skeleton-card skeleton-pulse"></div>
      <div className="skeleton-card skeleton-pulse" style={{ animationDelay: "0.2s" }}></div>
      <div className="skeleton-card skeleton-pulse" style={{ animationDelay: "0.4s" }}></div>
      <p className="skeleton-text">Đang tải 600 câu hỏi Gợi Ý 100...</p>
    </div>
  );
};
