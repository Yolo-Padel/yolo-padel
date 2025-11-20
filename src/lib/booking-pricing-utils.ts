import type { DynamicPrice } from "@/components/timetable-types";

const DAY_OF_WEEK_MAP = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;

/**
 * Convert UI slot format to start hour in "HH:MM" format
 * UI format: "HH.mm–HH.mm" (e.g., "10.00–11.00")
 * Returns: "HH:MM" (e.g., "10:00")
 */
const extractStartHour = (uiSlot: string): string => {
  // Handle UI format: "10.00–11.00" -> "10:00"
  const startPart = uiSlot.split("–")[0]?.trim() || uiSlot.split("-")[0]?.trim() || "";
  return startPart.replace(".", ":");
};

/**
 * Get end hour from UI slot format
 * UI format: "HH.mm–HH.mm" (e.g., "10.00–11.00")
 * Returns: "HH:MM" (e.g., "11:00")
 */
const extractEndHour = (uiSlot: string): string => {
  const parts = uiSlot.split("–").length > 1 ? uiSlot.split("–") : uiSlot.split("-");
  const endPart = parts[1]?.trim() || "";
  return endPart.replace(".", ":");
};

/**
 * Check if dynamic price matches the given date
 */
const matchesDate = (price: DynamicPrice, date: Date): boolean => {
  if (price.date) {
    const priceDate = new Date(price.date);
    return (
      priceDate.getFullYear() === date.getFullYear() &&
      priceDate.getMonth() === date.getMonth() &&
      priceDate.getDate() === date.getDate()
    );
  }

  if (price.dayOfWeek) {
    const dayName = DAY_OF_WEEK_MAP[date.getDay()];
    return price.dayOfWeek === dayName;
  }

  return false;
};

/**
 * Check if time slot overlaps with dynamic price time range
 * Slot format: "HH.mm–HH.mm" (UI format) or "HH:MM" (start hour only)
 */
const matchesTimeSlot = (
  slot: string,
  priceStartHour: string,
  priceEndHour: string
): boolean => {
  // Extract start and end hour from slot
  const slotStart = extractStartHour(slot);
  const slotEnd = extractEndHour(slot);

  // Check overlap: slot overlaps if slotStart < priceEndHour && slotEnd > priceStartHour
  return slotStart < priceEndHour && slotEnd > priceStartHour;
};

/**
 * Calculate price for a single time slot
 * Returns dynamic price if match found, otherwise returns default price
 *
 * @param slot - Time slot in UI format "HH.mm–HH.mm" (e.g., "10.00–11.00")
 * @param date - Booking date
 * @param defaultPrice - Default court price
 * @param dynamicPrices - Array of dynamic prices for the court
 * @returns Price for the slot
 */
export function calculateSlotPrice(
  slot: string,
  date: Date,
  defaultPrice: number,
  dynamicPrices: DynamicPrice[]
): number {
  // Find matching dynamic price
  for (const price of dynamicPrices) {
    if (!price.isActive) continue;
    if (!matchesDate(price, date)) continue;
    if (matchesTimeSlot(slot, price.startHour, price.endHour)) {
      return price.price;
    }
  }

  // No dynamic price found, return default
  return defaultPrice;
}

/**
 * Calculate total price for multiple slots
 *
 * @param slots - Array of time slots in UI format "HH.mm–HH.mm" (e.g., "10.00–11.00")
 * @param date - Booking date
 * @param defaultPrice - Default court price
 * @param dynamicPrices - Array of dynamic prices for the court
 * @returns Object with pricesPerSlot array and totalPrice
 */
export function calculateSlotsPrice(
  slots: string[],
  date: Date,
  defaultPrice: number,
  dynamicPrices: DynamicPrice[]
): {
  pricesPerSlot: number[];
  totalPrice: number;
} {
  const pricesPerSlot = slots.map((slot) =>
    calculateSlotPrice(slot, date, defaultPrice, dynamicPrices)
  );

  const totalPrice = pricesPerSlot.reduce((sum, price) => sum + price, 0);

  return {
    pricesPerSlot,
    totalPrice,
  };
}

