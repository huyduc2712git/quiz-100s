import React from "react";

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className="error-container" role="alert">
      <div className="error-icon" aria-hidden="true">⚠️</div>
      <h2 className="error-title">Không thể tải dữ liệu câu hỏi</h2>
      <p className="error-message">
        {message || "Đã xảy ra lỗi khi tải bộ câu hỏi từ máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại."}
      </p>
      <button type="button" className="btn btn-primary btn-retry" onClick={onRetry}>
        🔄 Thử lại
      </button>
    </div>
  );
};
