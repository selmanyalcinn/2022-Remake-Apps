import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const SOURCE_REPOSITORY = "https://github.com/ogun/guncel-turkce-sozluk";
const SOURCE_COMMIT = "a6f953b22a60a072853833f4769d27b2ba93160b";
const SOURCE_EDITION = "Güncel Türkçe Sözlük, 12. baskı";

const unsuitableTargetLabels = new Set([
  "eskimiş",
  "ağızlardan",
  "argo",
  "teklifsiz konuşmada",
  "kaba konuşmada",
  "hakaret yollu",
  "alay yollu",
  "halk ağzında",
  "şaka yollu",
]);

const inputPath = process.argv[2];
const outputPath = process.argv[3] || path.resolve("src/data/wordData.js");

if (!inputPath) {
  console.error("Kullanım: node scripts/generate-word-data.mjs <gts.json> [çıktı]");
  process.exit(1);
}

const normalizeWord = (word) =>
  word
    .replaceAll("â", "a")
    .replaceAll("Â", "A")
    .replaceAll("î", "i")
    .replaceAll("Î", "İ")
    .replaceAll("û", "u")
    .replaceAll("Û", "U")
    .toLocaleUpperCase("tr-TR");

const isFiveLetterHeadword = (entry) =>
  entry.ozel_mi === "0" && /^[a-zçğıöşüâîû]{5}$/iu.test(entry.madde);

const hasGeneralUseMeaning = (entry) =>
  (entry.anlamlarListe || []).some((meaning) =>
    !(meaning.ozelliklerListe || []).some((property) =>
      unsuitableTargetLabels.has(property.tam_adi)
    )
  );

const sourceText = await readFile(path.resolve(inputPath), "utf8");
const entries = sourceText
  .trim()
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => JSON.parse(line));

const validEntries = entries.filter(isFiveLetterHeadword);
const validWords = [...new Set(validEntries.map((entry) => normalizeWord(entry.madde)))].sort();
const targetWords = [
  ...new Set(
    validEntries
      .filter(hasGeneralUseMeaning)
      .map((entry) => normalizeWord(entry.madde))
  ),
].sort();

if (validWords.length < 5000 || targetWords.length < 4000) {
  throw new Error(`Beklenmeyen sözlük boyutu: ${validWords.length}/${targetWords.length}`);
}

const serializeWords = (words) => words.join("\n");
const output = `// Bu dosya scripts/generate-word-data.mjs tarafından otomatik üretildi.\n// Elle düzenlemeyin. Kaynak ve lisans için THIRD_PARTY_NOTICES.md dosyasına bakın.\n\nexport const WORD_DATA_INFO = Object.freeze({\n  source: ${JSON.stringify(SOURCE_REPOSITORY)},\n  commit: ${JSON.stringify(SOURCE_COMMIT)},\n  edition: ${JSON.stringify(SOURCE_EDITION)},\n  validWordCount: ${validWords.length},\n  targetWordCount: ${targetWords.length},\n});\n\nconst VALID_WORDS_TEXT = ${JSON.stringify(serializeWords(validWords))};\nconst TARGET_WORDS_TEXT = ${JSON.stringify(serializeWords(targetWords))};\n\nexport const VALID_WORDS = Object.freeze(VALID_WORDS_TEXT.split("\\n"));\nexport const TARGET_WORDS = Object.freeze(TARGET_WORDS_TEXT.split("\\n"));\nexport const VALID_WORDS_SET = new Set(VALID_WORDS);\n`;

const resolvedOutputPath = path.resolve(outputPath);
await mkdir(path.dirname(resolvedOutputPath), { recursive: true });
await writeFile(resolvedOutputPath, output, "utf8");

console.log(`Üretildi: ${outputPath}`);
console.log(`Geçerli tahmin: ${validWords.length}`);
console.log(`Hedef kelime: ${targetWords.length}`);
