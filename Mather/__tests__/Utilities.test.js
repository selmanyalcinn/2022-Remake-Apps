import { formatCountdown, getMillisecondsUntilNextLocalDay } from "../src/hooks/useDailyCountdown";
import { buildEmojiGrid, normalizeCellState } from "../src/utils/shareResult";

describe("daily utilities", () => {
  test("formats the time until local midnight", () => {
    const now = new Date(2026, 9, 2, 23, 59, 50);
    expect(getMillisecondsUntilNextLocalDay(now)).toBe(10_000);
    expect(formatCountdown(10_000)).toBe("00:00:10");
  });

  test("builds a private emoji-only share grid", () => {
    expect(normalizeCellState("#538D4E")).toBe("correct");
    expect(buildEmojiGrid([["correct", "present", "absent"]])).toBe("🟩🟨⬛");
  });
});
