/**
 * Check.js — Robust equation validation & exact Wordle two-pass color scoring
 */

const VALID_OPS = ["+", "-", "*", "/"];
const CELL_CORRECT = "correct";
const CELL_PRESENT = "present";
const CELL_ABSENT = "absent";

/**
 * Validates a mathematical expression string (e.g. "24/4+2" or "10-2-3")
 * Ensures no division by zero, no invalid consecutive operators, no leading zeros like "05".
 */
export function evaluateSide(expr) {
  if (!expr || expr.length === 0) return null;

  // Cannot start or end with an operator (except unary minus is not used in this game)
  if (VALID_OPS.includes(expr[0]) || VALID_OPS.includes(expr[expr.length - 1])) {
    return null;
  }

  // Check for consecutive operators
  for (let i = 0; i < expr.length - 1; i++) {
    if (VALID_OPS.includes(expr[i]) && VALID_OPS.includes(expr[i + 1])) {
      return null;
    }
  }

  // Check for division by zero: e.g. "/0", "/00"
  if (/\/(0+)([^0-9]|$)/.test(expr)) {
    return null;
  }

  // Check for invalid numbers with leading zeros (e.g. "05+3" -> invalid, "0+3" -> valid)
  const tokens = expr.split(/[+\-*/]/);
  for (const token of tokens) {
    if (token.length > 1 && token.startsWith("0")) {
      return null;
    }
  }

  // Safely evaluate using Function constructor
  try {
    // Only allow digits and +, -, *, /
    if (!/^[0-9+\-*/]+$/.test(expr)) return null;
    const val = Function(`"use strict"; return (${expr})`)();
    if (typeof val !== "number" || !isFinite(val)) return null;
    return val;
  } catch (e) {
    return null;
  }
}

/**
 * Validates the full 8-character guess:
 * Must contain exactly one '=' sign, lhs == rhs mathematically.
 */
export function isValidEquation(guessStr) {
  if (!guessStr || guessStr.length !== 8) return false;

  const equalCount = (guessStr.match(/=/g) || []).length;
  if (equalCount !== 1) return false;

  const eqIdx = guessStr.indexOf("=");
  // '=' must be at index 4, 5, or 6
  if (eqIdx < 3 || eqIdx > 6) return false;

  const lhsStr = guessStr.substring(0, eqIdx);
  const rhsStr = guessStr.substring(eqIdx + 1);

  // Both sides must have at least 1 character
  if (!lhsStr || !rhsStr) return false;

  // Right side in this game should be an integer result
  const rhsVal = evaluateSide(rhsStr);
  const lhsVal = evaluateSide(lhsStr);

  if (lhsVal === null || rhsVal === null) return false;

  // Must be exact integer equality (floating inaccuracies avoided)
  return Math.abs(lhsVal - rhsVal) < 1e-9;
}

/**
 * check() — Main entry point called by Game.js
 *
 * @param {number} attemptCount - (0-5)
 * @param {string[]} typedOperation - 8 characters array e.g. ['2','+','2','=','4',' ',' ',' ']
 * @param {number} typedLetter - number of typed chars (should be 8)
 * @param {string} targetEquation - secret equation string e.g. "12+34=46"
 *
 * @returns "Invalid" | "GAME WON" | Array [box0..box7, greenChars, yellowChars, grayChars]
 */
export function check(attemptCount, typedOperation, typedLetter, targetEquation) {
  const guessStr = Array.isArray(typedOperation) ? typedOperation.join("") : String(typedOperation);
  const targetStr = String(targetEquation);

  // 1. Length check
  if (guessStr.length !== 8) {
    return "Invalid";
  }

  // 2. Mathematical validity check
  if (!isValidEquation(guessStr)) {
    return "Invalid";
  }

  // 3. Exact Match check
  if (guessStr === targetStr) {
    return "GAME WON";
  }

  // 4. Two-pass Wordle Color Scoring
  const boxStates = Array(8).fill(CELL_ABSENT);
  const targetFreq = {};
  const greenChars = [];
  const yellowChars = [];
  const grayChars = [];

  // Build target frequency map
  for (let i = 0; i < 8; i++) {
    const ch = targetStr[i];
    targetFreq[ch] = (targetFreq[ch] || 0) + 1;
  }

  // PASS 1: Mark Greens (Correct character and position)
  for (let i = 0; i < 8; i++) {
    const gChar = guessStr[i];
    if (gChar === targetStr[i]) {
      boxStates[i] = CELL_CORRECT;
      targetFreq[gChar] -= 1;
      if (!greenChars.includes(gChar)) {
        greenChars.push(gChar);
      }
    }
  }

  // PASS 2: Mark Yellows & Grays
  for (let i = 0; i < 8; i++) {
    if (boxStates[i] === CELL_CORRECT) continue; // already correct

    const gChar = guessStr[i];
    if (targetFreq[gChar] && targetFreq[gChar] > 0) {
      boxStates[i] = CELL_PRESENT;
      targetFreq[gChar] -= 1;
      if (!yellowChars.includes(gChar)) {
        yellowChars.push(gChar);
      }
    } else {
      boxStates[i] = CELL_ABSENT;
      if (!grayChars.includes(gChar) && !greenChars.includes(gChar) && !yellowChars.includes(gChar)) {
        grayChars.push(gChar);
      }
    }
  }

  return [
    ...boxStates,
    greenChars,
    yellowChars,
    grayChars,
  ];
}
