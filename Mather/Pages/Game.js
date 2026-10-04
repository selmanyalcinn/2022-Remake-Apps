import React, { useCallback, useEffect, useRef, useState } from "react";
import { Modal, Share, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Boxes from "../Components/Boxes";
import Modals from "../Components/Modals";
import Header from "../Components/Header";
import HelpModal from "../Components/HelpModal";
import { generate, generateDaily, getTodayDateString } from "../Functions/Generate";
import { check } from "../Functions/Check";
import { win } from "../Functions/Win";
import { lost } from "../Functions/Lost";
import { useTheme } from "../src/context/ThemeContext";
import { usePreferences } from "../src/context/PreferencesContext";
import { useDailyCountdown } from "../src/hooks/useDailyCountdown";
import { useFeedback } from "../src/hooks/useFeedback";
import { buildEmojiGrid, normalizeCellState } from "../src/utils/shareResult";
import { spacing, radius } from "../src/theme/index";

const ROWS = 6;
const COLS = 8;
const KEYS_ROWS = [
  ["1", "2", "3", "4", "5"],
  ["6", "7", "8", "9", "0"],
  ["+", "-", "*", "/", "="],
];
const KEY_MAP = {
  0: 0, 1: 1, 2: 2, 3: 3, 4: 4,
  5: 5, 6: 6, 7: 7, 8: 8, 9: 9,
  "+": 10, "-": 11, "*": 12, "/": 13, "=": 14,
};

function emptyRows() {
  return Array.from({ length: ROWS }, () => []);
}

function normalizeSavedRows(rows) {
  if (!Array.isArray(rows)) return emptyRows();
  return Array.from({ length: ROWS }, (_, index) =>
    Array.isArray(rows[index])
      ? rows[index].map((value) => normalizeCellState(value) || value)
      : []
  );
}

export default function Game({ isDaily = false }) {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { theme, toggleTheme, isDark } = useTheme();
  const { t } = usePreferences();
  const { haptic } = useFeedback();
  const countdown = useDailyCountdown(isDaily);
  const compact = height < 720 || width < 360;
  const keyHeight = compact ? 42 : Math.max(48, Math.min(58, Math.floor(width * 0.128)));

  const todayStr = getTodayDateString();
  const storageKey = isDaily ? `Mather_DailyChallenge_${todayStr}` : "Mather_SavedGame_Random";
  const submitLock = useRef(false);
  const writeQueue = useRef(Promise.resolve());

  const [operation, setOperation] = useState("");
  const [attemptCount, setAttemptCount] = useState(0);
  const [typedLetter, setTypedLetter] = useState(0);
  const [gameState, setGameState] = useState("playing");
  const [guesses, setGuesses] = useState(emptyRows);
  const [rowColors, setRowColors] = useState(emptyRows);
  const [cups, setCups] = useState("");
  const [modal, setModal] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const [keyHints, setKeyHints] = useState(Array(15).fill("default"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shakeTrigger, setShakeTrigger] = useState(0);
  const [revealTrigger, setRevealTrigger] = useState(0);

  const persistState = useCallback(
    (updates = {}) => {
      const snapshot = {
        operation,
        attemptCount,
        typedLetter,
        gameState,
        guesses,
        rowColors,
        cups,
        keyHints,
        ...updates,
      };
      writeQueue.current = writeQueue.current
        .catch(() => {})
        .then(() => AsyncStorage.setItem(storageKey, JSON.stringify(snapshot)));
      return writeQueue.current;
    },
    [attemptCount, cups, gameState, guesses, keyHints, operation, rowColors, storageKey, typedLetter]
  );

  const startFreshGame = useCallback(async () => {
    const newOperation = isDaily ? generateDaily(todayStr) : generate();
    const fresh = {
      operation: newOperation,
      attemptCount: 0,
      typedLetter: 0,
      gameState: "playing",
      guesses: emptyRows(),
      rowColors: emptyRows(),
      cups: "",
      keyHints: Array(15).fill("default"),
    };
    setOperation(fresh.operation);
    setAttemptCount(0);
    setTypedLetter(0);
    setGameState("playing");
    setGuesses(fresh.guesses);
    setRowColors(fresh.rowColors);
    setCups("");
    setModal(false);
    setKeyHints(fresh.keyHints);
    await AsyncStorage.setItem(storageKey, JSON.stringify(fresh));
  }, [isDaily, storageKey, todayStr]);

  useEffect(() => {
    let active = true;
    const loadGame = async () => {
      try {
        const savedText = await AsyncStorage.getItem(storageKey);
        const saved = savedText ? JSON.parse(savedText) : null;
        if (active && saved?.operation?.length === COLS) {
          setOperation(saved.operation);
          setAttemptCount(saved.attemptCount || 0);
          setTypedLetter(saved.typedLetter || 0);
          setGameState(saved.gameState || "playing");
          setGuesses(Array.isArray(saved.guesses) ? saved.guesses : emptyRows());
          setRowColors(normalizeSavedRows(saved.rowColors));
          setCups(saved.cups || "");
          setKeyHints(Array.isArray(saved.keyHints) ? saved.keyHints : Array(15).fill("default"));
          if (isDaily && ["won", "lost"].includes(saved.gameState)) setModal(true);
          if (saved.gameState === "playing" || isDaily) return;
        }
      } catch {
        // Corrupt saves are replaced with a clean game below.
      }
      if (active) await startFreshGame();
    };
    loadGame();
    return () => {
      active = false;
    };
  }, [isDaily, startFreshGame, storageKey]);

  const typeChar = (character) => {
    if (typedLetter >= COLS || gameState !== "playing" || submitLock.current) return;
    haptic("selection");
    const nextGuesses = guesses.map((row, index) =>
      index === attemptCount ? [...row, character] : row
    );
    const nextTyped = typedLetter + 1;
    setGuesses(nextGuesses);
    setTypedLetter(nextTyped);
    persistState({ guesses: nextGuesses, typedLetter: nextTyped });
  };

  const deleteChar = () => {
    if (typedLetter <= 0 || gameState !== "playing" || submitLock.current) return;
    haptic("selection");
    const nextGuesses = guesses.map((row, index) =>
      index === attemptCount ? row.slice(0, -1) : row
    );
    const nextTyped = typedLetter - 1;
    setGuesses(nextGuesses);
    setTypedLetter(nextTyped);
    persistState({ guesses: nextGuesses, typedLetter: nextTyped });
  };

  const calculateKeyHints = (greens, yellows, grays, currentHints) => {
    const next = [...currentHints];
    const priority = { green: 3, yellow: 2, gray: 1, default: 0 };
    const apply = (characters, status) => {
      characters.forEach((character) => {
        const index = KEY_MAP[character];
        if (index !== undefined && priority[status] > priority[next[index]]) next[index] = status;
      });
    };
    apply(greens, "green");
    apply(yellows, "yellow");
    apply(grays, "gray");
    return next;
  };

  const showInvalid = () => {
    setShakeTrigger((value) => value + 1);
    haptic("error");
  };

  const enterWord = async () => {
    if (submitLock.current || gameState !== "playing") return;
    submitLock.current = true;
    setIsSubmitting(true);

    try {
      if (typedLetter !== COLS) {
        showInvalid();
        return;
      }

      const currentGuess = guesses[attemptCount];
      const result = check(attemptCount, currentGuess, typedLetter, operation);
      if (result === "Invalid") {
        showInvalid();
        return;
      }

      const nextAttempt = attemptCount + 1;
      if (result === "GAME WON") {
        const completedRows = rowColors.map((row, index) =>
          index === attemptCount ? Array(COLS).fill("correct") : row
        );
        const nextHints = calculateKeyHints(currentGuess, [], [], keyHints);
        setRowColors(completedRows);
        setAttemptCount(nextAttempt);
        setTypedLetter(0);
        setCups("+10");
        setGameState("won");
        setKeyHints(nextHints);
        setRevealTrigger((value) => value + 1);
        haptic("success");
        await win(nextAttempt);
        await persistState({ rowColors: completedRows, attemptCount: nextAttempt, typedLetter: 0, gameState: "won", cups: "+10", keyHints: nextHints });
        if (isDaily) await AsyncStorage.setItem(`DailyCompleted_${todayStr}`, "true");
        setModal(true);
        return;
      }

      const states = result.slice(0, COLS);
      const greens = result[COLS] || [];
      const yellows = result[COLS + 1] || [];
      const grays = result[COLS + 2] || [];
      const completedRows = rowColors.map((row, index) => (index === attemptCount ? states : row));
      const nextHints = calculateKeyHints(greens, yellows, grays, keyHints);
      setRowColors(completedRows);
      setKeyHints(nextHints);
      setAttemptCount(nextAttempt);
      setTypedLetter(0);
      setRevealTrigger((value) => value + 1);

      if (nextAttempt === ROWS) {
        setGameState("lost");
        setCups("-10");
        haptic("warning");
        await lost();
        await persistState({ rowColors: completedRows, attemptCount: nextAttempt, typedLetter: 0, gameState: "lost", cups: "-10", keyHints: nextHints });
        if (isDaily) await AsyncStorage.setItem(`DailyCompleted_${todayStr}`, "true");
        setModal(true);
      } else {
        haptic("selection");
        await persistState({ rowColors: completedRows, attemptCount: nextAttempt, typedLetter: 0, keyHints: nextHints });
      }
    } finally {
      submitLock.current = false;
      setIsSubmitting(false);
    }
  };

  const shareDailyResult = async () => {
    const score = gameState === "won" ? attemptCount : ROWS;
    const message = t("shareMessage", {
      date: todayStr,
      score,
      grid: buildEmojiGrid(rowColors),
    });
    haptic("selection");
    try {
      await Share.share({ title: t("shareTitle"), message });
    } catch {
      // Dismissing the native share sheet is not an error for the game flow.
    }
  };

  const goHome = useCallback(async () => {
    // Native modals are rendered above the navigator. Hide them before changing
    // routes so a result dialog can never remain on top of the Home screen.
    setModal(false);
    setHelpVisible(false);
    if (!isDaily) await AsyncStorage.removeItem(storageKey);
    navigation.navigate("Home");
  }, [isDaily, navigation, storageKey]);

  const keyBackground = (character) => {
    const hint = keyHints[KEY_MAP[character]] || "default";
    if (hint === "green") return theme.correct;
    if (hint === "yellow") return theme.present;
    if (hint === "gray") return theme.absent;
    return theme.keyDefault;
  };
  const keyTextColor = (character) =>
    (keyHints[KEY_MAP[character]] || "default") === "default" ? theme.keyText : "#FFFFFF";

  const headerActions = (
    <>
      <HeaderButton icon={isDark ? "sunny-outline" : "moon-outline"} label={t("darkTheme")} onPress={toggleTheme} theme={theme} />
      <HeaderButton icon="help-circle-outline" label={t("howToPlay")} onPress={() => setHelpVisible(true)} theme={theme} />
    </>
  );

  return (
    <View style={[styles.main, { backgroundColor: theme.background }]}>
      <Header title={t("appName")} subtitle={isDaily ? t("dailyChallenge").toUpperCase() : t("appSubtitle")} theme={theme} rightSlot={headerActions} />

      <Modal animationType="fade" transparent visible={modal && isFocused} onRequestClose={goHome}>
        <View style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay, paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.md }]}>
          <Modals
            cups={cups}
            rowColors={rowColors}
            answer={operation}
            isDaily={isDaily}
            countdown={countdown}
            onShare={shareDailyResult}
            onGoHome={goHome}
            onPlayAgain={async () => {
              setModal(false);
              await startFreshGame();
            }}
            theme={theme}
          />
        </View>
      </Modal>

      <HelpModal visible={helpVisible} onClose={() => setHelpVisible(false)} theme={theme} />

      <View style={styles.gridContainer}>
        <Boxes guesses={guesses} rowColors={rowColors} theme={theme} compact={compact} shakeTrigger={shakeTrigger} revealTrigger={revealTrigger} activeRow={attemptCount} />
      </View>

      <View style={[styles.keyboard, { backgroundColor: theme.background, paddingBottom: Math.max(insets.bottom, spacing.sm) + spacing.sm }]}>
        {KEYS_ROWS.map((row) => (
          <View key={row.join("")} style={styles.keyRow}>
            {row.map((key) => (
              <TouchableOpacity key={key} onPress={() => typeChar(key)} disabled={isSubmitting} activeOpacity={0.68} style={styles.keyWrapper} accessibilityRole="button" accessibilityLabel={key}>
                <View style={[styles.key, { height: keyHeight, backgroundColor: keyBackground(key), borderColor: theme.keyBorder }]}>
                  <Text style={[styles.keyText, { color: keyTextColor(key), fontSize: compact ? 21 : 24 }]}>{key}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
        <View style={styles.actionRow}>
          <ActionButton icon="backspace-outline" label={t("delete")} onPress={deleteChar} disabled={isSubmitting} height={keyHeight} theme={theme} />
          <ActionButton icon="return-down-back-outline" label={t("enter")} onPress={enterWord} disabled={isSubmitting} height={keyHeight} theme={theme} />
        </View>
      </View>
    </View>
  );
}

function HeaderButton({ icon, label, onPress, theme }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.iconBtn, { backgroundColor: theme.surfaceLight }]} accessibilityRole="button" accessibilityLabel={label}>
      <Ionicons name={icon} size={20} color={theme.textPrimary} />
    </TouchableOpacity>
  );
}

function ActionButton({ icon, label, onPress, disabled, height, theme }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.68} style={[styles.actionBtn, { height, opacity: disabled ? 0.55 : 1, backgroundColor: theme.keyDefault, borderColor: theme.keyBorder }]} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }}>
      <Ionicons name={icon} size={23} color={theme.keyText} />
      <Text style={[styles.actionText, { color: theme.keyText }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1 },
  gridContainer: { flex: 1, minHeight: 220, justifyContent: "center", alignItems: "center", position: "relative" },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  modalOverlay: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.lg },
  keyboard: { width: "100%", maxWidth: 620, alignSelf: "center", paddingHorizontal: spacing.md, paddingTop: spacing.xs },
  keyRow: { flexDirection: "row", justifyContent: "center", marginBottom: spacing.xs, gap: 6 },
  keyWrapper: { flex: 1, maxWidth: 112 },
  key: { borderRadius: radius.sm, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  keyText: { fontWeight: "800" },
  actionRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, borderRadius: radius.sm, borderWidth: 1 },
  actionText: { fontSize: 15, fontWeight: "800", letterSpacing: 0.4 },
});
