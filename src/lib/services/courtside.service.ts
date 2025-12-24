import { requirePermission, ServiceContext } from "@/types/service-context";
import {
  CancelCourtsideBooking,
  CreateCourtsideBooking,
  GetCourtsideBooking,
} from "../validations/courtside.validation";
import { UserType } from "@/types/prisma";

const BASE_URL = process.env.COURTSIDE_BASE_URL;

if (!BASE_URL) {
  throw new Error("COURTSIDE_BASE_URL is not defined");
}

/**
 * Function to fetch courtside booking data from the API.
 * Reference: https://documenter.getpostman.com/view/18532675/2sB2cYd13H#ce2d98c3-e61b-4e22-896f-892e82774d59
 */
export async function getCourtsideBooking(
  request: GetCourtsideBooking,
  context: ServiceContext,
) {
  const accessError = requirePermission(context, UserType.USER);
  if (accessError) return accessError;

  const response = await fetch(`${BASE_URL}/api/public/admin/schedule/list`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "API-KEY": request.apiKey,
    },
    body: JSON.stringify({
      date: request.bookingDate,
    }),
  });

  if (!response.ok) {
    throw new Error(`Courtside API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Function to create a courtside booking.
 * Reference: https://documenter.getpostman.com/view/18532675/2sB2cYd13H#5fdb3fd2-91b7-4346-9cba-6e79a979f5eb
 */
export async function createCourtsideBooking(
  request: CreateCourtsideBooking,
  context: ServiceContext,
) {
  const accessError = requirePermission(context, UserType.USER);
  if (accessError) return accessError;

  const { apiKey, ...bookingData } = request;

  const response = await fetch(`${BASE_URL}/api/public/admin/court-booking`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "API-KEY": apiKey,
    },
    body: JSON.stringify(bookingData),
  });

  if (!response.ok) {
    throw new Error(`Courtside API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Function to cancel a courtside booking.
 * This Function do not need ServiceContext as most likely will be called by system
 * Reference: https://documenter.getpostman.com/view/18532675/2sB2cYd13H#f0f840a6-5d49-4afb-bc62-0f7c20880b4b
 */
export async function cancelCourtsideBooking(request: CancelCourtsideBooking) {
  const { apiKey, ...cancelData } = request;

  const response = await fetch(
    `${BASE_URL}/api/public/admin/cancel-court-booking`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "API-KEY": apiKey,
      },
      body: JSON.stringify(cancelData),
    },
  );

  if (!response.ok) {
    throw new Error(`Courtside API error: ${response.status}`);
  }

  return response.json();
}
