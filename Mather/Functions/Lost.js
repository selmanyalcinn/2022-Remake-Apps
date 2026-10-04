import { recordGameResult } from "./Stats";

export function lost() {
  return recordGameResult("lost");
}
