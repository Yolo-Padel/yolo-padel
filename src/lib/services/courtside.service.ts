import { requirePermission, ServiceContext } from "@/types/service-context";
import { GetCourtsideBooking } from "../validations/courtside.validation";
import { UserType } from "@/types/prisma";

const BASE_URL = process.env.COURTSIDE_BASE_URL;

if (!BASE_URL) {
  throw new Error("COURTSIDE_BASE_URL is not defined");
}

/**
 * Function to fetch courtside booking data from the API.
 * Reference: https://documenter.getpostman.com/view/18532675/2sB2cYd13H#ce2d98c3-e61b-4e22-896f-892e82774d59
 * @param apiKey
 * @param bookingDate
 * @returns
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
