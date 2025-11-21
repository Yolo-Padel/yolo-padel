import { NextRequest, NextResponse } from "next/server";
import { rbacService } from "@/lib/services/role-access-control.service";
import { updateRoleSchema } from "@/lib/validations/rbac.validation";
import type { ApiResponse } from "@/types/rbac";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(_: NextRequest, { params }: RouteParams) {
  try {
    const role = await rbacService.getRoleById(params.id);

    if (!role) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Role tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<typeof role>>({
      success: true,
      data: role,
    });
  } catch (error) {
    console.error(`GET /api/rbac/roles/${params.id} error:`, error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Gagal mengambil detail role",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const payload = await request.json();
    const data = updateRoleSchema.parse(payload);
    const updated = await rbacService.updateRole(params.id, data);

    return NextResponse.json<ApiResponse<typeof updated>>({
      success: true,
      data: updated,
      message: "Role berhasil diperbarui",
    });
  } catch (error) {
    console.error(`PATCH /api/rbac/roles/${params.id} error:`, error);

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
        message: "Gagal memperbarui role",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_: NextRequest, { params }: RouteParams) {
  try {
    await rbacService.deleteRole(params.id);

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: "Role berhasil dihapus",
    });
  } catch (error) {
    console.error(`DELETE /api/rbac/roles/${params.id} error:`, error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Gagal menghapus role",
      },
      { status: 500 }
    );
  }
}

