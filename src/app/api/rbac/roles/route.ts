import { NextRequest, NextResponse } from "next/server";
import { rbacService } from "@/lib/services/role-access-control.service";
import {
  createRoleSchema,
} from "@/lib/validations/rbac.validation";
import type { ApiResponse } from "@/types/rbac";

export async function GET() {
  try {
    const roles = await rbacService.getRoles();

    return NextResponse.json<ApiResponse<typeof roles>>({
      success: true,
      data: roles,
    });
  } catch (error) {
    console.error("GET /api/rbac/roles error:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Gagal mengambil data role",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const data = createRoleSchema.parse(payload);
    const newRole = await rbacService.createRole(data);

    return NextResponse.json<ApiResponse<typeof newRole>>(
      {
        success: true,
        data: newRole,
        message: "Role berhasil dibuat",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/rbac/roles error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: error.message,
          errors: error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Gagal membuat role",
      },
      { status: 500 }
    );
  }
}

