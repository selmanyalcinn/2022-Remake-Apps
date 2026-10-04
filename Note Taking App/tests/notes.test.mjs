import test from "node:test";
import assert from "node:assert/strict";

import {
  createNoteId,
  deserializeNotes,
  isValidNote,
  serializeNotes,
} from "../utils/notes.mjs";

const note = {
  id: "note-1",
  title: "Release checklist",
  text: "Verify persistence",
  createdAt: 1700000000000,
};

test("reads an empty store", () => {
  assert.deepEqual(deserializeNotes(null), {
    notes: [],
    needsMigration: false,
  });
});

test("accepts and marks the legacy array format for migration", () => {
  assert.deepEqual(deserializeNotes(JSON.stringify([note])), {
    notes: [note],
    needsMigration: true,
  });
});

test("round-trips the versioned storage format", () => {
  const encoded = serializeNotes([note]);
  assert.deepEqual(deserializeNotes(encoded), {
    notes: [note],
    needsMigration: false,
  });
});

test("rejects malformed or unsupported stored data", () => {
  assert.throws(() => deserializeNotes("not json"));
  assert.throws(() => deserializeNotes(JSON.stringify({ version: 99, notes: [] })));
  assert.throws(() => deserializeNotes(JSON.stringify([{ ...note, title: "" }])));
});

test("validates required note fields", () => {
  assert.equal(isValidNote(note), true);
  assert.equal(isValidNote({ ...note, createdAt: "today" }), false);
});

test("creates collision-resistant local ids", () => {
  assert.equal(
    createNoteId(() => 123, () => 0.1),
    createNoteId(() => 123, () => 0.1),
  );
  assert.notEqual(
    createNoteId(() => 123, () => 0.1),
    createNoteId(() => 123, () => 0.2),
  );
});
