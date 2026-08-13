import React, { useEffect, useRef, useState } from "react";
import { formatCategoryName } from "../utils/gameUtils";
import { playClickSound } from "../utils/audio";

interface RandomizerScreenProps {
  categories: string[];
  chosenCategory: string;
  soundEnabled: boolean;
  onConfirmStart: () => void;
}

export const RandomizerScreen: React.FC<RandomizerScreenProps> = ({
  categories,
  chosenCategory,
  soundEnabled,
  onConfirmStart,
}) => {
  const [displayCategory, setDisplayCategory] = useState<string>(categories[0] || chosenCategory);
  const [isSpinning, setIsSpinning] = useState<boolean>(true);
  const soundEnabledRef = useRef(soundEnabled);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion || categories.length === 0) {
      setDisplayCategory(chosenCategory);
      setIsSpinning(false);
      return;
    }

    let interval: ReturnType<typeof setInterval> | undefined;
    let count = 0;
    const maxSteps = 15;

    setIsSpinning(true);

    interval = setInterval(() => {
      count++;
      // Random display name during spin
      const randCat = categories[Math.floor(Math.random() * categories.length)];
      setDisplayCategory(randCat);
      playClickSound(soundEnabledRef.current);

      if (count >= maxSteps) {
        clearInterval(interval);
        setDisplayCategory(chosenCategory);
        setIsSpinning(false);
      }
    }, 100);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [categories, chosenCategory]);

  return (
    <div className="randomizer-screen fade-in">
      <h2 className="randomizer-subtitle">ĐANG CHỌN CHỦ ĐỀ...</h2>
      
      <div
        className={`spinner-box ${isSpinning ? "spinning" : "chosen"}`}
        aria-hidden={isSpinning}
      >
        <div className="category-icon">✨</div>
        <div className="category-name-display">
          {formatCategoryName(displayCategory)}
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {isSpinning
          ? "Đang chọn chủ đề"
          : `Đã chọn chủ đề ${formatCategoryName(chosenCategory)}`}
      </p>

      {!isSpinning && (
        <div className="randomizer-confirm fade-in">
          <p className="ready-text">Đã chuẩn bị 5 câu hỏi ngẫu nhiên!</p>
          <button
            type="button"
            className="btn btn-primary btn-play-now pulse-button"
            onClick={onConfirmStart}
          >
            🎮 BẮT ĐẦU CHƠI (CÂU 1/5)
          </button>
        </div>
      )}
    </div>
  );
};
