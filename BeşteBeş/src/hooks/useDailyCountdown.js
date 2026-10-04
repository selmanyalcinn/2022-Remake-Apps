import { useEffect, useState } from "react";

const getNextMidnight = (date) => {
  const next = new Date(date);
  next.setHours(24, 0, 0, 0);
  return next;
};

export const formatCountdown = (milliseconds) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

export const useDailyCountdown = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const nextMidnight = getNextMidnight(now);
  return {
    now,
    dateKey: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
    timeRemaining: formatCountdown(nextMidnight.getTime() - now.getTime()),
  };
};
