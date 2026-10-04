import AsyncStorage from "@react-native-async-storage/async-storage";
import { clearAllGameData, getStats } from "../src/utils/storage.js";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

beforeEach(async () => {
  await AsyncStorage.clear();
});

test("game reset removes progress and stats but keeps preferences", async () => {
  await AsyncStorage.multiSet([
    ["@wordle_game_stats", JSON.stringify({ played: 9, won: 6 })],
    ["@wordle_daily_state_2026-10-03", JSON.stringify({ completed: true })],
    ["@wordle_unlimited_state", JSON.stringify({ currentGuess: "KA" })],
    ["@beste_bes_theme_mode", "dark"],
    ["@beste_bes_language", "tr"],
  ]);

  await expect(clearAllGameData()).resolves.toBe(true);
  expect(await AsyncStorage.getItem("@wordle_game_stats")).toBeNull();
  expect(await AsyncStorage.getItem("@wordle_daily_state_2026-10-03")).toBeNull();
  expect(await AsyncStorage.getItem("@wordle_unlimited_state")).toBeNull();
  expect(await AsyncStorage.getItem("@beste_bes_theme_mode")).toBe("dark");
  expect(await AsyncStorage.getItem("@beste_bes_language")).toBe("tr");
  await expect(getStats()).resolves.toMatchObject({ played: 0, won: 0, cups: 0 });
});
