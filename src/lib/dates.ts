const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function toWib(date: Date): Date {
  return new Date(date.getTime() + WIB_OFFSET_MS);
}

// "2026-09-30" dari input type="date" -> 30 Sep 2026 pukul 00:00 WIB.
export function parseDateInput(value: string): Date {
  return new Date(`${value}T00:00:00+07:00`);
}

export function toDateInputValue(date: Date): string {
  return toWib(date).toISOString().slice(0, 10);
}

// "2026-09" dari input type="month" -> tanggal 1 bulan itu pukul 00:00 WIB (format kolom WebsiteStat.period).
export function parseMonthInput(value: string): Date {
  return new Date(`${value}-01T00:00:00+07:00`);
}

export function toMonthInputValue(date: Date): string {
  return toWib(date).toISOString().slice(0, 7);
}

export function startOfMonthWib(date: Date, monthOffset = 0): Date {
  const wib = toWib(date);
  return new Date(Date.UTC(wib.getUTCFullYear(), wib.getUTCMonth() + monthOffset, 1) - WIB_OFFSET_MS);
}

export function daysUntil(target: Date, now: Date = new Date()): number {
  return Math.ceil((target.getTime() - now.getTime()) / DAY_MS);
}
