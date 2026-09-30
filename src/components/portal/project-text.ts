import type { ProjectStatus } from "@prisma/client";

// Penjelasan status dalam kalimat sederhana untuk klien non-teknis.
export const projectStatusNotes: Record<ProjectStatus, string> = {
  PLANNING: "Tim kami sedang menyiapkan rencana pekerjaan.",
  IN_PROGRESS: "Tim kami sedang mengerjakan proyek ini.",
  WAITING_APPROVAL: "Pekerjaan sudah selesai dan menunggu persetujuan Anda. Silakan periksa hasilnya.",
  REVISION: "Tim kami sedang mengerjakan revisi sesuai masukan Anda.",
  DONE: "Proyek sudah selesai.",
  ON_HOLD: "Proyek sedang ditunda sementara.",
};

export function progressSentence(progress: number, taskCount: number): string {
  if (taskCount === 0) return "Rincian pekerjaan sedang disusun oleh tim kami.";
  if (progress === 100) return "Semua pekerjaan sudah selesai.";
  return `Pekerjaan sudah ${progress}% selesai.`;
}
