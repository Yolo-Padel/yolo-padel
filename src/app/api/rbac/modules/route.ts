import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-utils";
import { Role } from "@/types/prisma";
import { getAllModules, getAllPermissions } from "@/lib/services/rbac.service";

// Admin roles that can access RBAC endpoints
const ALLOWED_ADMIN_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN"];

/**
 * GET /api/rbac/modules
 * Get all modules and permissions ordered appropriately
 */
export async function GET(request: NextRequest) {
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

    // Get all modules and permissions from service
    const modules = await getAllModules();
    const permissions = await getAllPermissions();

    return NextResponse.json(
      {
        success: true,
        message: "Modules and permissions retrieved successfully",
        data: { modules, permissions },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API] Get modules error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to retrieve modules and permissions",
      },
      { status: 500 }
    );
  }
}
