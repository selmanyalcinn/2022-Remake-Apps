import { evaluateGuess, isValidGuess, updateKeyStatuses } from "../src/utils/gameLogic.js";
import {
  getDailyWordForDate,
  TARGET_WORDS,
  VALID_WORDS_SET,
  WORD_DATA_INFO,
} from "../src/utils/wordList.js";
import { formatCountdown } from "../src/hooks/useDailyCountdown.js";

describe("word scoring", () => {
  test("scores duplicate Turkish letters without over-counting", () => {
    expect(evaluateGuess("ALELE", "ELMAS")).toEqual([
      "present",
      "correct",
      "present",
      "absent",
      "absent",
    ]);
  });

  test("never downgrades a keyboard key from correct", () => {
    const statuses = updateKeyStatuses({ A: "correct" }, "ALAKA", [
      "absent",
      "present",
      "absent",
      "correct",
      "absent",
    ]);
    expect(statuses.A).toBe("correct");
    expect(statuses.L).toBe("present");
    expect(statuses.K).toBe("correct");
  });
});

describe("daily puzzle", () => {
  test("numbers challenges from January 1, 2024", () => {
    expect(getDailyWordForDate(new Date(2024, 0, 1)).dayNumber).toBe(1);
    expect(getDailyWordForDate(new Date(2024, 0, 2)).dayNumber).toBe(2);
  });

  test("is deterministic for the same local calendar day", () => {
    const date = new Date(2026, 9, 3, 18, 30);
    expect(getDailyWordForDate(date)).toEqual(getDailyWordForDate(new Date(2026, 9, 3, 1, 5)));
  });
});

describe("offline dictionary", () => {
  test("uses the filtered Güncel Türkçe Sözlük data", () => {
    expect(WORD_DATA_INFO.validWordCount).toBeGreaterThan(5000);
    expect(WORD_DATA_INFO.targetWordCount).toBeGreaterThan(4000);
    expect(TARGET_WORDS.every((word) => VALID_WORDS_SET.has(word))).toBe(true);
  });

  test("accepts Turkish headwords and excludes proper names", () => {
    expect(isValidGuess("KAĞIT")).toBe(true);
    expect(isValidGuess("AHMET")).toBe(false);
  });
});

describe("countdown", () => {
  test("formats hours, minutes and seconds", () => {
    expect(formatCountdown((5 * 3600 + 7 * 60 + 9) * 1000)).toBe("05:07:09");
  });
});
