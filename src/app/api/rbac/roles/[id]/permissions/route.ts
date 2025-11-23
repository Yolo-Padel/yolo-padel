import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-utils";
import { Role } from "@/types/prisma";
import {
  getRolePermissions,
  updateRolePermissions,
  type RolePermissionUpdate,
} from "@/lib/services/rbac.service";

// Admin roles that can access RBAC endpoints
const ALLOWED_ADMIN_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN"];

/**
 * GET /api/rbac/roles/[id]/permissions
 * Get all permissions for a specific role
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const tokenResult = await verifyAuth(request);
    if (!tokenResult.isValid) {
      return NextResponse.json(
        { success: false, message: tokenResult.error },
        { status: 401 }
      );
    }

    const { user } = tokenResult;

    // Check if user has admin role
    if (!user || !ALLOWED_ADMIN_ROLES.includes(user.role as Role)) {
      return NextResponse.json(
        { success: false, message: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Extract role ID from params
    const { id: roleId } = await params;

    // Get role permissions from service
    const permissions = await getRolePermissions(roleId);

    return NextResponse.json(
      {
        success: true,
        message: "Role permissions retrieved successfully",
        data: permissions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API] Get role permissions error:", error);

    // Handle not found error
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 404 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to retrieve role permissions",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/rbac/roles/[id]/permissions
 * Update role permissions in bulk
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const tokenResult = await verifyAuth(request);
    if (!tokenResult.isValid) {
      return NextResponse.json(
        { success: false, message: tokenResult.error },
        { status: 401 }
      );
    }

    const { user } = tokenResult;

    // Check if user has admin role
    if (!user || !ALLOWED_ADMIN_ROLES.includes(user.role as Role)) {
      return NextResponse.json(
        { success: false, message: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Extract role ID from params
    const { id: roleId } = await params;

    // Parse and validate request body
    let body: { updates: RolePermissionUpdate[] };
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body format",
        },
        { status: 400 }
      );
    }

    // Validate updates array
    if (!Array.isArray(body.updates)) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error: updates must be an array",
        },
        { status: 400 }
      );
    }

    // Validate each update entry
    for (const update of body.updates) {
      if (
        !update.moduleId ||
        typeof update.moduleId !== "string" ||
        !update.permissionId ||
        typeof update.permissionId !== "string" ||
        typeof update.allowed !== "boolean"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Validation error: each update must have moduleId (string), permissionId (string), and allowed (boolean)",
          },
          { status: 400 }
        );
      }
    }

    // Update role permissions using service
    await updateRolePermissions(roleId, body.updates);

    return NextResponse.json(
      {
        success: true,
        message: "Role permissions updated successfully",
        data: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API] Update role permissions error:", error);

    // Handle not found error
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 404 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update role permissions",
      },
      { status: 500 }
    );
  }
}
