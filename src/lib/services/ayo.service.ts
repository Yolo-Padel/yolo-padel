import {
  CancelAyoBookingSchema,
  CreateAyoBookingSchema,
} from "../validations/ayo.validation";
import crypto from "crypto";
import { bookingService } from "./booking.service";

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
