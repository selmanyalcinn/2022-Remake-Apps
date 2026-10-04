import { recordGameResult } from "./Stats";

export function win(attempt = 1) {
  return recordGameResult("won", attempt);
}
