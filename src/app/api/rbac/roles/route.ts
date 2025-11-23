import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-utils";
import { Role } from "@/types/prisma";
import {
  getAllRoles,
  createRole,
  type CreateRoleInput,
} from "@/lib/services/rbac.service";

// Admin roles that can access RBAC endpoints
const ALLOWED_ADMIN_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN"];

/**
 * GET /api/rbac/roles
 * Get all roles with permission counts
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

    // Get all roles from service
    const roles = await getAllRoles();

    return NextResponse.json(
      {
        success: true,
        message: "Roles retrieved successfully",
        data: roles,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API] Get roles error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to retrieve roles",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rbac/roles
 * Create a new role
 */
export async function POST(request: NextRequest) {
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

    // Parse and validate request body
    let body: CreateRoleInput;
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

    // Validate required fields
    if (
      !body.name ||
      typeof body.name !== "string" ||
      body.name.trim() === ""
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Validation error: name is required and must be a non-empty string",
        },
        { status: 400 }
      );
    }

    // Create role using service
    const role = await createRole({
      name: body.name.trim(),
      description: body.description,
      isActive: body.isActive,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Role created successfully",
        data: role,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Create role error:", error);

    // Handle duplicate name error
    if (error instanceof Error && error.message.includes("already exists")) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 409 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to create role",
      },
      { status: 500 }
    );
  }
}
