import { NextRequest, NextResponse } from "next/server";
import { createOrder, getOrdersByUserId } from "@/lib/services/order.service";
import {
  createOrderSchema,
  getUserOrdersSchema,
} from "@/lib/validations/order.validation";
import { verifyAuth } from "@/lib/auth-utils";
import { createServiceContext } from "@/types/service-context";

/**
 * POST /api/order
 * Create a new order with multiple bookings
 */
export async function POST(request: NextRequest) {
  try {
    const tokenResult = await verifyAuth(request);
    if (!tokenResult.isValid) {
      return NextResponse.json(
        { success: false, message: tokenResult.error },
        { status: 401 }
      );
    }
    const { user } = tokenResult;

    // Validate userId from token
    if (!user.userId || typeof user.userId !== "string") {
      console.error("[API] Invalid userId from token:", user);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user authentication",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validation = createOrderSchema.safeParse({
      ...body,
      userId: user.userId,
    });

    if (!validation.success) {
      console.error("[API] Order validation error:", {
        userId: user.userId,
        userIdType: typeof user.userId,
        userIdLength: user.userId?.length,
        validationErrors: validation.error.format(),
      });
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: validation.error.format(),
          debug: {
            userId: user.userId,
            userIdType: typeof user.userId,
            userIdLength: user.userId?.length,
          },
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    console.log("PAYLOADDD ORDER", data);

    // Create ServiceContext for activity logging
    // Requirements 7.1: Order service functions accept optional ServiceContext
    const serviceContext = createServiceContext(
      user.userType,
      user.userId,
      user.assignedVenueIds
    );

    // Create order with bookings
    // Pass fee breakdown fields (taxAmount, bookingFee) to service
    // Requirements: 1.1, 2.1, 3.1
    const order = await createOrder(
      {
        userId: data.userId,
        bookings: data.bookings.map((booking) => ({
          courtId: booking.courtId,
          date: booking.date,
          slots: booking.slots,
          price: booking.price,
        })),
        channelName: data.channelName,
        // Fee breakdown fields (default to 0 if not provided)
        taxAmount: data.taxAmount,
        bookingFee: data.bookingFee,
      },
      serviceContext
    );

    // Response includes fee breakdown per Requirements 1.3, 2.3, 3.3
    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        data: order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Create order error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to create order",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/order
 * Get user's orders with pagination and optional status filter
 */
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

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || undefined;

    // Validate query params
    const validation = getUserOrdersSchema.safeParse({
      userId: user.userId,
      page,
      limit,
      status,
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: validation.error,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Get orders
    const result = await getOrdersByUserId(data.userId, {
      page: data.page,
      limit: data.limit,
      status: data.status,
    });

    return NextResponse.json({
      success: true,
      message: "Orders retrieved successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("[API] Get orders error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to get orders",
      },
      { status: 500 }
    );
  }
}
