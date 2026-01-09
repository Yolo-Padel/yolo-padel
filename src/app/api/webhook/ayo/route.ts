import { NextRequest, NextResponse } from "next/server";
import {
  handleAyoBookingConfirmed,
  handleAyoBookingCancelled,
} from "@/lib/services/ayo.service";

// Ayo webhook payload types
interface AyoWebhookPayload {
  order_detail_id: number;
  booking_id: string;
  field_id: number;
  field_name: string;
  date: string; // "YYYY-MM-DD"
  start_time: string; // "HH:mm:ss"
  end_time: string; // "HH:mm:ss"
  total_price: number;
  status: "CONFIRMED" | "CANCELLED" | string;
  booker_name: string;
  booker_phone: string;
  booker_email: string;
  booking_source: string;
  created_at: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log("AYO WEBHOOK PAYLOAD: ", request);
    const payload = (await request.json()) as AyoWebhookPayload[];
    console.log("AYO WEBHOOK PAYLOAD: ", payload);

    if (!Array.isArray(payload) || payload.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid payload format" },
        { status: 400 },
      );
    }

    const results = [];

    for (const item of payload) {
      const { status, order_detail_id } = item;

      if (status === "CONFIRMED") {
        const result = await handleAyoBookingConfirmed(item);
        results.push({ order_detail_id, status, result });
      } else if (status === "CANCELLED") {
        const result = await handleAyoBookingCancelled(order_detail_id);
        results.push({ order_detail_id, status, result });
      } else {
        results.push({
          order_detail_id,
          status,
          result: { success: false, message: `Unhandled status: ${status}` },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Webhook processed",
      results,
    });
  } catch (error) {
    console.error("Ayo webhook error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Webhook processing failed",
      },
      { status: 500 },
    );
  }
}
