import { useCallback, useEffect, useRef, useState } from "react";
import type { Card, GamePhase, QuestionResult } from "./types/game";
import {
  fetchCards,
  getValidCategories,
  pickRandomQuestions,
} from "./utils/gameUtils";
import { Header } from "./components/Header";
import { LoadingSkeleton } from "./components/LoadingSkeleton";
import { ErrorState } from "./components/ErrorState";
import { HomeScreen } from "./components/HomeScreen";
import { RandomizerScreen } from "./components/RandomizerScreen";
import { GamePlayScreen } from "./components/GamePlayScreen";
import { TimeoutScreen } from "./components/TimeoutScreen";
import { ResultsScreen } from "./components/ResultsScreen";
import "./App.css";

function App() {
  const [phase, setPhase] = useState<GamePhase>("loading");
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [validCategories, setValidCategories] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("goi_y_100_sound_enabled");
        return saved !== null ? saved === "true" : true;
      } catch (error) {
        console.warn("Could not read sound settings", error);
      }
    }
    return true;
  });

  // Current Match State
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [matchQuestions, setMatchQuestions] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const mainRef = useRef<HTMLElement>(null);

  // Sound toggle handler
  const handleToggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("goi_y_100_sound_enabled", String(next));
      } catch (e) {
        console.warn("Could not save sound settings", e);
      }
      return next;
    });
  };

  // Initial Data Fetching
  const loadGameData = useCallback(async () => {
    setPhase("loading");
    setErrorMsg(null);
    try {
      const cards = await fetchCards();
      const validCats = getValidCategories(cards);
      if (validCats.length === 0) {
        throw new Error("Không có chủ đề nào có đủ ít nhất 5 câu hỏi.");
      }
      setAllCards(cards);
      setValidCategories(validCats);
      setPhase("home");
    } catch (err) {
      console.error("Failed to load cards", err);
      setErrorMsg((err as Error).message || "Đã xảy ra lỗi khi tải dữ liệu.");
    }
  }, []);

  useEffect(() => {
    loadGameData();
  }, [loadGameData]);

  useEffect(() => {
    if (phase === "loading") return;

    const frameId = window.requestAnimationFrame(() => {
      mainRef.current?.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [phase]);

  // Start new match sequence
  const startNewMatch = (overrideCategory?: string | null) => {
    if (validCategories.length === 0) return;

    const filter = overrideCategory !== undefined ? overrideCategory : selectedCategoryFilter;
    let chosenCat = filter;

    if (!chosenCat || !validCategories.includes(chosenCat)) {
      // Pick random category from valid categories
      const randIdx = Math.floor(Math.random() * validCategories.length);
      chosenCat = validCategories[randIdx];
    }

    try {
      const questions = pickRandomQuestions(allCards, chosenCat, 5);
      setActiveCategory(chosenCat);
      setMatchQuestions(questions);
      setCurrentIndex(0);
      setScore(0);
      setResults([]);
      setPhase("randomizing");
    } catch (err) {
      console.error("Error starting match", err);
      alert((err as Error).message);
    }
  };

  // Confirm playing after category randomizer animation
  const handleConfirmStartPlaying = () => {
    setPhase("playing");
  };

  // Correct answer handler
  const handleCorrectAnswer = (timeSpentSeconds: number) => {
    if (phase !== "playing") return;

    const currentCard = matchQuestions[currentIndex];
    const newResult: QuestionResult = {
      card: currentCard,
      isCorrect: true,
      timeSpentSeconds,
    };

    setScore((prev) => prev + 1);
    setResults((prev) => [...prev, newResult]);

    if (currentIndex < matchQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      // Phase remains 'playing', card updates automatically
    } else {
      setPhase("finished");
    }
  };

  // Timeout handler
  const handleTimeout = useCallback(() => {
    if (phase !== "playing") return;

    const currentCard = matchQuestions[currentIndex];
    const newResult: QuestionResult = {
      card: currentCard,
      isCorrect: false,
      timeSpentSeconds: 100,
    };

    setResults((prev) => [...prev, newResult]);
    setPhase("timeout");
  }, [currentIndex, matchQuestions, phase]);

  // Continue to next question from timeout screen
  const handleNextFromTimeout = () => {
    if (currentIndex < matchQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setPhase("playing");
    } else {
      setPhase("finished");
    }
  };

  // Return to home screen
  const handleGoHome = () => {
    setPhase("home");
  };

  const handleExitMatch = () => {
    const shouldConfirm = ["randomizing", "playing", "timeout"].includes(phase);
    if (
      shouldConfirm &&
      !window.confirm("Thoát ván hiện tại và quay về trang đầu?")
    ) {
      return;
    }
    handleGoHome();
  };

  return (
    <div className="app-viewport">
      <Header
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onGoHome={
          ["randomizing", "playing", "timeout"].includes(phase)
            ? handleExitMatch
            : undefined
        }
      />

      <main
        ref={mainRef}
        tabIndex={-1}
        className={`app-main ${phase === "playing" ? "app-main--playing" : ""}`}
      >
        {phase === "loading" && errorMsg && (
          <ErrorState message={errorMsg} onRetry={loadGameData} />
        )}

        {phase === "loading" && !errorMsg && <LoadingSkeleton />}

        {phase === "home" && (
          <HomeScreen
            categories={validCategories}
            totalCards={allCards.length}
            selectedCategory={selectedCategoryFilter}
            onSelectCategory={setSelectedCategoryFilter}
            onStartGame={() => startNewMatch()}
          />
        )}

        {phase === "randomizing" && (
          <RandomizerScreen
            categories={validCategories}
            chosenCategory={activeCategory}
            soundEnabled={soundEnabled}
            onConfirmStart={handleConfirmStartPlaying}
          />
        )}

        {phase === "playing" && matchQuestions[currentIndex] && (
          <GamePlayScreen
            card={matchQuestions[currentIndex]}
            questionIndex={currentIndex}
            totalQuestions={matchQuestions.length}
            score={score}
            soundEnabled={soundEnabled}
            onCorrectAnswer={handleCorrectAnswer}
            onTimeout={handleTimeout}
          />
        )}

        {phase === "timeout" && matchQuestions[currentIndex] && (
          <TimeoutScreen
            card={matchQuestions[currentIndex]}
            questionIndex={currentIndex}
            totalQuestions={matchQuestions.length}
            soundEnabled={soundEnabled}
            onNextQuestion={handleNextFromTimeout}
          />
        )}

        {phase === "finished" && (
          <ResultsScreen
            category={activeCategory}
            results={results}
            onPlayAgain={() => startNewMatch()}
            onGoHome={handleGoHome}
          />
        )}
      </main>
    </div>
  );
}

export default App;
