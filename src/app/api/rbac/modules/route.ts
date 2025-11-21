import { NextResponse } from "next/server";
import { rbacService } from "@/lib/services/role-access-control.service";
import type { ApiResponse, ModulesResponsePayload } from "@/types/rbac";

export async function GET() {
  try {
    const [modules, permissions] = await Promise.all([
      rbacService.getModules(),
      rbacService.getPermissions(),
    ]);

    const payload: ModulesResponsePayload = {
      modules,
      permissions,
    };

    return NextResponse.json<ApiResponse<ModulesResponsePayload>>({
      success: true,
      data: payload,
    });
  } catch (error) {
    console.error("GET /api/rbac/modules error:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Gagal mengambil data modul",
      },
      { status: 500 }
    );
  }
}

