export const TABLET_MIN_DIMENSION = 600;

export const isTabletViewport = (width, height) =>
  Math.min(width, height) >= TABLET_MIN_DIMENSION;
