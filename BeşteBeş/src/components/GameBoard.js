import React, { useEffect, useState } from "react";
import { Animated, View, StyleSheet, useWindowDimensions } from "react-native";
import { LetterCell } from "./LetterCell.js";
import { spacing } from "../theme/spacing.js";
import { getGameBoardCellSize } from "../utils/gameBoardLayout.js";

const GameRow = ({
  rowIndex,
  evaluations,
  guesses,
  currentRow,
  currentGuess,
  translateX,
  cellSize,
}) => {
  const cols = [0, 1, 2, 3, 4];
  const rowEvals = evaluations[rowIndex] || [];
  const hasEvaluated = rowEvals.length > 0;
  const isCurrent = rowIndex === currentRow && !hasEvaluated;
  const guess = hasEvaluated ? guesses[rowIndex] || "" : isCurrent ? currentGuess : "";

  return (
    <Animated.View style={[styles.row, { transform: [{ translateX }] }]}>
      {cols.map((colIndex) => {
        const letter = guess[colIndex] || "";
        const status = hasEvaluated
          ? rowEvals[colIndex] || "absent"
          : isCurrent
          ? letter
            ? "typing"
            : "empty"
          : "empty";

        return (
          <LetterCell
            key={`cell-${rowIndex}-${colIndex}`}
            letter={letter}
            status={status}
            size={cellSize}
            revealDelay={colIndex * 70}
          />
        );
      })}
    </Animated.View>
  );
};

export const GameBoard = ({
  guesses = [],
  evaluations = [],
  currentRow = 0,
  currentGuess = "",
  shakeTrigger = 0,
}) => {
  const rows = [0, 1, 2, 3, 4, 5];
  const { width, height } = useWindowDimensions();
  const [shake] = useState(() => new Animated.Value(0));
  const cellSize = getGameBoardCellSize(width, height);

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

  return (
    <View style={styles.container}>
      {rows.map((rowIndex) => (
        <GameRow
          key={`row-${rowIndex}`}
          rowIndex={rowIndex}
          evaluations={evaluations}
          guesses={guesses}
          currentRow={currentRow}
          currentGuess={currentGuess}
          translateX={rowIndex === currentRow ? shake : 0}
          cellSize={cellSize}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    gap: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
