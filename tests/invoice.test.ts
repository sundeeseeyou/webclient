import { Prisma, type InvoiceStatus } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import {
  CLIENT_VISIBLE_INVOICE_STATUSES,
  calculateInvoiceTotal,
  canApplyInvoiceAction,
  effectiveInvoiceStatus,
  formatInvoiceNumber,
  generateInvoiceNumber,
  invoiceActionTarget,
  invoicePrefix,
  isPastDue,
  nextInvoiceNumber,
  type InvoiceAction,
} from "@/lib/invoice";

// Tanggal jatuh tempo disimpan sebagai 00:00 WIB (= 17:00 UTC hari sebelumnya).
const dueDate = new Date("2026-10-14T00:00:00+07:00");

describe("nomor invoice", () => {
  it("format INV/YYYY/MM/NNNN dengan urutan 4 digit", () => {
    expect(formatInvoiceNumber(new Date("2026-09-15T03:00:00Z"), 1)).toBe("INV/2026/09/0001");
    expect(formatInvoiceNumber(new Date("2026-12-01T03:00:00Z"), 123)).toBe("INV/2026/12/0123");
  });

  it("bulan dihitung dalam WIB, bukan UTC", () => {
    // 30 Sep 18:00 UTC = 1 Okt 01:00 WIB
    expect(invoicePrefix(new Date("2026-09-30T18:00:00Z"))).toBe("INV/2026/10/");
    // 31 Des 17:30 UTC = 1 Jan 00:30 WIB tahun berikutnya
    expect(invoicePrefix(new Date("2026-12-31T17:30:00Z"))).toBe("INV/2027/01/");
  });

  it("nomor pertama di bulan baru mulai dari 0001", () => {
    expect(nextInvoiceNumber(null, new Date("2026-10-05T03:00:00Z"))).toBe("INV/2026/10/0001");
  });

  it("melanjutkan urutan dari nomor terakhir bulan itu", () => {
    const issued = new Date("2026-10-05T03:00:00Z");
    expect(nextInvoiceNumber("INV/2026/10/0009", issued)).toBe("INV/2026/10/0010");
    expect(nextInvoiceNumber("INV/2026/10/0099", issued)).toBe("INV/2026/10/0100");
  });

  it("mencari nomor terakhir dengan prefiks bulan terbit (BB-18)", async () => {
    const findFirst = vi.fn().mockResolvedValue({ number: "INV/2026/10/0003" });
    const db = { invoice: { findFirst } } as unknown as Prisma.TransactionClient;

    const number = await generateInvoiceNumber(db, new Date("2026-10-20T03:00:00Z"));

    expect(number).toBe("INV/2026/10/0004");
    expect(findFirst).toHaveBeenCalledWith({
      where: { number: { startsWith: "INV/2026/10/" } },
      orderBy: { number: "desc" },
      select: { number: true },
    });
  });
});

describe("total invoice", () => {
  it("dihitung dari qty x harga satuan semua item", () => {
    const total = calculateInvoiceTotal([
      { qty: 4, unitPrice: 750000 },
      { qty: 1, unitPrice: "1200000" },
    ]);
    expect(total.toString()).toBe("4200000");
  });

  it("tanpa selisih pembulatan untuk nilai desimal", () => {
    const total = calculateInvoiceTotal([
      { qty: 3, unitPrice: new Prisma.Decimal("0.1") },
      { qty: 1, unitPrice: "0.2" },
    ]);
    expect(total.toString()).toBe("0.5");
  });

  it("tanpa item bernilai 0", () => {
    expect(calculateInvoiceTotal([]).toString()).toBe("0");
  });
});

describe("jatuh tempo", () => {
  it("masih boleh dibayar sepanjang hari jatuh tempo", () => {
    expect(isPastDue(dueDate, new Date("2026-10-14T23:59:00+07:00"))).toBe(false);
  });

  it("terlambat mulai 00:00 WIB hari berikutnya", () => {
    expect(isPastDue(dueDate, new Date("2026-10-15T00:00:00+07:00"))).toBe(true);
  });

  it("SENT yang lewat jatuh tempo ditampilkan sebagai OVERDUE", () => {
    const later = new Date("2026-10-20T00:00:00+07:00");
    expect(effectiveInvoiceStatus({ status: "SENT", dueDate }, later)).toBe("OVERDUE");
    expect(effectiveInvoiceStatus({ status: "SENT", dueDate }, new Date("2026-10-10T00:00:00+07:00"))).toBe("SENT");
  });

  it.each<InvoiceStatus>(["DRAFT", "PAID", "CANCELLED", "OVERDUE"])("status %s tidak diubah oleh jatuh tempo", (status) => {
    expect(effectiveInvoiceStatus({ status, dueDate }, new Date("2026-12-01T00:00:00+07:00"))).toBe(status);
  });
});

describe("aksi status invoice", () => {
  const cases: [InvoiceAction, InvoiceStatus, boolean][] = [
    ["send", "DRAFT", true],
    ["send", "SENT", false],
    ["send", "PAID", false],
    ["mark-paid", "SENT", true],
    ["mark-paid", "OVERDUE", true],
    ["mark-paid", "DRAFT", false],
    ["mark-paid", "CANCELLED", false],
    ["cancel", "DRAFT", true],
    ["cancel", "SENT", true],
    ["cancel", "OVERDUE", true],
    ["cancel", "PAID", false],
    ["cancel", "CANCELLED", false],
  ];

  it.each(cases)("%s dari %s -> %s", (action, status, expected) => {
    expect(canApplyInvoiceAction(status, action)).toBe(expected);
  });

  it("status tujuan setiap aksi", () => {
    expect(invoiceActionTarget("send")).toBe("SENT");
    expect(invoiceActionTarget("mark-paid")).toBe("PAID");
    expect(invoiceActionTarget("cancel")).toBe("CANCELLED");
  });

  it("klien tidak pernah melihat DRAFT atau CANCELLED (BB-21)", () => {
    expect(CLIENT_VISIBLE_INVOICE_STATUSES).toEqual(["SENT", "PAID", "OVERDUE"]);
  });
});
