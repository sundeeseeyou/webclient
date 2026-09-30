import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import type { ApiError } from "@/lib/api";

export type ApiResult<T> = { data: T; error: null } | { data: null; error: ApiError };

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
};

export async function apiRequest<T>(url: string, { method = "GET", body }: RequestOptions = {}): Promise<ApiResult<T>> {
  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    return { data: null, error: { message: "Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi." } };
  }

  if (!response.headers.get("content-type")?.includes("application/json")) {
    return { data: null, error: { message: "Terjadi kesalahan di server. Coba lagi beberapa saat." } };
  }
  return (await response.json()) as ApiResult<T>;
}

export function setFieldErrors<T extends FieldValues>(setError: UseFormSetError<T>, fields: Record<string, string> | undefined) {
  for (const [name, message] of Object.entries(fields ?? {})) {
    setError(name as Path<T>, { message });
  }
}
