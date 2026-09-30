import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import type { z } from "zod";

export type ApiError = {
  message: string;
  fields?: Record<string, string>;
};

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data, error: null }, { status });
}

export function fail(message: string, status = 400, fields?: Record<string, string>) {
  const error: ApiError = fields ? { message, fields } : { message };
  return NextResponse.json({ data: null, error }, { status });
}

// Dipakai juga untuk data milik klien lain: 404, bukan 403, agar keberadaan data tidak bocor.
export function notFound() {
  return fail("Data tidak ditemukan.", 404);
}

export function validationError(error: z.ZodError) {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (key && !fields[key]) fields[key] = issue.message;
  }
  return fail("Periksa kembali isian Anda.", 400, fields);
}

export async function parseBody<S extends z.ZodType>(
  request: Request,
  schema: S,
): Promise<{ data: z.output<S>; response?: never } | { data?: never; response: NextResponse }> {
  let json: unknown = null;
  try {
    json = await request.json();
  } catch {
    return { response: fail("Format data tidak valid.") };
  }
  const result = schema.safeParse(json);
  return result.success ? { data: result.data } : { response: validationError(result.error) };
}

export function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}
