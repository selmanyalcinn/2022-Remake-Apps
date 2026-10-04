/**
 * Formats task creation timestamp into dynamic human-readable relative date
 */
export const formatTaskDate = (createdAt) => {
  if (!createdAt) return "";

  // Handle legacy string formats
  if (typeof createdAt === "string") {
    if (createdAt.startsWith("Bugün ") || createdAt.startsWith("Today ")) {
      const timePart = createdAt.replace(/^(Bugün|Today)\s+/, "");
      return `Today, ${timePart}`;
    }
    // If it's not a timestamp string, return as is
    if (isNaN(Number(createdAt)) && isNaN(Date.parse(createdAt))) {
      return createdAt;
    }
  }

  const date = new Date(typeof createdAt === "number" ? createdAt : Number(createdAt) || createdAt);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const timeStr = `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return `Today, ${timeStr}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return `Yesterday, ${timeStr}`;
  }

  const monthName = date.toLocaleDateString("en-US", { month: "short" });
  return `${date.getDate()} ${monthName}, ${timeStr}`;
};

const LEGACY_DUE_OPTIONS = {
  "Bugün": "today",
  "Yarın": "tomorrow",
  "Bu Hafta": "this_week",
};

const VALID_DUE_OPTIONS = new Set(["today", "tomorrow", "this_week"]);

export const normalizeDueOption = (dueTime) => {
  const normalized = LEGACY_DUE_OPTIONS[dueTime] || dueTime;
  return VALID_DUE_OPTIONS.has(normalized) ? normalized : "today";
};

export const toLocalDateKey = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const fromLocalDateKey = (dateKey) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey || "")) return null;

  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return toLocalDateKey(date) === dateKey ? date : null;
};

const startOfDay = (value = new Date()) => {
  const date = value instanceof Date ? new Date(value) : new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const getDueDateForOption = (dueTime, baseValue = new Date()) => {
  const option = normalizeDueOption(dueTime);
  const date = startOfDay(baseValue);

  if (option === "tomorrow") {
    date.setDate(date.getDate() + 1);
  } else if (option === "this_week") {
    const daysUntilSunday = (7 - date.getDay()) % 7;
    date.setDate(date.getDate() + daysUntilSunday);
  }

  return toLocalDateKey(date);
};

export const migrateTaskDueDate = (task, now = new Date()) => {
  if (fromLocalDateKey(task?.dueDate)) {
    return {
      ...task,
      dueTime: normalizeDueOption(task.dueTime),
    };
  }

  const rawCreatedAt = task?.createdAt;
  const numericCreatedAt = Number(rawCreatedAt);
  const createdAt = new Date(
    typeof rawCreatedAt === "number" || Number.isFinite(numericCreatedAt)
      ? numericCreatedAt
      : rawCreatedAt,
  );
  const baseDate = Number.isNaN(createdAt.getTime()) ? now : createdAt;
  const dueTime = normalizeDueOption(task?.dueTime);

  return {
    ...task,
    dueTime,
    dueDate: getDueDateForOption(dueTime, baseDate),
  };
};

export const isDueToday = (dueDate, now = new Date()) =>
  dueDate === toLocalDateKey(now);

export const getDueOptionForDate = (dueDate, now = new Date()) => {
  const target = fromLocalDateKey(dueDate);
  if (!target) return "today";

  const today = startOfDay(now);
  const differenceInDays = Math.round((target - today) / 86400000);
  if (differenceInDays === 1) return "tomorrow";
  if (differenceInDays > 1) return "this_week";
  return "today";
};

export const formatDueDate = (dueDate, now = new Date()) => {
  const target = fromLocalDateKey(dueDate);
  if (!target) return "";

  const today = startOfDay(now);
  const differenceInDays = Math.round((target - today) / 86400000);

  if (differenceInDays < 0) return "Overdue";
  if (differenceInDays === 0) return "Today";
  if (differenceInDays === 1) return "Tomorrow";

  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + ((7 - today.getDay()) % 7));
  if (target <= endOfWeek) return "This Week";

  return target.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
};
