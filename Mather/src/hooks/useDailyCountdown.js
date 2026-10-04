import { useEffect, useState } from "react";

export function getMillisecondsUntilNextLocalDay(now = new Date()) {
  const nextLocalMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );
  return Math.max(0, nextLocalMidnight.getTime() - now.getTime());
}

export function formatCountdown(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export function useDailyCountdown(enabled = true) {
  const [remaining, setRemaining] = useState(() =>
    getMillisecondsUntilNextLocalDay()
  );

  useEffect(() => {
    if (!enabled) return undefined;

    const update = () => setRemaining(getMillisecondsUntilNextLocalDay());
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [enabled]);

  return formatCountdown(remaining);
}
