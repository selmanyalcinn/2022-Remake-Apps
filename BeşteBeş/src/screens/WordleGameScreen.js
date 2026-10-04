import React, { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { GameBoard } from "../components/GameBoard.js";
import { Header, HeaderIconButton } from "../components/Header.js";
import { HelpModal } from "../components/HelpModal.js";
import { Keyboard } from "../components/Keyboard.js";
import { StatModal } from "../components/StatModal.js";
import { useTheme } from "../context/ThemeContext.js";
import { usePreferences } from "../context/PreferencesContext.js";
import { useDailyCountdown } from "../hooks/useDailyCountdown.js";
import { useWordle } from "../hooks/useWordle.js";
import {
  clearUnlimitedState,
  getDailyState,
  getUnlimitedState,
  saveDailyState,
  saveUnlimitedState,
} from "../utils/storage.js";
import { getDailyWordForDate, getRandomTargetWord } from "../utils/wordList.js";

export const WordleGameScreen = ({ route, navigation }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { t } = usePreferences();
  const isFocused = useIsFocused();
  const mode = route?.params?.mode || "unlimited";
  const isDaily = mode === "daily";
  const { now } = useDailyCountdown();
  const dailyInfo = getDailyWordForDate(now);
  const [helpVisible, setHelpVisible] = useState(false);
  const [resultVisible, setResultVisible] = useState(false);
  const [dailyCompleted, setDailyCompleted] = useState(false);
  const [savedWon, setSavedWon] = useState(false);
  const [isLoadingGame, setIsLoadingGame] = useState(true);

  const handleGameComplete = useCallback(
    async (won, attemptCount, _target, fullState) => {
      setSavedWon(won);
      if (isDaily) {
        await saveDailyState(dailyInfo.dateStr, { completed: true, won, attemptCount, ...fullState });
        setDailyCompleted(true);
      } else {
        await saveUnlimitedState({ completed: true, won, attemptCount, ...fullState });
      }
      setResultVisible(true);
    },
    [dailyInfo.dateStr, isDaily]
  );

  const handleProgressChange = useCallback(
    (fullState) => {
      if (isDaily) {
        return saveDailyState(dailyInfo.dateStr, { completed: false, ...fullState });
      }
      return saveUnlimitedState({ completed: false, ...fullState });
    },
    [dailyInfo.dateStr, isDaily]
  );

  const {
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
  } = useWordle(isDaily ? dailyInfo.word : null, handleGameComplete, handleProgressChange);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setIsLoadingGame(true);
      setResultVisible(false);
      setHelpVisible(false);

      const load = async () => {
        try {
          if (isDaily) {
            const saved = await getDailyState(dailyInfo.dateStr);
            if (!active) return;
            if (saved) {
              loadSavedGame(saved, dailyInfo.word);
              setDailyCompleted(Boolean(saved.completed));
              setSavedWon(Boolean(saved.won));
              setResultVisible(Boolean(saved.completed));
            } else {
              setDailyCompleted(false);
              setSavedWon(false);
              resetGame(dailyInfo.word);
            }
            return;
          }

          const saved = await getUnlimitedState();
          if (!active) return;
          setDailyCompleted(false);
          setSavedWon(false);
          if (saved && !saved.completed) {
            loadSavedGame(saved, saved.targetWord);
          } else {
            await clearUnlimitedState();
            if (active) resetGame(getRandomTargetWord());
          }
        } catch {
          if (!active) return;
          setDailyCompleted(false);
          setSavedWon(false);
          resetGame(isDaily ? dailyInfo.word : getRandomTargetWord());
        } finally {
          if (active) setIsLoadingGame(false);
        }
      };

      load();
      return () => {
        active = false;
      };
    }, [dailyInfo.dateStr, dailyInfo.word, isDaily, loadSavedGame, resetGame])
  );

  const handleNewGame = async () => {
    setResultVisible(false);
    setSavedWon(false);
    await clearUnlimitedState();
    let nextWord = getRandomTargetWord();
    while (nextWord === targetWord) nextWord = getRandomTargetWord();
    resetGame(nextWord);
  };

  const handleGoHome = async () => {
    setResultVisible(false);
    setHelpVisible(false);
    if (!isDaily) await clearUnlimitedState();
    if (navigation.canGoBack()) {
      navigation.popTo("Home");
    } else {
      navigation.navigate("Home");
    }
  };

  const handleBack = () => {
    setResultVisible(false);
    setHelpVisible(false);
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate("Home");
  };

  const completedAttempts = evaluations.filter((row) => row?.length > 0).length;
  const isGameOver = gameStatus !== "playing" || dailyCompleted;
  const isWon = savedWon || gameStatus === "won";
  const headerActions = (
    <>
      <HeaderIconButton icon={isDark ? "sunny-outline" : "moon-outline"} label={t("darkTheme")} onPress={toggleTheme} />
      <HeaderIconButton icon="help-circle-outline" label={t("howToPlay")} onPress={() => setHelpVisible(true)} />
    </>
  );

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <Header
        title={t("appName")}
        subtitle={isDaily ? `${t("dailyChallenge").toUpperCase()} #${dailyInfo.dayNumber}` : t("appSubtitle")}
        onBackPress={handleBack}
        rightSlot={headerActions}
      />

      <View style={styles.gameArea}>
        <View style={styles.boardWrapper}>
          <GameBoard
            guesses={guesses}
            evaluations={evaluations}
            currentRow={currentRow}
            currentGuess={currentGuess}
            shakeTrigger={shakeTrigger}
          />
        </View>
        <Keyboard onKeyPress={onKeyPress} keyStatuses={keyStatuses} disabled={isGameOver || isLoadingGame} />
      </View>

      <HelpModal visible={helpVisible && isFocused} onClose={() => setHelpVisible(false)} />
      <StatModal
        visible={resultVisible && isFocused && isGameOver && !isLoadingGame}
        onNewGame={handleNewGame}
        onHomePress={handleGoHome}
        won={isWon}
        targetWord={targetWord}
        attemptCount={completedAttempts}
        evaluations={evaluations}
        dayNumber={dailyInfo.dayNumber}
        isDaily={isDaily}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  gameArea: { flex: 1, justifyContent: "space-between" },
  boardWrapper: { flex: 1, minHeight: 220, alignItems: "center", justifyContent: "center" },
});
