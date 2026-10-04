import React, { useEffect, useMemo, useState } from "react";
import { Animated, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { normalizeCellState } from "../src/utils/shareResult";

const ROWS = 6;
const COLS = 8;
const CELL_GAP = 3;

export default function Boxes({ guesses = [], rowColors = [], theme, shakeTrigger = 0, revealTrigger = 0, activeRow = 0, compact = false }) {
  const { width, height } = useWindowDimensions();
  const [shake] = useState(() => new Animated.Value(0));
  const [reveal] = useState(() => new Animated.Value(1));
  const isTablet = width >= 600;
  const isPortrait = height >= width;
  const isPortraitTablet = isTablet && isPortrait;
  const isPortraitPhone = !isTablet && isPortrait;
  const cellGap = isPortraitPhone ? 2 : CELL_GAP;

  const cellWidth = useMemo(() => {
    const horizontalPadding = isPortraitTablet ? 28 : isPortraitPhone ? 4 : isTablet ? 36 : compact ? 20 : 28;
    const maxGridWidth = isPortraitTablet ? 640 : isTablet ? 600 : 520;
    const maxCellWidth = isPortraitTablet ? 62 : isTablet ? 56 : isPortraitPhone ? 54 : compact ? 43 : 50;
    const available = Math.min(width, maxGridWidth) - horizontalPadding - cellGap * (COLS - 1);
    return Math.max(31, Math.min(maxCellWidth, Math.floor(available / COLS)));
  }, [cellGap, compact, isPortraitPhone, isPortraitTablet, isTablet, width]);
  const cellHeightRatio = isPortraitTablet ? 1.12 : isPortraitPhone ? (compact ? 1.1 : 1.16) : compact ? 1.02 : isTablet ? 1.08 : 1.12;
  const cellHeight = Math.floor(cellWidth * cellHeightRatio);

  useEffect(() => {
    if (!shakeTrigger) return;
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: -8, duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 8, duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -5, duration: 45, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 5, duration: 45, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 45, useNativeDriver: true }),
    ]).start();
  }, [shake, shakeTrigger]);

  useEffect(() => {
    if (!revealTrigger) return;
    reveal.setValue(0.94);
    Animated.spring(reveal, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }).start();
  }, [reveal, revealTrigger]);

  const colorForState = (value) => {
    const state = normalizeCellState(value);
    if (state === "correct") return theme.correct;
    if (state === "present") return theme.present;
    if (state === "absent") return theme.absent;
    return theme.emptyCell;
  };

  return (
    <View style={styles.container} accessibilityLabel="Guess grid">
      {Array.from({ length: ROWS }).map((_, rowIndex) => {
        const hasResult = rowColors[rowIndex]?.length > 0;
        const rowTransform = [];
        if (rowIndex === activeRow) rowTransform.push({ translateX: shake });
        const isRevealing = hasResult && rowIndex === activeRow - 1;

        return (
          <Animated.View key={rowIndex} style={[styles.row, { gap: cellGap, transform: rowTransform, opacity: isRevealing ? reveal : 1 }]}>
            {Array.from({ length: COLS }).map((__, colIndex) => {
              const state = normalizeCellState(rowColors[rowIndex]?.[colIndex]);
              const value = guesses[rowIndex]?.[colIndex] ?? "";
              return (
                <View
                  key={colIndex}
                  accessible
                  accessibilityLabel={`Row ${rowIndex + 1}, column ${colIndex + 1}${value ? `, ${value}` : ""}${state ? `, ${state}` : ""}`}
                  style={[styles.cell, { width: cellWidth, height: cellHeight, backgroundColor: colorForState(rowColors[rowIndex]?.[colIndex]), borderColor: state ? "transparent" : theme.emptyCellBorder }]}
                >
                  <Text style={[styles.cellText, { color: state ? theme.cellTextRevealed : theme.cellText, fontSize: isPortraitTablet ? 28 : isTablet ? 26 : isPortraitPhone ? (compact ? 22 : 25) : compact ? 21 : 24 }]}>
                    {value}
                  </Text>
                </View>
              );
            })}
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: "center", alignItems: "center", paddingVertical: 2 },
  row: { flexDirection: "row", marginVertical: 2 },
  cell: { borderRadius: 6, borderWidth: 2, justifyContent: "center", alignItems: "center" },
  cellText: { fontWeight: "900" },
});
