module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  testMatch: ["**/__tests__/**/*.test.js"],
  collectCoverageFrom: [
    "Functions/Check.js",
    "Functions/Generate.js",
    "src/hooks/useDailyCountdown.js",
    "src/utils/shareResult.js"
  ],
};
