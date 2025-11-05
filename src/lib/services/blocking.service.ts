import { prisma } from "@/lib/prisma";
import { Blocking } from "@/types/prisma";

/**
 * Create a blocking for a booking
 * Locks the time slots so they're not available for other bookings
 */
export async function createBlocking(
  bookingId: string,
  description: string = "Booking slot locked"
): Promise<Blocking> {
  const blocking = await prisma.blocking.create({
    data: {
      bookingId,
      description,
      isBlocking: true,
    },
  });

  return blocking;
}

/**
 * Release a blocking (set isBlocking to false)
 * Makes the time slots available again
 */
export async function releaseBlocking(blockingId: string): Promise<Blocking> {
  const blocking = await prisma.blocking.update({
    where: { id: blockingId },
    data: { isBlocking: false },
  });

  return blocking;
}

/**
 * Release blocking by booking ID
 */
export async function releaseBlockingByBookingId(
  bookingId: string
): Promise<Blocking | null> {
  const blocking = await prisma.blocking.findUnique({
    where: { bookingId },
  });

  if (!blocking) {
    return null;
  }

  return await releaseBlocking(blocking.id);
}

/**
 * Release multiple blockings at once (bulk operation)
 * Used when cancelling multiple bookings in an order
 */
export async function releaseBlockings(
  blockingIds: string[]
): Promise<number> {
  const result = await prisma.blocking.updateMany({
    where: {
      id: { in: blockingIds },
    },
    data: { isBlocking: false },
  });

  return result.count;
}

/**
 * Release blockings by booking IDs
 */
export async function releaseBlockingsByBookingIds(
  bookingIds: string[]
): Promise<number> {
  const result = await prisma.blocking.updateMany({
    where: {
      bookingId: { in: bookingIds },
    },
    data: { isBlocking: false },
  });

  return result.count;
}

/**
 * Get active blockings (isBlocking = true)
 * Used for checking slot availability
 */
export async function getActiveBlockings(
  courtId: string,
  date: Date
): Promise<
  Array<{
    id: string;
    bookingId: string;
    isBlocking: boolean;
    booking: {
      id: string;
      courtId: string;
      bookingDate: Date;
      timeSlots: Array<{
        openHour: string;
        closeHour: string;
      }>;
    };
  }>
> {
  // Normalize date to start of day for comparison
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const blockings = await prisma.blocking.findMany({
    where: {
      isBlocking: true,
      booking: {
        courtId,
        bookingDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    },
    select: {
      id: true,
      bookingId: true,
      isBlocking: true,
      booking: {
        select: {
          id: true,
          courtId: true,
          bookingDate: true,
          timeSlots: {
            select: {
              openHour: true,
              closeHour: true,
            },
          },
        },
      },
    },
  });

  return blockings;
}

/**
 * Check if a specific time slot is blocked
 */
export async function isSlotBlocked(
  courtId: string,
  date: Date,
  slotOpenHour: string,
  slotCloseHour: string
): Promise<boolean> {
  const activeBlockings = await getActiveBlockings(courtId, date);

  // Check if any blocking overlaps with the requested slot
  for (const blocking of activeBlockings) {
    for (const slot of blocking.booking.timeSlots) {
      if (
        slot.openHour === slotOpenHour &&
        slot.closeHour === slotCloseHour
      ) {
        return true; // Slot is blocked
      }
    }
  }

  return false; // Slot is available
}

/**
 * Get blocking by booking ID
 */
export async function getBlockingByBookingId(
  bookingId: string
): Promise<Blocking | null> {
  const blocking = await prisma.blocking.findUnique({
    where: { bookingId },
  });

  return blocking;
}

