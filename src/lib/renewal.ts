import { daysUntil } from "@/lib/dates";

// Batas pengingat perpanjangan (PRD 6.5): kuning mulai 30 hari, merah mulai 7 hari sebelum habis.
export const RENEWAL_WARNING_DAYS = 30;
export const RENEWAL_DANGER_DAYS = 7;

export type RenewalTone = "neutral" | "warning" | "danger";

export type RenewalStatus = {
  days: number;
  tone: RenewalTone;
  text: string;
};

const toneRank: Record<RenewalTone, number> = { neutral: 0, warning: 1, danger: 2 };

function renewalTone(days: number): RenewalTone {
  if (days <= RENEWAL_DANGER_DAYS) return "danger";
  if (days <= RENEWAL_WARNING_DAYS) return "warning";
  return "neutral";
}

export function renewalText(days: number): string {
  if (days > 0) return `Habis dalam ${days} hari`;
  if (days === 0) return "Habis hari ini";
  return `Sudah lewat ${Math.abs(days)} hari`;
}

export function renewalStatus(date: Date, now: Date = new Date()): RenewalStatus {
  const days = daysUntil(date, now);
  return { days, tone: renewalTone(days), text: renewalText(days) };
}

// Warna kartu mengikuti masa aktif yang paling mendesak (domain atau hosting).
export function mostUrgentTone(dates: (Date | null)[], now: Date = new Date()): RenewalTone {
  return dates.reduce<RenewalTone>((worst, date) => {
    if (!date) return worst;
    const tone = renewalTone(daysUntil(date, now));
    return toneRank[tone] > toneRank[worst] ? tone : worst;
  }, "neutral");
}
