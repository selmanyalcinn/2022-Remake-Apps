import {
  formatDueDate,
  getDueDateForOption,
  getDueOptionForDate,
  isDueToday,
  migrateTaskDueDate,
  normalizeDueOption,
  toLocalDateKey,
} from "../date";

const SATURDAY = new Date(2026, 9, 3, 12, 0, 0);

describe("task due dates", () => {
  test("creates stable local date keys for schedule options", () => {
    expect(getDueDateForOption("today", SATURDAY)).toBe("2026-10-03");
    expect(getDueDateForOption("tomorrow", SATURDAY)).toBe("2026-10-04");
    expect(getDueDateForOption("this_week", SATURDAY)).toBe("2026-10-04");
  });

  test("keeps this-week tasks on Sunday when created on Sunday", () => {
    const sunday = new Date(2026, 9, 4, 12, 0, 0);
    expect(getDueDateForOption("this_week", sunday)).toBe("2026-10-04");
  });

  test("formats labels relative to the current date", () => {
    expect(formatDueDate("2026-10-02", SATURDAY)).toBe("Overdue");
    expect(formatDueDate("2026-10-03", SATURDAY)).toBe("Today");
    expect(formatDueDate("2026-10-04", SATURDAY)).toBe("Tomorrow");
  });

  test("migrates legacy schedule values using the task creation date", () => {
    const task = migrateTaskDueDate({
      id: "1",
      title: "Legacy task",
      dueTime: "Yarın",
      createdAt: SATURDAY.getTime(),
    });

    expect(task.dueTime).toBe("tomorrow");
    expect(task.dueDate).toBe("2026-10-04");

    const taskWithNumericString = migrateTaskDueDate({
      id: "2",
      title: "Older legacy task",
      dueTime: "today",
      createdAt: String(SATURDAY.getTime()),
    });
    expect(taskWithNumericString.dueDate).toBe("2026-10-03");
  });

  test("recognizes today's tasks and edit options", () => {
    expect(isDueToday("2026-10-03", SATURDAY)).toBe(true);
    expect(isDueToday("2026-10-04", SATURDAY)).toBe(false);
    expect(getDueOptionForDate("2026-10-04", SATURDAY)).toBe("tomorrow");
  });

  test("handles invalid and unknown input safely", () => {
    expect(toLocalDateKey("invalid")).toBe("");
    expect(formatDueDate("invalid", SATURDAY)).toBe("");
    expect(normalizeDueOption("unknown")).toBe("today");
  });
});
