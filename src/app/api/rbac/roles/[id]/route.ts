import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-utils";
import { UserType } from "@/types/prisma";
import {
  getRoleById,
  updateRole,
  deleteRole,
  type UpdateRoleInput,
} from "@/lib/services/rbac.service";

// Admin roles that can access RBAC endpoints
const ALLOWED_ADMIN_ROLES: UserType[] = [UserType.ADMIN, UserType.STAFF];

/**
 * GET /api/rbac/roles/[id]
 * Get a specific role by ID with full details
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
    if (!user || !ALLOWED_ADMIN_ROLES.includes(user.userType)) {
      return NextResponse.json(
        { success: false, message: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Extract role ID from params
    const { id: roleId } = await params;

    // Get role by ID from service
    const role = await getRoleById(roleId);

    return NextResponse.json(
      {
        success: true,
        message: "Role retrieved successfully",
        data: role,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API] Get role by ID error:", error);

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
          error instanceof Error ? error.message : "Failed to retrieve role",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/rbac/roles/[id]
 * Update a specific role
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
    if (!user || !ALLOWED_ADMIN_ROLES.includes(user.userType)) {
      return NextResponse.json(
        { success: false, message: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Extract role ID from params
    const { id: roleId } = await params;

    // Parse and validate request body
    let body: UpdateRoleInput;
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

    // Validate that at least one field is provided
    if (
      body.name === undefined &&
      body.description === undefined &&
      body.isActive === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Validation error: at least one field (name, description, isActive) must be provided",
        },
        { status: 400 }
      );
    }

    // Validate name if provided
    if (
      body.name !== undefined &&
      (typeof body.name !== "string" || body.name.trim() === "")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error: name must be a non-empty string",
        },
        { status: 400 }
      );
    }

    // Update role using service
    const updatedRole = await updateRole(roleId, {
      name: body.name ? body.name.trim() : undefined,
      description: body.description,
      isActive: body.isActive,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Role updated successfully",
        data: updatedRole,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API] Update role error:", error);

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
          error instanceof Error ? error.message : "Failed to update role",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/rbac/roles/[id]
 * Delete a specific role
 */
export async function DELETE(
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
    if (!user || !ALLOWED_ADMIN_ROLES.includes(user.userType)) {
      return NextResponse.json(
        { success: false, message: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Extract role ID from params
    const { id: roleId } = await params;

    // Delete role using service
    await deleteRole(roleId);

    // Return 204 No Content for successful deletion
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[API] Delete role error:", error);

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

    // Handle role assigned to users error
    if (error instanceof Error && error.message.includes("assigned to users")) {
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
          error instanceof Error ? error.message : "Failed to delete role",
      },
      { status: 500 }
    );
  }
}
