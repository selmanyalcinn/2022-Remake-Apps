import React, { useEffect, useRef, useState } from "react";
import { Text, StyleSheet, Animated } from "react-native";
import { useTheme } from "../context/ThemeContext.js";

export const LetterCell = ({ letter = "", status = "empty", size = 56, revealDelay = 0 }) => {
  const { theme } = useTheme();
  const [scaleAnim] = useState(() => new Animated.Value(1));
  const [flipAnim] = useState(() => new Animated.Value(1));
  const previousStatus = useRef(status);

  // Harf yazıldığında tatmin edici hafif büyüme (pop-in) animasyonu
  useEffect(() => {
    if (letter && status === "typing") {
      scaleAnim.setValue(1);
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.12,
          duration: 70,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 70,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [letter, status, scaleAnim]);

  useEffect(() => {
    const isResult = ["correct", "present", "absent"].includes(status);
    const wasResult = ["correct", "present", "absent"].includes(previousStatus.current);
    if (isResult && !wasResult) {
      flipAnim.setValue(1);
      Animated.sequence([
        Animated.delay(revealDelay),
        Animated.timing(flipAnim, { toValue: 0.05, duration: 120, useNativeDriver: true }),
        Animated.spring(flipAnim, { toValue: 1, friction: 7, tension: 140, useNativeDriver: true }),
      ]).start();
    }
    previousStatus.current = status;
  }, [flipAnim, revealDelay, status]);

  let cellBg = theme.emptyCell;
  let cellBorder = theme.emptyCellBorder;
  let textColor = theme.cellText;

  if (status === "correct") {
    cellBg = theme.correct;
    cellBorder = theme.correct;
    textColor = "#FFFFFF";
  } else if (status === "present") {
    cellBg = theme.present;
    cellBorder = theme.present;
    textColor = "#FFFFFF";
  } else if (status === "absent") {
    cellBg = theme.absent;
    cellBorder = theme.absent;
    textColor = "#FFFFFF";
  } else if (letter) {
    cellBorder = theme.activeBorder; // Yazılan harf için koyu çerçeve
  }

  return (
    <Animated.View
      style={[
        styles.cell,
        {
          width: size,
          height: size,
          backgroundColor: cellBg,
          borderColor: cellBorder,
          transform: [{ scale: scaleAnim }, { scaleY: flipAnim }],
        },
      ]}
      accessible
      accessibilityLabel={`${letter || "Boş kutu"}${status !== "empty" && status !== "typing" ? `, ${status}` : ""}`}
    >
      <Text style={[styles.letter, { fontSize: size * 0.52, color: textColor }]}>
        {letter}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cell: {
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 2.5,
  },
  letter: {
    fontWeight: "800",
    textTransform: "uppercase",
  },
});
