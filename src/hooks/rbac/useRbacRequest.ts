import type { ApiResponse } from "@/types/rbac";

interface RequestResult<T> {
  data: T | null;
  message?: string;
}

export async function rbacRequest<T>(
  url: string,
  init: RequestInit = {}
): Promise<RequestResult<T>> {
  const response = await fetch(url, {
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  const json = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!json || !response.ok || !json.success) {
    const message =
      json?.message ??
      (response.statusText || "Permintaan RBAC gagal diproses");
    throw new Error(message);
  }

  return {
    data: json.data ?? null,
    message: json.message,
  };
}

