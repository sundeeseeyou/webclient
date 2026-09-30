import type {
  ArticleStatus,
  InvoiceStatus,
  ProjectStatus,
  RequestStatus,
  SprintStatus,
  WebsiteStatus,
} from "@prisma/client";

// Warna badge status: hijau selesai, kuning menunggu, merah terlambat/ditolak, biru sedang berjalan.
export type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

export const websiteStatusTone: Record<WebsiteStatus, Tone> = {
  ACTIVE: "success",
  MAINTENANCE: "warning",
  INACTIVE: "neutral",
};

export const articleStatusTone: Record<ArticleStatus, Tone> = {
  PUBLISHED: "success",
  DRAFT: "neutral",
};

export const projectStatusTone: Record<ProjectStatus, Tone> = {
  PLANNING: "neutral",
  IN_PROGRESS: "info",
  WAITING_APPROVAL: "warning",
  REVISION: "primary",
  DONE: "success",
  ON_HOLD: "neutral",
};

export const sprintStatusTone: Record<SprintStatus, Tone> = {
  PLANNED: "neutral",
  ACTIVE: "info",
  DONE: "success",
};

export const invoiceStatusTone: Record<InvoiceStatus, Tone> = {
  DRAFT: "neutral",
  SENT: "info",
  PAID: "success",
  OVERDUE: "danger",
  CANCELLED: "neutral",
};

export const requestStatusTone: Record<RequestStatus, Tone> = {
  SUBMITTED: "warning",
  IN_REVIEW: "info",
  APPROVED: "primary",
  REJECTED: "danger",
  IN_PROGRESS: "info",
  DONE: "success",
};
