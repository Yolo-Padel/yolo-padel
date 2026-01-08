import {
  CancelAyoBookingSchema,
  CreateAyoBookingSchema,
} from "../validations/ayo.validation";
import crypto from "crypto";
import { bookingService } from "./booking.service";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@/types/prisma";
import { customAlphabet } from "nanoid";

// Ayo webhook payload type
export interface AyoWebhookBookingPayload {
  order_detail_id: number;
  booking_id: string;
  field_id: number;
  field_name: string;
  date: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: string;
  booker_name: string;
  booker_phone: string;
  booker_email: string;
  booking_source: string;
  created_at: string;
}

export interface CreateReservationResponse {
  error: boolean;
  data: CreateReservationData;
  message: string;
  status_code: number;
  signature: string;
}

export interface CreateReservationData {
  id: number;
  order_detail_id: number;
  booking_id: string;
  field_name: string;
  date: Date;
  start_time: string;
  end_time: string;
  booking_source: string;
  total_price: number;
  user: User;
  token: string;
}

export interface User {
  name: string;
  email: string;
  phone: string;
}

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

const AYO_API_TOKEN = getRequiredEnv("AYO_API_TOKEN");
const AYO_HOST = getRequiredEnv("AYO_HOST");
const AYO_PRIVATE_KEY = getRequiredEnv("AYO_PRIVATE_KEY");
const BASE_URL = "api/v2/third-party";

function sortObjectByKey<T extends Record<string, unknown>>(object: T): T {
  return Object.fromEntries(
    Object.entries(object).sort(([a], [b]) => a.localeCompare(b)),
  ) as T;
}

export async function createAyoBooking(
  request: CreateAyoBookingSchema,
  createdBookingInternalId: string,
) {
  console.log("RAW request: ", request);
  const requestWithToken = {
    ...request,
    token: AYO_API_TOKEN,
  };

  const sortedRequest = sortObjectByKey(requestWithToken);

  const queryString = new URLSearchParams(
    Object.entries(sortedRequest).map(([key, value]) => [key, String(value)]),
  ).toString();

  const signature = crypto
    .createHmac("sha512", AYO_PRIVATE_KEY)
    .update(queryString)
    .digest("hex");

  const requestWithSignature = {
    ...sortedRequest,
    signature,
  };

  const response = await fetch(`${AYO_HOST}/${BASE_URL}/create-reservation`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestWithSignature),
  });

  const data = (await response.json()) as CreateReservationResponse;

  console.log("RESPONSE AYOOOO: ", data);

  if (data.error) {
    console.error("ERROR BES: ", data);
    return data;
  }
  //Store Order Id for Cancel Reservation Purpose
  bookingService.storeAyoOrderId(
    createdBookingInternalId,
    data.data.order_detail_id,
  );

  return data;
}

export async function cancelAyoBooking(request: CancelAyoBookingSchema) {
  const requestWithToken = {
    token: AYO_API_TOKEN,
    order_detail_id: request.order_detail_id,
  };

  const sortedRequest = sortObjectByKey(requestWithToken);

  const queryString = new URLSearchParams(
    Object.entries(sortedRequest).map(([key, value]) => [key, String(value)]),
  ).toString();

  const signature = crypto
    .createHmac("sha512", AYO_PRIVATE_KEY)
    .update(queryString)
    .digest("hex");

  const requestWithSignature = {
    ...sortedRequest,
    signature,
  };

  const response = await fetch(`${AYO_HOST}/${BASE_URL}/cancel-reservation`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestWithSignature),
  });

  const data = await response.json();

  console.log("RESPONSE AYOOOO: ", data);

  return data;
}

/**
 * Handle CONFIRMED status from Ayo webhook
 * Creates a new booking in our system with source = "AYO"
 */
export async function handleAyoBookingConfirmed(
  payload: AyoWebhookBookingPayload,
) {
  try {
    const {
      order_detail_id,
      field_id,
      date,
      start_time,
      end_time,
      total_price,
    } = payload;

    // Find court by ayoFieldId
    const court = await prisma.court.findFirst({
      where: { ayoFieldId: field_id },
      include: { venue: true },
    });

    if (!court) {
      console.error(`Court not found for ayoFieldId: ${field_id}`);
      return {
        success: false,
        message: `Court not found for ayoFieldId: ${field_id}`,
      };
    }

    // Parse date and times
    const bookingDate = new Date(date);
    const openHour = start_time.substring(0, 5); // "HH:mm"
    const closeHour = end_time.substring(0, 5);

    // Calculate duration in hours
    const [startH, startM] = openHour.split(":").map(Number);
    const [endH, endM] = closeHour.split(":").map(Number);
    const duration = (endH * 60 + endM - (startH * 60 + startM)) / 60;

    // Generate booking code
    const nanoId = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 5);
    const bookingCode = `BK-AYO-${nanoId()}`;

    // Create booking with UPCOMING status, no userId (AYO booking)
    const booking = await prisma.booking.create({
      data: {
        courtId: court.id,
        userId: null, // No user for AYO bookings
        orderId: null,
        source: "AYO",
        bookingDate,
        bookingCode,
        duration,
        totalPrice: total_price,
        status: BookingStatus.UPCOMING,
        ayoOrderIds: [order_detail_id],
        timeSlots: {
          create: [{ openHour, closeHour }],
        },
      },
      include: {
        timeSlots: true,
        court: true,
      },
    });

    console.log(
      `AYO booking created: ${booking.id} for order_detail_id: ${order_detail_id}`,
    );

    return {
      success: true,
      data: booking,
      message: "Booking created from AYO webhook",
    };
  } catch (error) {
    console.error("handleAyoBookingConfirmed error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create booking from AYO",
    };
  }
}

/**
 * Handle CANCELLED status from Ayo webhook
 * Updates existing booking status to CANCELLED by ayoOrderId
 */
export async function handleAyoBookingCancelled(orderDetailId: number) {
  try {
    // Find booking that contains this ayoOrderId
    const booking = await prisma.booking.findFirst({
      where: {
        ayoOrderIds: { has: orderDetailId },
      },
    });

    if (!booking) {
      console.error(`Booking not found for ayoOrderId: ${orderDetailId}`);
      return {
        success: false,
        message: `Booking not found for ayoOrderId: ${orderDetailId}`,
      };
    }

    // Update booking status to CANCELLED
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: BookingStatus.CANCELLED },
    });

    console.log(
      `AYO booking cancelled: ${booking.id} for order_detail_id: ${orderDetailId}`,
    );

    return {
      success: true,
      data: updatedBooking,
      message: "Booking cancelled from AYO webhook",
    };
  } catch (error) {
    console.error("handleAyoBookingCancelled error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to cancel booking from AYO",
    };
  }
}
