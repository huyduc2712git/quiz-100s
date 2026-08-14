import React, { useEffect, useRef, useState } from "react";
import type { Card, WikiExtract } from "../types/game";
import { fetchWikiSummary } from "../utils/wiki";
import { playTimeoutSound } from "../utils/audio";

interface TimeoutScreenProps {
  card: Card;
  questionIndex: number;
  totalQuestions: number;
  soundEnabled: boolean;
  onNextQuestion: () => void;
}

export const TimeoutScreen: React.FC<TimeoutScreenProps> = ({
  card,
  questionIndex,
  totalQuestions,
  soundEnabled,
  onNextQuestion,
}) => {
  const [wikiData, setWikiData] = useState<WikiExtract | null>(null);
  const [isLoadingWiki, setIsLoadingWiki] = useState<boolean>(true);
  const soundEnabledRef = useRef(soundEnabled);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    playTimeoutSound(soundEnabledRef.current);
  }, [card]);

  useEffect(() => {
    let isMounted = true;
    setWikiData(null);
    setIsLoadingWiki(true);

    fetchWikiSummary(card.answer, card.source_url)
      .then((data) => {
        if (isMounted) {
          setWikiData(data);
          setIsLoadingWiki(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setWikiData({
            title: card.answer,
            extract: "Không thể lấy thông tin tóm tắt vào lúc này.",
            pageUrl: card.source_url || `https://vi.wikipedia.org/w/index.php?search=${encodeURIComponent(card.answer)}`,
          });
          setIsLoadingWiki(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [card]);

  const isLastQuestion = questionIndex === totalQuestions - 1;

  return (
    <div className="timeout-screen fade-in">
      {/* 1. Compact Timeout Alert Banner */}
      <div className="timeout-banner" role="alert">
        <div className="timeout-banner-left">
          <span className="timeout-icon" aria-hidden="true">⏰</span>
          <h2 className="timeout-title">HẾT GIỜ!</h2>
        </div>
        <p className="timeout-subtitle">Chưa đoán kịp trong 100 giây</p>
      </div>

      {/* 2. Compact Answer Box */}
      <div className="timeout-answer-box">
        <span className="answer-label">ĐÁP ÁN:</span>
        <h3 className="timeout-answer-text">{card.answer}</h3>
      </div>


      {/* Wikipedia Learn More Box */}
      <div className="wiki-card">
        <div className="wiki-header">
          <span>📖 Tìm hiểu thêm</span>
          <span className="wiki-source">Wikipedia</span>
        </div>
        <div className="wiki-body">
          {isLoadingWiki ? (
            <div className="wiki-loading">Đang tải tóm tắt từ Wikipedia...</div>
          ) : (
            <>
              <p className="wiki-extract">
                {wikiData?.extract || "Không có đoạn tóm tắt."}
              </p>
              <div className="wiki-link-wrapper">
                <a
                  href={wikiData?.pageUrl || card.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wiki-link"
                >
                  🔗 Xem thêm trên Wikipedia ↗
                </a>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="timeout-action-bar">
        <button
          type="button"
          className="btn btn-primary btn-next pulse-button"
          onClick={onNextQuestion}
        >
          {isLastQuestion ? "🏆 XEM KẾT QUẢ VÁN CHƠI" : "➡️ CÂU TIẾP THEO"}
        </button>
      </div>
    </div>
  );
};
