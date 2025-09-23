// utils/dateUtils.ts
export const isConsecutiveDay = (
  previousDate: string,
  currentDate: Date
): boolean => {
  const prev = new Date(previousDate);
  const current = new Date(currentDate);

  // Reset both dates to midnight for accurate day comparison
  prev.setHours(0, 0, 0, 0);
  current.setHours(0, 0, 0, 0);

  // Calculate difference in days
  const timeDiff = current.getTime() - prev.getTime();
  const dayDiff = timeDiff / (1000 * 3600 * 24);

  return dayDiff === 1;
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};
