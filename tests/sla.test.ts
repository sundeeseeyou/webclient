import type { RequestStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";
import {
  SLA_TARGET_HOURS,
  allowedTransitions,
  canTransition,
  computeDueAt,
  isOverdue,
  overdueWhere,
  slaTargetLabel,
} from "@/lib/sla";

const HOUR = 60 * 60 * 1000;
const created = new Date("2026-09-30T02:00:00.000Z");

describe("target SLA", () => {
  it("sesuai tabel PRD 6.1", () => {
    expect(SLA_TARGET_HOURS).toEqual({ URGENT: 4, HIGH: 24, MEDIUM: 72, LOW: 120 });
  });

  it("label mudah dibaca: jam untuk di bawah sehari, hari untuk sisanya", () => {
    expect(slaTargetLabel("URGENT")).toBe("4 jam");
    expect(slaTargetLabel("HIGH")).toBe("1 hari");
    expect(slaTargetLabel("MEDIUM")).toBe("3 hari");
    expect(slaTargetLabel("LOW")).toBe("5 hari");
  });

  it("dueAt = createdAt + target (BB-12: prioritas Tinggi = +1 hari)", () => {
    expect(computeDueAt(created, "HIGH").getTime() - created.getTime()).toBe(24 * HOUR);
    expect(computeDueAt(created, "URGENT").getTime() - created.getTime()).toBe(4 * HOUR);
    expect(computeDueAt(created, "LOW").toISOString()).toBe("2026-10-05T02:00:00.000Z");
  });
});

describe("alur status permintaan", () => {
  const allowed: [RequestStatus, RequestStatus][] = [
    ["SUBMITTED", "IN_REVIEW"],
    ["IN_REVIEW", "APPROVED"],
    ["IN_REVIEW", "REJECTED"],
    ["APPROVED", "IN_PROGRESS"],
    ["IN_PROGRESS", "DONE"],
  ];

  it.each(allowed)("%s -> %s diizinkan", (from, to) => {
    expect(canTransition(from, to)).toBe(true);
  });

  it.each<[RequestStatus, RequestStatus]>([
    ["SUBMITTED", "DONE"],
    ["SUBMITTED", "REJECTED"],
    ["SUBMITTED", "APPROVED"],
    ["IN_REVIEW", "IN_PROGRESS"],
    ["APPROVED", "REJECTED"],
    ["IN_PROGRESS", "SUBMITTED"],
    ["IN_REVIEW", "IN_REVIEW"],
  ])("%s -> %s ditolak", (from, to) => {
    expect(canTransition(from, to)).toBe(false);
  });

  it("status akhir tidak punya langkah lanjutan", () => {
    expect(allowedTransitions("DONE")).toEqual([]);
    expect(allowedTransitions("REJECTED")).toEqual([]);
  });

  it("jumlah transisi yang diizinkan persis sesuai activity diagram", () => {
    const statuses: RequestStatus[] = ["SUBMITTED", "IN_REVIEW", "APPROVED", "REJECTED", "IN_PROGRESS", "DONE"];
    const total = statuses.reduce((sum, status) => sum + allowedTransitions(status).length, 0);
    expect(total).toBe(allowed.length);
  });
});

describe("melewati SLA", () => {
  const dueAt = computeDueAt(created, "URGENT");

  it("terlambat bila belum direspons dan batas waktu sudah lewat (BB-15)", () => {
    expect(isOverdue({ respondedAt: null, dueAt }, new Date(dueAt.getTime() + 1))).toBe(true);
  });

  it("belum terlambat tepat pada batas waktu", () => {
    expect(isOverdue({ respondedAt: null, dueAt }, dueAt)).toBe(false);
  });

  it("tidak terlambat bila admin sudah merespons, walau batas waktu lewat", () => {
    expect(isOverdue({ respondedAt: new Date(created.getTime() + HOUR), dueAt }, new Date(dueAt.getTime() + 10 * HOUR))).toBe(false);
  });

  it("filter Prisma memakai aturan yang sama", () => {
    const now = new Date("2026-10-01T00:00:00.000Z");
    expect(overdueWhere(now)).toEqual({ respondedAt: null, dueAt: { lt: now } });
  });
});
