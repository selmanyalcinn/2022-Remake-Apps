import React from "react";
import { Modal, Share, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext.js";
import { usePreferences } from "../context/PreferencesContext.js";
import { useDailyCountdown } from "../hooks/useDailyCountdown.js";
import { useFeedback } from "../hooks/useFeedback.js";
import { radius, spacing } from "../theme/spacing.js";

const EMOJI = { correct: "🟩", present: "🟨", absent: "⬛" };

export const generateShareText = ({ evaluations = [], won = false, attemptCount = 0, dayNumber = "", isDaily = false, t }) => {
  const rows = evaluations
    .filter((row) => Array.isArray(row) && row.length > 0)
    .map((row) => row.map((state) => EMOJI[state] || "⬜").join(""))
    .join("\n");
  const score = won ? attemptCount : "X";
  return t(isDaily ? "shareDailyMessage" : "shareUnlimitedMessage", {
    day: dayNumber,
    score,
    grid: rows,
  });
};

export const StatModal = ({
  visible,
  onNewGame,
  onHomePress,
  won,
  targetWord,
  attemptCount,
  evaluations = [],
  dayNumber,
  isDaily,
}) => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t } = usePreferences();
  const { timeRemaining } = useDailyCountdown();
  const { tap } = useFeedback();
  const compact = height < 700;
  const cell = Math.max(24, Math.min(38, Math.floor((Math.min(width - 80, 300) - 24) / 5)));

  const handleShare = async () => {
    tap();
    const message = generateShareText({ evaluations, won, attemptCount, dayNumber, isDaily, t });
    try {
      await Share.share({ title: t("shareTitle"), message });
    } catch {
      // Closing the native share sheet should not interrupt the game flow.
    }
  };

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onHomePress} statusBarTranslucent>
      <View
        style={[
          styles.overlay,
          {
            backgroundColor: theme.modalOverlay,
            paddingTop: insets.top + spacing.md,
            paddingBottom: insets.bottom + spacing.md,
          },
        ]}
      >
        <View
          accessibilityViewIsModal
          style={[
            styles.card,
            compact && styles.compactCard,
            {
              backgroundColor: theme.modalBg,
              borderColor: theme.surfaceBorder,
              maxWidth: Math.min(width - 32, 520),
            },
          ]}
        >
          <Text style={[styles.resultTitle, { color: theme.textSecondary }]}>
            {t(isDaily ? "dailyResult" : "gameResult")}
          </Text>
          <Text style={[styles.answerLabel, { color: theme.textSecondary }]}>{t("correctWordLabel")}</Text>
          <Text style={[styles.answer, { color: won ? theme.correct : theme.textPrimary }]}>{targetWord}</Text>
          <Text style={[styles.cups, { color: won ? theme.correct : theme.present }]}>{won ? "+10" : "-10"} {t("cups")}</Text>

          <View style={styles.grid}>
            {Array.from({ length: 6 }).map((_, rowIndex) => (
              <View key={rowIndex} style={styles.gridRow}>
                {Array.from({ length: 5 }).map((__, colIndex) => {
                  const state = evaluations[rowIndex]?.[colIndex];
                  const color = state === "correct" ? theme.correct : state === "present" ? theme.present : state === "absent" ? theme.absent : theme.emptyCell;
                  return <View key={colIndex} style={[styles.miniCell, { width: cell, height: cell, backgroundColor: color, borderColor: theme.emptyCellBorder }]} />;
                })}
              </View>
            ))}
          </View>

          {isDaily ? (
            <>
              <Text style={[styles.countdown, { color: theme.textSecondary }]}>{t("nextPuzzle", { time: timeRemaining })}</Text>
              <TouchableOpacity style={[styles.shareButton, { backgroundColor: theme.correct }]} onPress={handleShare} accessibilityRole="button">
                <Ionicons name="share-social-outline" size={20} color="#FFFFFF" />
                <Text style={styles.shareText}>{t("share")}</Text>
              </TouchableOpacity>
            </>
          ) : null}

          <View style={styles.buttons}>
            <ResultButton icon="home-outline" label={t("home")} onPress={onHomePress} theme={theme} />
            {!isDaily ? <ResultButton icon="refresh-outline" label={t("playAgain")} onPress={onNewGame} theme={theme} /> : null}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const ResultButton = ({ icon, label, onPress, theme }) => (
  <TouchableOpacity
    style={[styles.resultButton, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
  >
    <Ionicons name={icon} size={20} color={theme.textPrimary} />
    <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.resultButtonText, { color: theme.textPrimary }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.lg },
  card: { width: "100%", borderRadius: radius.xl, paddingHorizontal: spacing.xxl, paddingVertical: spacing.xxl, alignItems: "center", borderWidth: 1, elevation: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.22, shadowRadius: 10 },
  compactCard: { paddingVertical: spacing.lg },
  resultTitle: { fontSize: 14, fontWeight: "900", letterSpacing: 1.2, marginBottom: spacing.lg },
  answerLabel: { fontSize: 13, fontWeight: "800", letterSpacing: 1.1 },
  answer: { fontSize: 29, fontWeight: "900", marginTop: 4, letterSpacing: 3 },
  cups: { fontSize: 16, fontWeight: "900", marginVertical: spacing.sm },
  grid: { marginVertical: spacing.md },
  gridRow: { flexDirection: "row", marginVertical: 2 },
  miniCell: { borderRadius: 4, borderWidth: 1, marginHorizontal: 2 },
  countdown: { fontSize: 14, fontWeight: "700", fontVariant: ["tabular-nums"], marginBottom: spacing.md },
  shareButton: { width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, paddingVertical: spacing.md, borderRadius: radius.md, marginBottom: spacing.md },
  shareText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  buttons: { flexDirection: "row", gap: spacing.sm, width: "100%" },
  resultButton: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs, paddingVertical: spacing.md + 1, paddingHorizontal: spacing.xs, borderRadius: radius.md, borderWidth: 1.5 },
  resultButtonText: { fontSize: 13, fontWeight: "800" },
});
