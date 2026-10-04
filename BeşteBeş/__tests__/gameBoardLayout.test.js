import { getGameBoardCellSize } from "../src/utils/gameBoardLayout.js";

describe("game board responsive sizing", () => {
  test("keeps the existing phone size cap", () => {
    expect(getGameBoardCellSize(430, 932)).toBe(60);
  });

  test("uses more space on a tablet in portrait", () => {
    expect(getGameBoardCellSize(768, 1024)).toBe(72);
  });

  test("leaves room for the keyboard below the board on a tablet in landscape", () => {
    expect(getGameBoardCellSize(1024, 768)).toBe(63);
  });
});
