import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Card, GamePhase, QuestionResult } from "./types/game";
import type { AppMode, MusicQuizPhase, MusicQuizResult, MusicQuizQuestion } from "./types/musicQuiz";
import {
  fetchCards,
  getValidCategories,
  pickRandomQuestions,
} from "./utils/gameUtils";
import {
  getAllMusicQuizPacks,
  pickRandomMusicQuestions,
} from "./utils/musicQuizUtils";
import { Header } from "./components/Header";
import { LoadingSkeleton } from "./components/LoadingSkeleton";
import { ErrorState } from "./components/ErrorState";
import { HomeScreen } from "./components/HomeScreen";
import { RandomizerScreen } from "./components/RandomizerScreen";
import { GamePlayScreen } from "./components/GamePlayScreen";
import { TimeoutScreen } from "./components/TimeoutScreen";
import { ResultsScreen } from "./components/ResultsScreen";
import { MusicQuizHomeScreen } from "./components/musicQuiz/MusicQuizHomeScreen";
import { MusicQuizPlayScreen } from "./components/musicQuiz/MusicQuizPlayScreen";
import { MusicQuizResultsScreen } from "./components/musicQuiz/MusicQuizResultsScreen";
import "./App.css";

function App() {
  // Global Mode Switcher
  const [appMode, setAppMode] = useState<AppMode>("musicQuiz");

  // Hint 100 State
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

  // Current Hint100 Match State
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [matchQuestions, setMatchQuestions] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [results, setResults] = useState<QuestionResult[]>([]);

  // Music Quiz State
  const musicPacks = useMemo(() => getAllMusicQuizPacks(), []);
  const [musicPhase, setMusicPhase] = useState<MusicQuizPhase>("home");
  const [activeMusicPackId, setActiveMusicPackId] = useState<string>("vn-movie-100");
  const [activeMusicPackTitle, setActiveMusicPackTitle] = useState<string>("Nhạc Phim Việt Nam");
  const [musicMatchQuestions, setMusicMatchQuestions] = useState<MusicQuizQuestion[]>([]);
  const [currentMusicIndex, setCurrentMusicIndex] = useState<number>(0);
  const [musicScore, setMusicScore] = useState<number>(0);
  const [musicStreak, setMusicStreak] = useState<number>(0);
  const [musicMaxStreak, setMusicMaxStreak] = useState<number>(0);
  const [musicResults, setMusicResults] = useState<MusicQuizResult[]>([]);

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

  // Initial Data Fetching for Hint100
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
  }, [phase, musicPhase, appMode]);

  // Mode switching
  const handleSwitchMode = (newMode: AppMode) => {
    if (newMode === appMode) return;
    const isPlayingHint = ["randomizing", "playing", "timeout"].includes(phase);
    const isPlayingMusic = musicPhase === "playing";

    if (isPlayingHint || isPlayingMusic) {
      if (!window.confirm("Thoát ván chơi hiện tại để chuyển chế độ?")) {
        return;
      }
    }
    setAppMode(newMode);
  };

  // ========== HINT 100 HANDLERS ==========
  const startNewMatch = (overrideCategory?: string | null) => {
    if (allCards.length === 0) return;

    const filter = overrideCategory !== undefined ? overrideCategory : selectedCategoryFilter;
    const chosenCat = filter;

    try {
      // Play all questions in category or all cards (no 5 question cap)
      const questions = pickRandomQuestions(allCards, chosenCat);
      setActiveCategory(chosenCat || "all");
      setMatchQuestions(questions);
      setCurrentIndex(0);
      setScore(0);
      setResults([]);
      setPhase("playing");
    } catch (err) {
      console.error("Error starting match", err);
      alert((err as Error).message);
    }
  };

  const handleConfirmStartPlaying = () => {
    setPhase("playing");
  };


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
    } else {
      setPhase("finished");
    }
  };

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

  const handleNextFromTimeout = () => {
    if (currentIndex < matchQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setPhase("playing");
    } else {
      setPhase("finished");
    }
  };

  const handleGoHomeHint = () => {
    setPhase("home");
  };

  const handleExitMatchHint = () => {
    const shouldConfirm = ["randomizing", "playing", "timeout"].includes(phase);
    if (
      shouldConfirm &&
      !window.confirm("Thoát ván hiện tại và quay về trang đầu?")
    ) {
      return;
    }
    handleGoHomeHint();
  };

  // ========== MUSIC QUIZ HANDLERS ==========
  const handleStartMusicQuiz = (packId: string | "all") => {
    let pool: MusicQuizQuestion[] = [];
    let title = "Hỗn Hợp Tất Cả Gói";

    if (packId === "all") {
      pool = musicPacks.flatMap((p) => p.questions);
    } else {
      const found = musicPacks.find((p) => p.id === packId);
      if (found) {
        pool = found.questions;
        title = found.title;
      }
    }

    if (pool.length === 0) {
      alert("Không có câu hỏi nào trong gói này.");
      return;
    }

    // Play all questions in the pack with song diversity and option shuffling
    const questions = pickRandomMusicQuestions(pool, pool.length, true);
    setActiveMusicPackId(packId);
    setActiveMusicPackTitle(title);
    setMusicMatchQuestions(questions);
    setCurrentMusicIndex(0);
    setMusicScore(0);
    setMusicStreak(0);
    setMusicMaxStreak(0);
    setMusicResults([]);
    setMusicPhase("playing");
  };


  const handleAnswerMusicQuestion = (result: MusicQuizResult) => {
    setMusicResults((prev) => [...prev, result]);

    if (result.isCorrect) {
      const bonus = musicStreak * 10;
      const points = 100 + bonus;
      setMusicScore((prev) => prev + points);
      setMusicStreak((prev) => {
        const nextStreak = prev + 1;
        setMusicMaxStreak((max) => Math.max(max, nextStreak));
        return nextStreak;
      });
    } else {
      setMusicStreak(0);
    }

    if (currentMusicIndex < musicMatchQuestions.length - 1) {
      setCurrentMusicIndex((prev) => prev + 1);
    } else {
      setMusicPhase("finished");
    }
  };

  const handleExitMusicMatch = () => {
    if (
      musicPhase === "playing" &&
      !window.confirm("Thoát ván Quiz Âm Nhạc hiện tại?")
    ) {
      return;
    }
    setMusicPhase("home");
  };

  const isMatchActive =
    appMode === "hint100"
      ? ["randomizing", "playing", "timeout"].includes(phase)
      : musicPhase === "playing";

  const handleHeaderGoHome =
    appMode === "hint100"
      ? isMatchActive
        ? handleExitMatchHint
        : undefined
      : isMatchActive
      ? handleExitMusicMatch
      : undefined;

  return (
    <div className={`app-viewport mode-${appMode}`}>
      <Header
        mode={appMode}
        onSwitchMode={handleSwitchMode}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onGoHome={handleHeaderGoHome}
        isMatchActive={isMatchActive}
      />

      <main
        ref={mainRef}
        tabIndex={-1}
        className={`app-main ${
          (appMode === "hint100" && phase === "playing") ||
          (appMode === "musicQuiz" && musicPhase === "playing")
            ? "app-main--playing"
            : ""
        }`}
      >
        {/* ================= MODE: QUIZ ÂM NHẠC ================= */}
        {appMode === "musicQuiz" && (
          <>
            {musicPhase === "home" && (
              <MusicQuizHomeScreen
                packs={musicPacks}
                onStartQuiz={handleStartMusicQuiz}
              />
            )}

            {musicPhase === "playing" && musicMatchQuestions[currentMusicIndex] && (
              <MusicQuizPlayScreen
                key={musicMatchQuestions[currentMusicIndex].id}
                question={musicMatchQuestions[currentMusicIndex]}
                questionIndex={currentMusicIndex}
                totalQuestions={musicMatchQuestions.length}
                score={musicScore}
                streak={musicStreak}
                soundEnabled={soundEnabled}
                onAnswerQuestion={handleAnswerMusicQuestion}
                onExitQuiz={handleExitMusicMatch}
              />
            )}

            {musicPhase === "finished" && (
              <MusicQuizResultsScreen
                packTitle={activeMusicPackTitle}
                results={musicResults}
                score={musicScore}
                maxStreak={musicMaxStreak}
                onPlayAgain={() =>
                  handleStartMusicQuiz(activeMusicPackId)
                }

                onChangePack={() => setMusicPhase("home")}
                onGoHome={() => setMusicPhase("home")}
              />
            )}
          </>
        )}

        {/* ================= MODE: GỢI Ý 100 ================= */}
        {appMode === "hint100" && (
          <>
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
                onGoHome={handleGoHomeHint}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
