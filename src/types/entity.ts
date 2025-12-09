export const ENTITY_TYPES = {
  VENUE: "Venue",
  COURT: "Court",
  BOOKING: "Booking",
  ORDER: "Order",
  USER: "User",
  INVOICE: "Invoice",
  PAYMENT: "Payment",
  ROLE: "Role",
  DYNAMIC_PRICE: "Dynamic Price",
} as const;

export type EntityType = (typeof ENTITY_TYPES)[keyof typeof ENTITY_TYPES];
