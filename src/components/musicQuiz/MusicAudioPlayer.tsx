import React, { useEffect, useRef, useState } from "react";
import {
  extractYouTubeId,
  getYouTubeEmbedUrl,
} from "../../utils/musicQuizUtils";

interface MusicAudioPlayerProps {
  youtubeUrl: string;
  audioStart: number;
  audioDuration: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  isAnswered?: boolean;
}

export const MusicAudioPlayer: React.FC<MusicAudioPlayerProps> = ({
  youtubeUrl,
  audioStart,
  audioDuration = 30,
  isPlaying,
  onTogglePlay,
  isAnswered = false,
}) => {
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const [key, setKey] = useState<number>(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isFirstMount = useRef<boolean>(true);

  const videoId = extractYouTubeId(youtubeUrl);

  // When question changes, reset video toggle and reload iframe
  useEffect(() => {
    setShowVideo(false);
    setKey((prev) => prev + 1);
    isFirstMount.current = true;
  }, [youtubeUrl, audioStart]);

  // Seamless Pause / Resume via YouTube Iframe API postMessage without reloading
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (!iframeRef.current?.contentWindow) return;

    try {
      if (isPlaying) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "playVideo", args: "" }),
          "*",
        );
      } else {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "pauseVideo", args: "" }),
          "*",
        );
      }
    } catch {
      // Fallback ignore if postMessage throws
    }
  }, [isPlaying]);

  const handleToggleVideo = () => {
    setShowVideo((prev) => {
      const next = !prev;
      if (next && !isPlaying) {
        onTogglePlay();
      }
      return next;
    });
  };

  if (!videoId) {
    return (
      <div className="audio-player-box audio-unavailable">
        <span className="player-icon">🎵</span>
        <span className="player-text">Không tìm thấy nguồn âm thanh</span>
      </div>
    );
  }

  // Embed URL with enablejsapi=1 so YouTube accepts postMessage commands (playVideo/pauseVideo)
  const embedUrl = getYouTubeEmbedUrl(
    youtubeUrl,
    audioStart,
    showVideo ? 600 : audioDuration,
    1,
  );

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="audio-player-stage">
      {/* Hidden YouTube Engine (Always mounted during the question so pause/resume is instant) */}
      <div
        className={`hidden-audio-engine ${showVideo ? "show-as-video" : ""}`}
      >
        <iframe
          key={`${key}-${showVideo ? "vid" : "audio"}`}
          ref={iframeRef}
          src={embedUrl}
          title="Music Player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="audio-engine-iframe"
        />
      </div>

      {/* Audio Box Display (Giống phong cách thẻ trong hình mẫu) */}
      {!showVideo && (
        <div className="app-audio-box">
          {/* Big Center Circular Play/Pause Button */}
          <button
            type="button"
            className={`center-play-circle ${isPlaying ? "playing" : "paused"}`}
            onClick={onTogglePlay}
            title={isPlaying ? "Tạm dừng" : "Phát tiếp tục"}
            aria-label={isPlaying ? "Tạm dừng" : "Phát tiếp tục"}
          >
            <span className="play-icon">{isPlaying ? "❚❚" : "▶"}</span>
          </button>

          {/* Prompt / Status Text */}
          <div className="audio-box-status">
            {isPlaying ? (
              <span className="status-live-text">
                <span className="live-pulsing-dot" /> Đang phát đoạn nhạc (30s)
              </span>
            ) : isAnswered ? (
              <span className="status-idle-text">✓ Đã kết thúc câu hỏi</span>
            ) : (
              <span className="status-idle-text">
                Đã tạm dừng (Nhấn để nghe tiếp)
              </span>
            )}
          </div>

          {/* Equalizer Wave / Clip Info */}
          <div className="audio-wave-row">
            <span className="audio-clip-time">
              {formatSeconds(audioStart)} –{" "}
              {formatSeconds(audioStart + audioDuration)} ({audioDuration}s)
            </span>
          </div>

          {/* Action links */}
          {isAnswered && (
            <div className="audio-box-actions">
              <button
                type="button"
                className="btn-audio-mini btn-mv-toggle"
                onClick={handleToggleVideo}
                title="Xem video MV gốc"
              >
                📺 Xem Video MV
              </button>
            </div>
          )}
        </div>
      )}

      {/* Hide MV Button if watching video */}
      {showVideo && (
        <div className="video-overlay-bar">
          <button
            type="button"
            className="btn-audio-mini btn-hide-video"
            onClick={handleToggleVideo}
          >
            🙈 Ẩn Video MV
          </button>
        </div>
      )}
    </div>
  );
};
