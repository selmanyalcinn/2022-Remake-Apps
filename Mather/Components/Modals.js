import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { radius, spacing } from "../src/theme/index";
import { normalizeCellState } from "../src/utils/shareResult";
import { usePreferences } from "../src/context/PreferencesContext";

const COLS = 8;

export default function Modals({ answer, cups, rowColors = [], onPlayAgain, onGoHome, onShare, isDaily, countdown, theme }) {
  const { width, height } = useWindowDimensions();
  const { t } = usePreferences();
  const compact = height < 700;
  const availableGridWidth = Math.min(width - 80, 360);
  const cell = Math.max(18, Math.min(32, Math.floor(availableGridWidth / COLS) - 4));
  const cellColor = (value) => {
    const state = normalizeCellState(value);
    if (state === "correct") return theme.correct;
    if (state === "present") return theme.present;
    if (state === "absent") return theme.absent;
    return theme.emptyCell;
  };

  return (
    <View style={[styles.container, compact && styles.compact, { backgroundColor: theme.modalBg, borderColor: theme.surfaceBorder, maxWidth: Math.min(width - 32, 520) }]}>
      <Text style={[styles.answerLabel, { color: theme.textSecondary }]}>{t("correctEquation")}</Text>
      <Text style={[styles.answerText, compact && styles.answerTextCompact, { color: theme.textPrimary }]}>{answer}</Text>
      <Text style={[styles.cupsText, { color: cups?.startsWith("-") ? theme.present : theme.correct }]}>{cups} {t("cups")}</Text>

      <View style={[styles.grid, compact && styles.gridCompact]}>
        {Array.from({ length: 6 }).map((_, rowIndex) => (
          <View key={rowIndex} style={styles.gridRow}>
            {Array.from({ length: COLS }).map((__, colIndex) => (
              <View key={colIndex} style={[styles.miniCell, { width: cell, height: cell, backgroundColor: cellColor(rowColors[rowIndex]?.[colIndex]), borderColor: theme.emptyCellBorder }]} />
            ))}
          </View>
        ))}
      </View>

      {isDaily ? (
        <>
          <Text style={[styles.countdown, { color: theme.textSecondary }]}>{t("nextPuzzle", { time: countdown })}</Text>
          <TouchableOpacity style={[styles.shareBtn, { backgroundColor: theme.correct }]} onPress={onShare} accessibilityRole="button">
            <Ionicons name="share-social-outline" size={20} color="#FFFFFF" />
            <Text style={styles.shareText}>{t("share")}</Text>
          </TouchableOpacity>
        </>
      ) : null}

      <View style={styles.buttons}>
        <ResultButton icon="home-outline" label={t("home")} onPress={onGoHome} theme={theme} />
        {!isDaily ? <ResultButton icon="refresh-outline" label={t("playAgain")} onPress={onPlayAgain} theme={theme} /> : null}
      </View>
    </View>
  );
}

function ResultButton({ icon, label, onPress, theme }) {
  return (
    <TouchableOpacity style={[styles.btn, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      <Ionicons name={icon} size={20} color={theme.textPrimary} />
      <Text style={[styles.btnText, { color: theme.textPrimary }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", borderRadius: radius.xl, paddingHorizontal: spacing.xxl, paddingVertical: spacing.xxl, alignItems: "center", borderWidth: 1, elevation: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  compact: { paddingVertical: spacing.lg },
  answerLabel: { fontSize: 12, fontWeight: "800", letterSpacing: 1.1 },
  answerText: { fontSize: 28, fontWeight: "900", marginTop: 5, letterSpacing: 1.5 },
  answerTextCompact: { fontSize: 23 },
  cupsText: { fontSize: 18, fontWeight: "900", marginVertical: spacing.sm },
  grid: { marginVertical: spacing.md },
  gridCompact: { marginVertical: spacing.sm },
  gridRow: { flexDirection: "row", marginVertical: 2 },
  miniCell: { borderRadius: 4, borderWidth: 1, marginHorizontal: 2 },
  countdown: { fontSize: 12, fontWeight: "700", fontVariant: ["tabular-nums"], marginBottom: spacing.md },
  shareBtn: { width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, paddingVertical: spacing.md, borderRadius: radius.md, marginBottom: spacing.md },
  shareText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  buttons: { flexDirection: "row", gap: spacing.md, width: "100%" },
  btn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, paddingVertical: spacing.md + 1, borderRadius: radius.md, borderWidth: 1.5 },
  btnText: { fontSize: 14, fontWeight: "800" },
});
