import type { Prisma, RequestPriority, RequestStatus } from "@prisma/client";

const HOUR_MS = 60 * 60 * 1000;

// Target waktu respon per prioritas (PRD 6.1). MVP memakai jam kalender, bukan jam kerja.
export const SLA_TARGET_HOURS: Record<RequestPriority, number> = {
  URGENT: 4,
  HIGH: 24,
  MEDIUM: 72,
  LOW: 120,
};

export function slaTargetLabel(priority: RequestPriority): string {
  const hours = SLA_TARGET_HOURS[priority];
  return hours < 24 ? `${hours} jam` : `${hours / 24} hari`;
}

export function computeDueAt(createdAt: Date, priority: RequestPriority): Date {
  return new Date(createdAt.getTime() + SLA_TARGET_HOURS[priority] * HOUR_MS);
}

// Alur status sesuai activity diagram "Request Perubahan": penolakan hanya dari tahap peninjauan.
const TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  SUBMITTED: ["IN_REVIEW"],
  IN_REVIEW: ["APPROVED", "REJECTED"],
  APPROVED: ["IN_PROGRESS"],
  IN_PROGRESS: ["DONE"],
  REJECTED: [],
  DONE: [],
};

export function allowedTransitions(from: RequestStatus): RequestStatus[] {
  return TRANSITIONS[from];
}

export function canTransition(from: RequestStatus, to: RequestStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

// Terlambat = belum pernah direspons admin dan batas waktu respon sudah lewat.
export function isOverdue(request: { respondedAt: Date | null; dueAt: Date }, now: Date = new Date()): boolean {
  return request.respondedAt === null && now.getTime() > request.dueAt.getTime();
}

export function overdueWhere(now: Date = new Date()) {
  return { respondedAt: null, dueAt: { lt: now } } satisfies Prisma.SlaRequestWhereInput;
}
