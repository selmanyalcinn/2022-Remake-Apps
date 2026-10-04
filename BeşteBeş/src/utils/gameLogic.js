import { VALID_WORDS_SET } from "./wordList.js";

/**
 * Wordle harf değerlendirme fonksiyonu (Çift harfleri ve Türkçe karakterleri kusursuz işler)
 * @param {string} guess - Kullanıcının 5 harfli tahmini
 * @param {string} target - Hedef 5 harfli kelime
 * @returns {Array<'correct' | 'present' | 'absent'>} Her harfin durumu
 */
export const evaluateGuess = (guess, target) => {
  const g = guess.toLocaleUpperCase("tr-TR");
  const t = target.toLocaleUpperCase("tr-TR");
  
  const result = new Array(5).fill("absent");
  const targetLetterCounts = {};

  // 1. Hedef kelimedeki harf sayılarını hesapla
  for (let i = 0; i < 5; i++) {
    const char = t[i];
    targetLetterCounts[char] = (targetLetterCounts[char] || 0) + 1;
  }

  // 2. Birinci tur: Doğru yerdeki (yeşil) harfleri bul
  for (let i = 0; i < 5; i++) {
    if (g[i] === t[i]) {
      result[i] = "correct";
      targetLetterCounts[g[i]] -= 1;
    }
  }

  // 3. İkinci tur: Yanlış yerdeki (sarı) harfleri bul
  for (let i = 0; i < 5; i++) {
    if (result[i] !== "correct") {
      const char = g[i];
      if (targetLetterCounts[char] && targetLetterCounts[char] > 0) {
        result[i] = "present";
        targetLetterCounts[char] -= 1;
      }
    }
  }

  return result;
};

export const isValidGuess = (word) => {
  if (!word || word.length !== 5) return false;
  const upper = word.toLocaleUpperCase("tr-TR");
  return VALID_WORDS_SET.has(upper);
};

/**
 * Klavyedeki harf durum önceliği: correct > present > absent > default
 */
export const updateKeyStatuses = (currentKeyStatuses, guess, evaluation) => {
  const updated = { ...currentKeyStatuses };
  for (let i = 0; i < guess.length; i++) {
    const letter = guess[i];
    const status = evaluation[i];
    const existing = updated[letter];

    if (status === "correct") {
      updated[letter] = "correct";
    } else if (status === "present" && existing !== "correct") {
      updated[letter] = "present";
    } else if (status === "absent" && !existing) {
      updated[letter] = "absent";
    }
  }
  return updated;
};
