/**
 * Timetable Configuration Constants
 * Centralized configuration for timetable component and related utilities
 */

/**
 * Operating hours configuration
 */
export const TIMETABLE_HOURS = {
  /** Start hour for timetable (24-hour format) */
  START: 6,
  /** End hour for timetable (24-hour format) */
  END: 24,
  /** Total number of time slots (END - START) */
  get SLOT_COUNT() {
    return this.END - this.START;
  },
} as const;

/**
 * Cache and data fetching configuration
 */
export const TIMETABLE_CACHE = {
  /** Cache duration for blocking data (milliseconds) */
  BLOCKING_STALE_TIME: 30_000, // 30 seconds - blockings change frequently
  /** Cache duration for court data (milliseconds) */
  COURT_STALE_TIME: 120_000, // 2 minutes
  /** Cache duration for venue data (milliseconds) */
  VENUE_STALE_TIME: 300_000, // 5 minutes
} as const;

/**
 * Skeleton loading configuration
 */
export const TIMETABLE_SKELETON = {
  /** Default number of courts to show in skeleton */
  DEFAULT_COURTS: 5,
  /** Default number of time slots to show in skeleton */
  DEFAULT_TIME_SLOTS: 18, // 6:00 - 23:00
  /** Interval for showing "booked" skeleton cells (every Nth cell) */
  BOOKED_CELL_INTERVAL: 7,
} as const;

/**
 * UI dimension configuration
 */
export const TIMETABLE_UI = {
  /** Width of venue selector dropdown */
  VENUE_SELECTOR_WIDTH: "280px",
  /** Minimum width of court name column */
  COURT_COLUMN_MIN_WIDTH: "180px",
  /** Minimum width of time slot columns */
  TIME_SLOT_MIN_WIDTH: "100px",
} as const;

/**
 * Time format patterns
 */
export const TIME_FORMAT = {
  /** Standard 24-hour format (HH:mm) */
  STANDARD: "HH:mm",
  /** Display format with dots (HH.mm) */
  DISPLAY: "HH.mm",
  /** Display format with AM/PM */
  DISPLAY_AMPM: "hh.mmA",
} as const;

/**
 * Date format patterns for display
 */
export const DATE_FORMAT = {
  /** Short format: "Mon, 14 Oct" */
  SHORT: "EEE, d MMM",
  /** Full format: "Monday, October 14, 2024" */
  FULL: "EEEE, MMMM d, yyyy",
  /** ISO format for API calls */
  ISO: "yyyy-MM-dd",
} as const;

/**
 * Booking status colors and styles
 */
export const BOOKING_COLORS = {
  /** Background color for booked cells */
  BOOKED_BG: "#ECF1BB",
  /** Hover background color for booked cells */
  BOOKED_HOVER: "#D4E6D5",
  /** Border color for primary actions */
  PRIMARY_BORDER: "brand",
} as const;

/**
 * Dynamic price cell colors and styles
 */
export const DYNAMIC_PRICE_COLORS = {
  /** Background color for dynamic price cells */
  ACTIVE_BG: "#FFF5E6",
  /** Hover background color for dynamic price cells */
  ACTIVE_HOVER: "#FFE8CC",
  /** Background color for inactive dynamic price cells */
  INACTIVE_BG: "#F2F4F7",
  /** Text color for inactive dynamic price cells */
  INACTIVE_TEXT: "#98A2B3",
  /** Border color for price configuration actions */
  PRIMARY_BORDER: "#F97316",
} as const;
