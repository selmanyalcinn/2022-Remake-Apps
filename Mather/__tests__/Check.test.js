import { check, evaluateSide, isValidEquation } from "../Functions/Check";

describe("equation validation and scoring", () => {
  test("evaluates standard operation precedence", () => {
    expect(evaluateSide("2+3*4")).toBe(14);
  });

  test("rejects invalid equations", () => {
    expect(isValidEquation("05+03=08")).toBe(false);
    expect(isValidEquation("12/0=000")).toBe(false);
    expect(check(0, "12+3=014".split(""), 8, "12+34=46")).toBe("Invalid");
  });

  test("returns semantic cell states rather than theme colors", () => {
    const result = check(0, "12+21=33".split(""), 8, "11+22=33");
    expect(result.slice(0, 8)).toEqual([
      "correct",
      "present",
      "correct",
      "correct",
      "present",
      "correct",
      "correct",
      "correct",
    ]);
  });
});
