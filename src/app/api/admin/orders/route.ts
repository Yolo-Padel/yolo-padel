import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-utils";
import { Role } from "@/types/prisma";
import { getAllOrdersForAdmin } from "@/lib/services/order.service";

const ALLOWED_ADMIN_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "FINANCE"];

export async function GET(request: NextRequest) {
  try {
    const tokenResult = await verifyAuth(request);
    if (!tokenResult.isValid) {
      return NextResponse.json(
        { success: false, message: tokenResult.error },
        { status: 401 }
      );
    }

    const { user } = tokenResult;
    if (!user || !ALLOWED_ADMIN_ROLES.includes(user.role as Role)) {
      return NextResponse.json(
        { success: false, message: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const orders = await getAllOrdersForAdmin();

    return NextResponse.json({
      success: true,
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    console.error("[API] Admin get all orders error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}

