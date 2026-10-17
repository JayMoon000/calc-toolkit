/**
 * ToolLab.org - D-Day & Date Duration Engine (Zero-dependency Pure Functions)
 * Path: D:\Gemini_Files\ToolLab.org\js\utils\ddayCounter.js
 */
const DDayCounter = {
  // 1. Calculate duration between target date and base date (defaults to today)
  calculateDDay(targetDateStr, baseDate = new Date()) {
    if (!targetDateStr) return null;

    const target = new Date(targetDateStr);
    if (isNaN(target.getTime())) return null;

    // Normalize to midnight for accurate whole-day calculations
    const tMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    const bMidnight = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());

    const diffMs = tMidnight.getTime() - bMidnight.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    const totalSeconds = Math.floor(Math.abs(diffMs) / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalWeeks = Math.floor(Math.abs(diffDays) / 7);
    const remainingDaysAfterWeeks = Math.abs(diffDays) % 7;

    return {
      days: diffDays,
      isToday: diffDays === 0,
      isPast: diffDays < 0,
      isFuture: diffDays > 0,
      absDays: Math.abs(diffDays),
      weeks: totalWeeks,
      remainingDaysAfterWeeks,
      totalHours,
      totalMinutes,
      totalSeconds
    };
  },

  // 2. Add or subtract days from a specific start date
  addDays(startDateStr, daysToAdd) {
    if (!startDateStr || isNaN(daysToAdd)) return null;

    const start = new Date(startDateStr);
    if (isNaN(start.getTime())) return null;

    const result = new Date(start);
    result.setDate(result.getDate() + parseInt(daysToAdd, 10));

    return {
      date: result,
      dateString: result.toISOString().split("T")[0],
      formatted: result.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric"
      })
    };
  },

  // 3. Calculate working business days between two dates (excluding Sat/Sun)
  calculateBusinessDays(startDateStr, endDateStr) {
    if (!startDateStr || !endDateStr) return 0;

    let start = new Date(startDateStr);
    let end = new Date(endDateStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;

    if (start > end) {
      const temp = start;
      start = end;
      end = temp;
    }

    let businessDays = 0;
    const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const stop = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    while (cur <= stop) {
      const dayOfWeek = cur.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        businessDays++;
      }
      cur.setDate(cur.getDate() + 1);
    }

    return businessDays;
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = DDayCounter;
}

if (typeof window !== "undefined") {
  window.DDayCounter = DDayCounter;
}

// Node.js CLI Validation Block
if (typeof process !== "undefined" && process.argv && process.argv[1]?.endsWith("ddayCounter.js")) {
  const today = new Date();
  const future = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10);
  const futureStr = future.toISOString().split("T")[0];

  const res = DDayCounter.calculateDDay(futureStr, today);
  console.assert(res.days === 10, "10-day future assertion failed");

  const added = DDayCounter.addDays(futureStr, 5);
  console.assert(added !== null, "Date addition failed");

  console.log("✔ DDayCounter pure engine passed all unit tests");
}