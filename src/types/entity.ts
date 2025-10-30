export const ENTITY_TYPES = {
    VENUE: "Venue",
    COURT: "Court",
    BOOKING: "Booking",
    USER: "User",
    INVOICE: "Invoice",
  } as const
  
export type EntityType = typeof ENTITY_TYPES[keyof typeof ENTITY_TYPES]