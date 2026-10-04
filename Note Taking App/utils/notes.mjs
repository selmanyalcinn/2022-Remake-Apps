export const NOTES_SCHEMA_VERSION = 1;
export const MAX_NOTE_LENGTH = 20000;

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function isValidNote(note) {
  return (
    note !== null &&
    typeof note === "object" &&
    isNonEmptyString(note.id) &&
    isNonEmptyString(note.title) &&
    isNonEmptyString(note.text) &&
    Number.isFinite(note.createdAt)
  );
}

function assertValidNotes(notes) {
  if (!Array.isArray(notes) || !notes.every(isValidNote)) {
    throw new Error("Stored notes have an invalid format.");
  }
}

export function deserializeNotes(raw) {
  if (raw === null) {
    return { notes: [], needsMigration: false };
  }

  const parsed = JSON.parse(raw);

  // Version 1.0 stored the array directly. Accept it once and migrate it to
  // the versioned envelope after a successful read.
  if (Array.isArray(parsed)) {
    assertValidNotes(parsed);
    return { notes: parsed, needsMigration: true };
  }

  if (
    parsed === null ||
    typeof parsed !== "object" ||
    parsed.version !== NOTES_SCHEMA_VERSION
  ) {
    throw new Error("Stored notes use an unsupported format.");
  }

  assertValidNotes(parsed.notes);
  return { notes: parsed.notes, needsMigration: false };
}

export function serializeNotes(notes) {
  assertValidNotes(notes);
  return JSON.stringify({ version: NOTES_SCHEMA_VERSION, notes });
}

export function createNoteId(now = Date.now, random = Math.random) {
  const randomPart = Math.floor(random() * Number.MAX_SAFE_INTEGER).toString(36);
  return `${now().toString(36)}-${randomPart}`;
}
