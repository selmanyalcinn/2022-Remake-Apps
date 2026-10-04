import { isTabletViewport } from "../src/utils/responsiveLayout.js";

describe("responsive layout breakpoints", () => {
  test("keeps phones in the single-column layout", () => {
    expect(isTabletViewport(430, 932)).toBe(false);
  });

  test("recognizes portrait tablets", () => {
    expect(isTabletViewport(768, 1024)).toBe(true);
  });

  test("recognizes landscape tablets without changing the stacking direction", () => {
    expect(isTabletViewport(1024, 768)).toBe(true);
  });
});
