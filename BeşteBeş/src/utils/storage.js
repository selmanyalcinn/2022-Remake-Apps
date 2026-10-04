import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  STATS: "@wordle_game_stats",
  DAILY_STATE: "@wordle_daily_state",
  UNLIMITED_STATE: "@wordle_unlimited_state",
};

export const DEFAULT_STATS = {
  played: 0,
  won: 0,
  lost: 0,
  cups: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
};

const normalizeStats = (value) => ({
  played: Number.isFinite(value?.played) ? value.played : 0,
  won: Number.isFinite(value?.won) ? value.won : 0,
  lost: Number.isFinite(value?.lost) ? value.lost : Math.max(0, (value?.played || 0) - (value?.won || 0)),
  cups: Number.isFinite(value?.cups) ? value.cups : 0,
  currentStreak: Number.isFinite(value?.currentStreak) ? value.currentStreak : 0,
  maxStreak: Number.isFinite(value?.maxStreak) ? value.maxStreak : 0,
  guessDistribution: {
    ...DEFAULT_STATS.guessDistribution,
    ...(value?.guessDistribution || {}),
  },
});

let statsWriteQueue = /** @type {Promise<any>} */ (Promise.resolve());
const stateWriteQueues = new Map();

const queueStateWrite = (key, state) => {
  const current = stateWriteQueues.get(key) || Promise.resolve();
  const next = current
    .catch(() => {})
    .then(() => AsyncStorage.setItem(key, JSON.stringify(state)));
  stateWriteQueues.set(key, next);
  return next.finally(() => {
    if (stateWriteQueues.get(key) === next) stateWriteQueues.delete(key);
  });
};

// --- Stats Storage ---
export const getStats = async () => {
  try {
    const json = await AsyncStorage.getItem(KEYS.STATS);
    return normalizeStats(json ? JSON.parse(json) : DEFAULT_STATS);
  } catch (e) {
    console.error("Failed to load stats", e);
    return normalizeStats(DEFAULT_STATS);
  }
};

export const recordGameResult = async (won, attemptCount) => {
  statsWriteQueue = statsWriteQueue
    .catch(() => {})
    .then(async () => {
      try {
        const stats = await getStats();
        const currentStreak = won ? stats.currentStreak + 1 : 0;
        const guessDistribution = { ...stats.guessDistribution };

        if (won && attemptCount >= 1 && attemptCount <= 6) {
          guessDistribution[attemptCount] = (guessDistribution[attemptCount] || 0) + 1;
        }

        const updatedStats = normalizeStats({
          played: stats.played + 1,
          won: won ? stats.won + 1 : stats.won,
          lost: won ? stats.lost : stats.lost + 1,
          cups: stats.cups + (won ? 10 : -10),
          currentStreak,
          maxStreak: Math.max(stats.maxStreak, currentStreak),
          guessDistribution,
        });

        await AsyncStorage.setItem(KEYS.STATS, JSON.stringify(updatedStats));
        return updatedStats;
      } catch (e) {
        console.error("Failed to record game result", e);
        return null;
      }
    });

  return statsWriteQueue;
};

// --- Daily Game Storage ---
export const getDailyState = async (dateStr) => {
  try {
    const json = await AsyncStorage.getItem(`${KEYS.DAILY_STATE}_${dateStr}`);
    return json ? JSON.parse(json) : null;
  } catch (e) {
    console.error("Failed to get daily state", e);
    return null;
  }
};

export const saveDailyState = async (dateStr, state) => {
  try {
    await queueStateWrite(`${KEYS.DAILY_STATE}_${dateStr}`, state);
  } catch (e) {
    console.error("Failed to save daily state", e);
  }
};

// --- Unlimited Game Storage (Kaldığı yerden devam etme) ---
export const getUnlimitedState = async () => {
  try {
    const json = await AsyncStorage.getItem(KEYS.UNLIMITED_STATE);
    return json ? JSON.parse(json) : null;
  } catch (e) {
    console.error("Failed to get unlimited state", e);
    return null;
  }
};

export const saveUnlimitedState = async (state) => {
  try {
    await queueStateWrite(KEYS.UNLIMITED_STATE, state);
  } catch (e) {
    console.error("Failed to save unlimited state", e);
  }
};

export const clearUnlimitedState = async () => {
  try {
    await stateWriteQueues.get(KEYS.UNLIMITED_STATE)?.catch(() => {});
    await AsyncStorage.removeItem(KEYS.UNLIMITED_STATE);
  } catch (e) {
    console.error("Failed to clear unlimited state", e);
  }
};

export const clearAllGameData = async () => {
  try {
    await statsWriteQueue.catch(() => {});
    await Promise.all([...stateWriteQueues.values()].map((queue) => queue.catch(() => {})));
    const keys = await AsyncStorage.getAllKeys();
    const gameKeys = keys.filter(
      (key) =>
        key === KEYS.STATS ||
        key === KEYS.UNLIMITED_STATE ||
        key.startsWith(`${KEYS.DAILY_STATE}_`) ||
        key.startsWith("Mather_SavedGame_") ||
        key.startsWith("Mather_DailyChallenge_") ||
        key.startsWith("DailyCompleted_")
    );
    if (gameKeys.length > 0) await AsyncStorage.multiRemove(gameKeys);
    const remaining = await AsyncStorage.multiGet(gameKeys);
    return remaining.every(([, value]) => value === null);
  } catch (e) {
    console.error("Failed to clear game data", e);
    return false;
  }
};
