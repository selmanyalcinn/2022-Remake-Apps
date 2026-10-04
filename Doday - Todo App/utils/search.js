const LEGACY_CATEGORY_MAP = {
  Tümü: "All",
  Genel: "General",
  İş: "Work",
  Kişisel: "Personal",
  Alışveriş: "Shopping",
  Eğitim: "Education",
};

/**
 * Text Normalization for Turkish & English diacritics / letter flexibility
 */
export const normalizeText = (text) => {
  if (!text) return "";
  return text
    .toLocaleLowerCase("tr-TR")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

/**
 * Word-Prefix Match and Relevance Scoring for Search
 * Strictly searches against task title words
 */
export const getSearchScore = (task, query) => {
  const cleanQuery = normalizeText(query);
  if (!cleanQuery) return 1;

  const cleanTitle = normalizeText(task.title);
  const queryWords = cleanQuery.split(/\s+/).filter(Boolean);
  const titleWords = cleanTitle.split(/[\s\-_.,/\\#+]+/).filter(Boolean);

  // Strict prefix check: Every query token must start a word in the title,
  // or the full title must start with the query.
  const isTitlePrefixMatch = cleanTitle.startsWith(cleanQuery);
  const allTokensPrefixMatch = queryWords.every((qWord) =>
    titleWords.some((w) => w.startsWith(qWord))
  );

  if (!isTitlePrefixMatch && !allTokensPrefixMatch) {
    return 0; // Exclude tasks where query is not at the start of any word in the title
  }

  let score = 10;

  // 1. Exact match with whole title
  if (cleanTitle === cleanQuery) {
    score += 1000;
  }
  // 2. Title starts with full query
  else if (cleanTitle.startsWith(cleanQuery)) {
    score += 600;
  }
  // 3. First word in title starts with full query
  else if (titleWords.length > 0 && titleWords[0].startsWith(cleanQuery)) {
    score += 400;
  }

  // Word-level token match bonuses
  queryWords.forEach((qWord) => {
    if (titleWords.some((w) => w.startsWith(qWord))) {
      score += 200;
    }
    if (titleWords.includes(qWord)) {
      score += 150;
    }
  });

  return score;
};
