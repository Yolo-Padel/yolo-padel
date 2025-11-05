import { NextRequest, NextResponse } from "next/server";
import { getOrderById, updateOrderStatus } from "@/lib/services/order.service";
import { updateOrderStatusSchema } from "@/lib/validations/order.validation";
import { validateRequest } from "@/lib/validate-request";
import { syncOrderStatusToBookings } from "@/lib/services/status-sync.service";

/**
 * GET /api/order/[id]
 * Get order by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await validateRequest();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const orderId = params.id;

    // Get order
    const order = await getOrderById(orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Check if user owns this order
    if (order.userId !== user.id) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order retrieved successfully",
      data: order,
    });
  } catch (error) {
    console.error("[API] Get order error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to get order",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/order/[id]
 * Update order status (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await validateRequest();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, message: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const orderId = params.id;
    const body = await request.json();

    // Validate request body
    const validation = updateOrderStatusSchema.safeParse({
      orderId,
      status: body.status,
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Update order status with cascading updates
    await syncOrderStatusToBookings(data.orderId, data.status);

    // Get updated order
    const updatedOrder = await getOrderById(data.orderId);

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("[API] Update order status error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to update order status",
      },
      { status: 500 }
    );
  }
}

