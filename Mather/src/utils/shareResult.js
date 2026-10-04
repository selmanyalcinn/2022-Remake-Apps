const EMOJI = {
  correct: "🟩",
  present: "🟨",
  absent: "⬛",
};

export function normalizeCellState(value) {
  if (["correct", "present", "absent"].includes(value)) return value;
  const normalized = String(value || "").toLowerCase();
  if (["#32de84", "#538d4e"].includes(normalized)) return "correct";
  if (["#ffd700", "#b59f3b"].includes(normalized)) return "present";
  if (["#c0c0c0", "#3a3a3c"].includes(normalized)) return "absent";
  return null;
}

export function buildEmojiGrid(rows = []) {
  return rows
    .filter((row) => Array.isArray(row) && row.length > 0)
    .map((row) =>
      row
        .map((cell) => EMOJI[normalizeCellState(cell)] || "⬜")
        .join("")
    )
    .join("\n");
}
