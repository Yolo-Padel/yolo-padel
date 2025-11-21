import { NextRequest, NextResponse } from "next/server";
import { rbacService } from "@/lib/services/role-access-control.service";
import { updateRolePermissionsSchema } from "@/lib/validations/rbac.validation";
import type { ApiResponse } from "@/types/rbac";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(_: NextRequest, { params }: RouteParams) {
  try {
    const permissions = await rbacService.getPermissionsByRole(params.id);

    return NextResponse.json<ApiResponse<typeof permissions>>({
      success: true,
      data: permissions,
    });
  } catch (error) {
    console.error(
      `GET /api/rbac/roles/${params.id}/permissions error:`,
      error
    );
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Gagal mengambil permission role",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const payload = await request.json();
    const data = updateRolePermissionsSchema.parse(payload);

    await Promise.all(
      data.permissions.map((permission) =>
        rbacService.updateRolePermission(
          params.id,
          permission.moduleId,
          permission.permissionId,
          permission.allowed
        )
      )
    );

    const updated = await rbacService.getPermissionsByRole(params.id);

    return NextResponse.json<ApiResponse<typeof updated>>({
      success: true,
      data: updated,
      message: "Permission role berhasil diperbarui",
    });
  } catch (error) {
    console.error(
      `PUT /api/rbac/roles/${params.id}/permissions error:`,
      error
    );

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
        message: "Gagal memperbarui permission role",
      },
      { status: 500 }
    );
  }
}

