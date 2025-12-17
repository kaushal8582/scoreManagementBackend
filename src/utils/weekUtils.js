/**
 * Given a date, compute the week start (Monday) and end (Sunday).
 * @param {Date} date
 * @returns {{ weekStartDate: Date, weekEndDate: Date }}
 */
function getWeekRange(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7; // Sunday = 7
  const weekStart = new Date(d);
  weekStart.setUTCDate(d.getUTCDate() - (day - 1));
  weekStart.setUTCHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
  weekEnd.setUTCHours(23, 59, 59, 999);

  return { weekStartDate: weekStart, weekEndDate: weekEnd };
}

module.exports = {
  getWeekRange
};


