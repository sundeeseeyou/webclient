import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Bentuk pesan yang dikirim ke browser: tanggal sebagai teks ISO agar sama antara props halaman dan respons API.
export type ThreadMessage = {
  id: string;
  body: string;
  createdAt: string;
  sender: { id: string; name: string };
};

const messageSelect = {
  id: true,
  body: true,
  createdAt: true,
  sender: { select: { id: true, name: true } },
} satisfies Prisma.MessageSelect;

type MessageRow = Prisma.MessageGetPayload<{ select: typeof messageSelect }>;

function toThreadMessage(message: MessageRow): ThreadMessage {
  return { ...message, createdAt: message.createdAt.toISOString() };
}

export async function getProjectMessages(projectId: string): Promise<ThreadMessage[]> {
  const messages = await prisma.message.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    select: messageSelect,
  });
  return messages.map(toThreadMessage);
}

export async function createProjectMessage(projectId: string, senderId: string, body: string): Promise<ThreadMessage> {
  const message = await prisma.message.create({ data: { projectId, senderId, body }, select: messageSelect });
  return toThreadMessage(message);
}

export function messageSnippet(body: string, max = 80): string {
  const text = body.replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}
