const mockStore = new Map();

jest.mock("@react-native-async-storage/async-storage", () => ({
  getAllKeys: jest.fn(async () => [...mockStore.keys()]),
  getItem: jest.fn(async (key) => mockStore.get(key) ?? null),
  multiGet: jest.fn(async (keys) => keys.map((key) => [key, mockStore.get(key) ?? null])),
  multiSet: jest.fn(async (entries) => entries.forEach(([key, value]) => mockStore.set(key, value))),
  multiRemove: jest.fn(async (keys) => keys.forEach((key) => mockStore.delete(key))),
}));

import { clearGameData, recordGameResult } from "../Functions/Stats";

describe("serialized statistics", () => {
  beforeEach(() => mockStore.clear());

  test("does not lose updates when results are recorded concurrently", async () => {
    await Promise.all([
      recordGameResult("won", 1),
      recordGameResult("won", 2),
      recordGameResult("lost"),
    ]);

    expect(mockStore.get("GamesPlayed")).toBe("3");
    expect(mockStore.get("GamesWon")).toBe("2");
    expect(mockStore.get("GamesLost")).toBe("1");
    expect(mockStore.get("Cups")).toBe("10");
    expect(JSON.parse(mockStore.get("GuessDistribution"))).toMatchObject({ 1: 1, 2: 1 });
  });

  test("clears games while preserving preferences", async () => {
    mockStore.set("GamesPlayed", "4");
    mockStore.set("Mather_DailyChallenge_2026-10-02", "saved");
    mockStore.set("Mather_Theme", "dark");
    await clearGameData();
    expect(mockStore.has("GamesPlayed")).toBe(false);
    expect(mockStore.has("Mather_DailyChallenge_2026-10-02")).toBe(false);
    expect(mockStore.get("Mather_Theme")).toBe("dark");
  });
});
