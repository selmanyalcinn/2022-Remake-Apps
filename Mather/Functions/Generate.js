/**
 * Generate.js — Math equation generator for Mather (Mathler/Nerdle-style)
 *
 * All equations are exactly 8 characters long in the format:
 *   number operator number = result
 * or for double operations:
 *   n1 op1 n2 op2 n3 = result
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Random integer in [min, max] inclusive */
function randInt(min, max, rng = Math.random) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/** Build the equation string and verify it's exactly 8 chars */
function eq(lhs, result) {
  const s = `${lhs}=${result}`;
  if (s.length !== 8) return null;
  return s;
}

// ─── Seeded Pseudo-Random Number Generator ─────────────────────────────────────
function createSeededRng(seedStr) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619);
  }
  return function () {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Single-operation generator ───────────────────────────────────────────────

function genSingleOp(rng = Math.random) {
  const scenario = randInt(1, 11, rng);
  let a, b, res, s;

  switch (scenario) {
    // --- Addition ---
    case 1: {
      a = randInt(91, 99, rng);
      b = randInt(100 - a, 9, rng);
      res = a + b;
      s = eq(`${a}+${b}`, res);
      break;
    }
    case 2: {
      b = randInt(10, 78, rng);
      a = randInt(10, 99 - b - 1, rng);
      res = a + b;
      s = eq(`${a}+${b}`, res);
      break;
    }
    case 3: {
      a = randInt(1, 9, rng);
      b = randInt(91, 90 + a, rng);
      res = a + b;
      s = eq(`${a}+${b}`, res);
      break;
    }
    // --- Subtraction ---
    case 4: {
      b = randInt(1, 9, rng);
      a = randInt(100, 100 + b - 1, rng);
      res = a - b;
      s = eq(`${a}-${b}`, res);
      break;
    }
    case 5: {
      a = randInt(100, 109, rng);
      b = randInt(a - 9, a - 1, rng);
      res = a - b;
      if (res < 1 || res > 9) { s = null; break; }
      s = eq(`${a}-${b}`, res);
      break;
    }
    case 6: {
      b = randInt(10, 80, rng);
      a = randInt(b + 10, Math.min(99, b + 89), rng);
      res = a - b;
      s = eq(`${a}-${b}`, res);
      break;
    }
    // --- Multiplication ---
    case 7: {
      a = randInt(2, 9, rng);
      const minB = Math.ceil(100 / a);
      if (minB > 99) { s = null; break; }
      b = randInt(minB, Math.min(99, Math.floor(999 / a)), rng);
      res = a * b;
      s = eq(`${a}*${b}`, res);
      break;
    }
    case 8: {
      b = randInt(2, 9, rng);
      const minA = Math.ceil(100 / b);
      if (minA > 99) { s = null; break; }
      a = randInt(minA, Math.min(99, Math.floor(999 / b)), rng);
      res = a * b;
      s = eq(`${a}*${b}`, res);
      break;
    }
    case 9: {
      a = randInt(1000, 9999, rng);
      s = eq(`${a}*0`, 0);
      break;
    }
    // --- Division ---
    case 10: {
      b = randInt(12, 99, rng);
      a = randInt(Math.ceil(100 / b), 9, rng) * b;
      if (a < 100 || a > 999) { s = null; break; }
      res = a / b;
      s = eq(`${a}/${b}`, res);
      break;
    }
    case 11: {
      b = randInt(1, 9, rng);
      const minDiv = Math.ceil(100 / b);
      a = randInt(minDiv, Math.min(99, Math.floor(999 / b)), rng) * b;
      if (a < 100) { s = null; break; }
      res = a / b;
      if (`${a}/${b}=${res}` === "101/1=101") { s = null; break; }
      s = eq(`${a}/${b}`, res);
      break;
    }
    default:
      s = null;
  }

  return s && s.length === 8 ? s : genSingleOp(rng);
}

// ─── Double-operation generator ───────────────────────────────────────────────

function genDoubleOp(rng = Math.random) {
  const scenario = randInt(1, 6, rng);
  let a, b, c, res, s;

  switch (scenario) {
    case 1: {
      b = randInt(2, 9, rng);
      c = randInt(2, 9, rng);
      const bc = b * c;
      const aMin = Math.max(1, 10 - bc);
      const aMax = Math.min(9, 99 - bc);
      if (aMin > aMax) { s = null; break; }
      a = randInt(aMin, aMax, rng);
      res = a + bc;
      s = eq(`${a}+${b}*${c}`, res);
      break;
    }
    case 2: {
      a = randInt(2, 9, rng);
      b = randInt(2, 9, rng);
      const ab = a * b;
      if (ab > 99) { s = null; break; }
      const cMin = Math.max(1, 10 - ab);
      const cMax = Math.min(9, 99 - ab);
      if (cMin > cMax) { s = null; break; }
      c = randInt(cMin, cMax, rng);
      res = ab + c;
      s = eq(`${a}*${b}+${c}`, res);
      break;
    }
    case 3: {
      a = randInt(2, 9, rng);
      b = randInt(2, 9, rng);
      const ab = a * b;
      if (ab <= 10) { s = null; break; }
      const cMax = Math.min(9, ab - 10);
      if (cMax < 1) { s = null; break; }
      c = randInt(1, cMax, rng);
      res = ab - c;
      s = eq(`${a}*${b}-${c}`, res);
      break;
    }
    case 4: {
      a = randInt(2, 5, rng);
      b = randInt(2, 5, rng);
      c = randInt(2, 5, rng);
      res = a * b * c;
      if (res < 10 || res > 99) { s = null; break; }
      s = eq(`${a}*${b}*${c}`, res);
      break;
    }
    case 5: {
      c = randInt(2, 9, rng);
      const qMin = Math.ceil(10 / c);
      const qMax = Math.floor(99 / c);
      if (qMin > qMax) { s = null; break; }
      const q = randInt(qMin, qMax, rng);
      a = q * c;
      if (a < 10 || a > 99) { s = null; break; }
      const dMax = Math.min(9, 9 - q);
      if (dMax < 1) { s = null; break; }
      const d = randInt(1, dMax, rng);
      res = q + d;
      s = eq(`${a}/${c}+${d}`, res);
      break;
    }
    case 6: {
      c = randInt(2, 9, rng);
      const qMin = Math.ceil(10 / c);
      const qMax = Math.floor(99 / c);
      if (qMin > qMax) { s = null; break; }
      const q = randInt(qMin, qMax, rng);
      a = q * c;
      if (a < 10 || a > 99) { s = null; break; }
      const dMax = Math.min(9, q - 1);
      if (dMax < 1) { s = null; break; }
      const d = randInt(1, dMax, rng);
      res = q - d;
      s = eq(`${a}/${c}-${d}`, res);
      break;
    }
    default:
      s = null;
  }

  return s && s.length === 8 ? s : genDoubleOp(rng);
}

// ─── Main Exports ─────────────────────────────────────────────────────────────

/** Generates a random equation for unlimited mode */
export function generate() {
  const useDouble = Math.random() < 0.4;
  return useDouble ? genDoubleOp() : genSingleOp();
}

/** Get the current device-local date in YYYY-MM-DD format. */
export function getTodayDateString(date = new Date()) {
  const d = date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Generates a deterministic daily equation for a specific date string (YYYY-MM-DD) */
export function generateDaily(dateStr = getTodayDateString()) {
  const rng = createSeededRng(`Mather_Daily_${dateStr}`);
  const useDouble = rng() < 0.45;
  return useDouble ? genDoubleOp(rng) : genSingleOp(rng);
}
