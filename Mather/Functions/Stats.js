import AsyncStorage from "@react-native-async-storage/async-storage";

const STAT_KEYS = [
  "GamesPlayed",
  "GamesWon",
  "GamesLost",
  "Cups",
  "CurrentStreak",
  "MaxStreak",
  "GuessDistribution",
];

let statsWriteQueue = Promise.resolve();

function number(value) {
  return Number.parseInt(value || "0", 10) || 0;
}

export function recordGameResult(outcome, attempt = 1) {
  statsWriteQueue = statsWriteQueue
    .catch(() => {})
    .then(async () => {
      const stored = Object.fromEntries(await AsyncStorage.multiGet(STAT_KEYS));
      let distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
      try {
        distribution = { ...distribution, ...JSON.parse(stored.GuessDistribution || "{}") };
      } catch {
        // Invalid legacy data is replaced by the default distribution.
      }

      const games = number(stored.GamesPlayed) + 1;
      const wins = number(stored.GamesWon) + (outcome === "won" ? 1 : 0);
      const losses = number(stored.GamesLost) + (outcome === "lost" ? 1 : 0);
      const cups = number(stored.Cups) + (outcome === "won" ? 10 : -10);
      const currentStreak = outcome === "won" ? number(stored.CurrentStreak) + 1 : 0;
      const maxStreak = Math.max(number(stored.MaxStreak), currentStreak);

      if (outcome === "won") {
        const safeAttempt = Math.min(6, Math.max(1, attempt));
        distribution[safeAttempt] = (distribution[safeAttempt] || 0) + 1;
      }

      await AsyncStorage.multiSet([
        ["GamesPlayed", String(games)],
        ["GamesWon", String(wins)],
        ["GamesLost", String(losses)],
        ["Cups", String(cups)],
        ["CurrentStreak", String(currentStreak)],
        ["MaxStreak", String(maxStreak)],
        ["GuessDistribution", JSON.stringify(distribution)],
      ]);
    });

  return statsWriteQueue;
}

export async function clearGameData() {
  const keys = await AsyncStorage.getAllKeys();
  const targets = keys.filter(
    (key) =>
      STAT_KEYS.includes(key) ||
      key.startsWith("Mather_SavedGame_") ||
      key.startsWith("Mather_DailyChallenge_") ||
      key.startsWith("DailyCompleted_")
  );
  if (targets.length) await AsyncStorage.multiRemove(targets);
}
