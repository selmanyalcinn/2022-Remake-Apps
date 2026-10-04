import { generate, generateDaily, getTodayDateString } from "../Functions/Generate";
import { isValidEquation } from "../Functions/Check";

describe("equation generation", () => {
  test("creates valid 8-character equations", () => {
    for (let index = 0; index < 5000; index += 1) {
      const equation = generate();
      expect(equation).toHaveLength(8);
      expect(isValidEquation(equation)).toBe(true);
    }
  });

  test("daily equation is deterministic", () => {
    const date = "2026-10-02";
    expect(generateDaily(date)).toBe(generateDaily(date));
  });

  test("daily date uses the device-local calendar date", () => {
    const localDate = new Date(2026, 9, 2, 23, 59, 59);
    expect(getTodayDateString(localDate)).toBe("2026-10-02");
  });
});
