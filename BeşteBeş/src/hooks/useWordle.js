import { useState, useCallback, useRef } from "react";
import { evaluateGuess, updateKeyStatuses, isValidGuess } from "../utils/gameLogic.js";
import { getRandomTargetWord } from "../utils/wordList.js";
import { recordGameResult } from "../utils/storage.js";
import { useFeedback } from "./useFeedback.js";

export const useWordle = (initialTargetWord = null, onGameComplete = null, onProgressChange = null) => {
  const [targetWord, setTargetWord] = useState(() => initialTargetWord || getRandomTargetWord());
  const [guesses, setGuesses] = useState(["", "", "", "", "", ""]);
  const [evaluations, setEvaluations] = useState([[], [], [], [], [], []]);
  const [currentRow, setCurrentRow] = useState(0);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameStatus, setGameStatus] = useState("playing"); // "playing" | "won" | "lost"
  const [keyStatuses, setKeyStatuses] = useState({});
  const [shakeTrigger, setShakeTrigger] = useState(0);
  const completionHandled = useRef(false);
  const submitLocked = useRef(false);
  const { tap, success, error } = useFeedback();

  // Kayıtlı oyunu yükleme (Hem günlük hem sınırsız mod)
  const loadSavedGame = useCallback((savedState, word) => {
    if (!savedState) return;
    if (word || savedState.targetWord) {
      setTargetWord(word || savedState.targetWord);
    }
    setGuesses(savedState.guesses || ["", "", "", "", "", ""]);
    setEvaluations(savedState.evaluations || [[], [], [], [], [], []]);
    setCurrentRow(savedState.currentRow || 0);
    setCurrentGuess(savedState.currentGuess || "");
    setGameStatus(savedState.gameStatus || "playing");
    setKeyStatuses(savedState.keyStatuses || {});
    completionHandled.current = Boolean(savedState.completed || savedState.gameStatus === "won" || savedState.gameStatus === "lost");
    submitLocked.current = false;
  }, []);

  const onKeyPress = useCallback(
    async (key) => {
      if (gameStatus !== "playing") return;

      const upperKey = key.toLocaleUpperCase("tr-TR");

      // Harf Silme
      if (upperKey === "DELETE" || upperKey === "BACKSPACE" || upperKey === "SİL") {
        tap();
        if (currentGuess.length > 0) {
          const nextGuess = currentGuess.slice(0, -1);
          setCurrentGuess(nextGuess);
          onProgressChange?.({ targetWord, guesses, evaluations, currentRow, currentGuess: nextGuess, gameStatus, keyStatuses });
        }
        return;
      }

      // Kelime Onaylama (ENTER)
      if (upperKey === "ENTER" || upperKey === "GİRİŞ") {
        if (submitLocked.current) return;
        submitLocked.current = true;
        if (currentGuess.length < 5) {
          setShakeTrigger((value) => value + 1);
          error();
          submitLocked.current = false;
          return;
        }

        if (!isValidGuess(currentGuess)) {
          setShakeTrigger((value) => value + 1);
          error();
          submitLocked.current = false;
          return;
        }

        // Tahmini değerlendir
        const evalResult = evaluateGuess(currentGuess, targetWord);
        
        // State güncellemeleri
        const newGuesses = [...guesses];
        newGuesses[currentRow] = currentGuess;
        setGuesses(newGuesses);

        const newEvaluations = [...evaluations];
        newEvaluations[currentRow] = evalResult;
        setEvaluations(newEvaluations);

        // Klavye durumlarını güncelle
        const updatedKeyStatuses = updateKeyStatuses(keyStatuses, currentGuess, evalResult);
        setKeyStatuses(updatedKeyStatuses);

        // 5 harf de doğruysa kazanıldı
        const isWin = evalResult.every((status) => status === "correct");
        const isLastRow = currentRow === 5;

        setCurrentGuess("");

        if (isWin && !completionHandled.current) {
          completionHandled.current = true;
          setGameStatus("won");
          success();
          await recordGameResult(true, currentRow + 1);
          if (onGameComplete) {
            await onGameComplete(true, currentRow + 1, targetWord, {
              targetWord,
              guesses: newGuesses,
              evaluations: newEvaluations,
              currentRow: currentRow + 1,
              gameStatus: "won",
              keyStatuses: updatedKeyStatuses,
              currentGuess: "",
            });
          }
        } else if (isLastRow && !completionHandled.current) {
          completionHandled.current = true;
          setGameStatus("lost");
          error();
          await recordGameResult(false, 6);
          if (onGameComplete) {
            await onGameComplete(false, 6, targetWord, {
              targetWord,
              guesses: newGuesses,
              evaluations: newEvaluations,
              currentRow: 6,
              gameStatus: "lost",
              keyStatuses: updatedKeyStatuses,
              currentGuess: "",
            });
          }
        } else {
          const nextRow = currentRow + 1;
          setCurrentRow(nextRow);
          // Oyun devam ederken de ilerlemeyi kaydet (kaldığı yerden devam edebilsin)
          if (onProgressChange) {
            onProgressChange({
              targetWord,
              guesses: newGuesses,
              evaluations: newEvaluations,
              currentRow: nextRow,
              gameStatus: "playing",
              keyStatuses: updatedKeyStatuses,
              currentGuess: "",
            });
          }
        }
        submitLocked.current = false;
        return;
      }

      // Normal Harf Girişi (Türkçe QWERTY)
      if (currentGuess.length < 5 && /^[A-ZÇĞİÖŞÜ]$/i.test(upperKey)) {
        tap();
        const nextGuess = currentGuess + upperKey;
        setCurrentGuess(nextGuess);
        onProgressChange?.({ targetWord, guesses, evaluations, currentRow, currentGuess: nextGuess, gameStatus, keyStatuses });
      }
    },
    [currentGuess, currentRow, gameStatus, guesses, evaluations, keyStatuses, targetWord, onGameComplete, onProgressChange, tap, success, error]
  );

  const resetGame = useCallback((newWord = null) => {
    const word = newWord || getRandomTargetWord();
    setTargetWord(word);
    setGuesses(["", "", "", "", "", ""]);
    setEvaluations([[], [], [], [], [], []]);
    setCurrentRow(0);
    setCurrentGuess("");
    setGameStatus("playing");
    setKeyStatuses({});
    setShakeTrigger(0);
    completionHandled.current = false;
    submitLocked.current = false;
  }, []);

  return {
    targetWord,
    guesses,
    evaluations,
    currentRow,
    currentGuess,
    gameStatus,
    keyStatuses,
    shakeTrigger,
    onKeyPress,
    resetGame,
    loadSavedGame,
  };
};
