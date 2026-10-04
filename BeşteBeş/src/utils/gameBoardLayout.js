import { isTabletViewport } from "./responsiveLayout.js";

export const getGameBoardCellSize = (width, height) => {
  const isTablet = isTabletViewport(width, height);
  const maxBoardWidth = isTablet ? 700 : 620;
  const maxCellSize = isTablet ? 72 : 60;
  const widthSize = Math.floor((Math.min(width, maxBoardWidth) - 52) / 5);
  const boardHeight = Math.max(286, height - (height < 700 ? 320 : 350));
  const heightSize = Math.floor((boardHeight - 36) / 6);

  return Math.max(42, Math.min(widthSize, heightSize, maxCellSize));
};
