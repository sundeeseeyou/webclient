import { type Prisma, RequestPriority, RequestStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isOverdue, overdueWhere } from "@/lib/sla";

const requestListInclude = {
  client: { select: { id: true, company: true } },
  website: { select: { id: true, domain: true } },
  project: { select: { id: true, name: true } },
} satisfies Prisma.SlaRequestInclude;

const CLOSED_STATUSES: RequestStatus[] = ["DONE", "REJECTED"];

export function isClosedRequest(status: RequestStatus): boolean {
  return CLOSED_STATUSES.includes(status);
}

type SortableRequest = { status: RequestStatus; overdue: boolean; dueAt: Date; updatedAt: Date };

// Kotak masuk admin: yang melewati SLA dulu, lalu batas respon terdekat; yang selesai/ditolak paling bawah.
function inboxRank(request: SortableRequest): number {
  if (request.overdue) return 0;
  return isClosedRequest(request.status) ? 2 : 1;
}

function compareInbox(a: SortableRequest, b: SortableRequest): number {
  const rank = inboxRank(a) - inboxRank(b);
  if (rank !== 0) return rank;
  if (inboxRank(a) === 2) return b.updatedAt.getTime() - a.updatedAt.getTime();
  return a.dueAt.getTime() - b.dueAt.getTime();
}

// "inbox" untuk admin, "newest" untuk klien yang lebih mudah membaca dari permintaan terbaru.
export async function listRequests(where: Prisma.SlaRequestWhereInput, order: "inbox" | "newest" = "inbox") {
  const now = new Date();
  const rows = await prisma.slaRequest.findMany({ where, include: requestListInclude, orderBy: { createdAt: "desc" } });
  const requests = rows.map((request) => ({ ...request, overdue: isOverdue(request, now) }));
  return order === "inbox" ? requests.sort(compareInbox) : requests;
}

export type RequestListItem = Awaited<ReturnType<typeof listRequests>>[number];

export type RequestFilters = {
  status?: RequestStatus;
  priority?: RequestPriority;
  clientId?: string;
  overdue: boolean;
};

// Nilai filter dari URL bisa berisi apa saja, jadi hanya nilai enum yang dikenal yang dipakai.
export function parseRequestFilters(query: Record<string, unknown>): RequestFilters {
  const { status, priority, clientId, overdue } = query;
  return {
    status: Object.values(RequestStatus).find((value) => value === status),
    priority: Object.values(RequestPriority).find((value) => value === priority),
    clientId: typeof clientId === "string" && clientId ? clientId : undefined,
    overdue: overdue === "1",
  };
}

export function requestFilterWhere(filters: RequestFilters): Prisma.SlaRequestWhereInput {
  return {
    ...(filters.status && { status: filters.status }),
    ...(filters.priority && { priority: filters.priority }),
    ...(filters.clientId && { clientId: filters.clientId }),
    ...(filters.overdue && overdueWhere()),
  };
}

export function hasActiveFilter(filters: RequestFilters): boolean {
  return Boolean(filters.status || filters.priority || filters.clientId || filters.overdue);
}
