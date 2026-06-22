import { addDays, differenceInCalendarDays, format, isSameDay, startOfDay } from "date-fns";

export function toStartOfDay(date: Date | string) {
  return startOfDay(typeof date === "string" ? new Date(`${date}T00:00:00`) : date);
}

export function dateDiffInclusive(startDate: Date, endDate: Date) {
  return Math.max(differenceInCalendarDays(toStartOfDay(endDate), toStartOfDay(startDate)) + 1, 1);
}

export function addPlanDays(date: Date, amount: number) {
  return addDays(toStartOfDay(date), amount);
}

export function isWeekend(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function displayDate(date: Date | string, pattern = "dd MMM yyyy") {
  return format(typeof date === "string" ? new Date(date) : date, pattern);
}

export function today() {
  return toStartOfDay(new Date());
}

export function sameDay(left: Date, right: Date) {
  return isSameDay(toStartOfDay(left), toStartOfDay(right));
}
