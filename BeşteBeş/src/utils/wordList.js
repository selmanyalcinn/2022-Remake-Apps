import {
  TARGET_WORDS,
  VALID_WORDS,
  VALID_WORDS_SET,
  WORD_DATA_INFO,
} from "../data/wordData.js";

export { TARGET_WORDS, VALID_WORDS, VALID_WORDS_SET, WORD_DATA_INFO };

export const DAILY_CHALLENGE_EPOCH = "2024-01-01";

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const [epochYear, epochMonth, epochDay] = DAILY_CHALLENGE_EPOCH.split("-").map(Number);
const DAILY_CHALLENGE_EPOCH_UTC = Date.UTC(epochYear, epochMonth - 1, epochDay);

const getCalendarDayNumber = (year, monthIndex, day) => {
  const selectedDay = Date.UTC(year, monthIndex, day);
  return Math.max(1, Math.floor((selectedDay - DAILY_CHALLENGE_EPOCH_UTC) / MILLISECONDS_PER_DAY) + 1);
};

const hashString = (value) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return hash >>> 0;
};

export const getRandomTargetWord = () => {
  const index = Math.floor(Math.random() * TARGET_WORDS.length);
  return TARGET_WORDS[index];
};

export const getDailyWordForDate = (date = new Date()) => {
  const year = date.getFullYear();
  const monthIndex = date.getMonth();
  const day = date.getDate();
  const month = String(monthIndex + 1).padStart(2, "0");
  const dayText = String(day).padStart(2, "0");
  const dateStr = `${year}-${month}-${dayText}`;
  const dayNumber = getCalendarDayNumber(year, monthIndex, day);

  // Kaynak sürümü hash'e katılır; aynı sözlük sürümündeki tüm cihazlar aynı kelimeyi görür.
  const index = hashString(`${dateStr}|${WORD_DATA_INFO.commit}`) % TARGET_WORDS.length;

  return {
    word: TARGET_WORDS[index],
    dateStr,
    dayNumber,
  };
};
