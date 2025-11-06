import type { Court, Booking } from "./timetable-types";

// Dummy data untuk preview
export const dummyCourts: Court[] = [
  {
    id: "court-1",
    name: "Court 1",
    operatingHours: {
      openHour: "10:00",
      closeHour: "20:00",
    },
  },
  {
    id: "court-2",
    name: "Court 2",
    operatingHours: {
      openHour: "10:00",
      closeHour: "20:00",
    },
  },
  {
    id: "court-3",
    name: "Court 3",
    operatingHours: {
      openHour: "10:00",
      closeHour: "20:00",
    },
  },
  {
    id: "court-4",
    name: "Court 4",
    operatingHours: {
      openHour: "10:00",
      closeHour: "20:00",
    },
  },
  {
    id: "court-5",
    name: "Court 5",
    operatingHours: {
      openHour: "10:00",
      closeHour: "20:00",
    },
  },
];

// Helper untuk membuat date dengan waktu tertentu
function createDate(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day);
}

// Dummy bookings untuk hari ini
const today = new Date();
const todayYear = today.getFullYear();
const todayMonth = today.getMonth() + 1;
const todayDay = today.getDate();

export const dummyBookings: Booking[] = [
  {
    id: "booking-1",
    courtId: "court-1",
    userId: "user-1",
    userName: "Kartika Wibisono",
    userAvatar: undefined,
    bookingDate: createDate(todayYear, todayMonth, todayDay),
    timeSlots: [
      {
        openHour: "06:00",
        closeHour: "07:00",
      },
    ],
    status: "CONFIRMED",
  },
  {
    id: "booking-2",
    courtId: "court-2",
    userId: "user-2",
    userName: "Dina Kartika",
    userAvatar: undefined,
    bookingDate: createDate(todayYear, todayMonth, todayDay),
    timeSlots: [
      {
        openHour: "08:00",
        closeHour: "09:00",
      },
    ],
    status: "CONFIRMED",
  },
  {
    id: "booking-3",
    courtId: "court-3",
    userId: "user-3",
    userName: "Samantha Elsner",
    userAvatar: undefined,
    bookingDate: createDate(todayYear, todayMonth, todayDay),
    timeSlots: [
      {
        openHour: "10:00",
        closeHour: "11:00",
      },
    ],
    status: "CONFIRMED",
  },
  {
    id: "booking-4",
    courtId: "court-4",
    userId: "user-4",
    userName: "Kartika Wibisono",
    userAvatar: undefined,
    bookingDate: createDate(todayYear, todayMonth, todayDay),
    timeSlots: [
      {
        openHour: "07:00",
        closeHour: "08:00",
      },
    ],
    status: "CONFIRMED",
  },
  {
    id: "booking-5",
    courtId: "court-5",
    userId: "user-5",
    userName: "Dian Sandia",
    userAvatar: undefined,
    bookingDate: createDate(todayYear, todayMonth, todayDay),
    timeSlots: [
      {
        openHour: "10:00",
        closeHour: "11:00",
      },
    ],
    status: "CONFIRMED",
  },
  // Booking dengan multiple slots (spanning multiple hours)
  {
    id: "booking-6",
    courtId: "court-1",
    userId: "user-6",
    userName: "John Doe",
    userAvatar: undefined,
    bookingDate: createDate(todayYear, todayMonth, todayDay),
    timeSlots: [
      {
        openHour: "14:00",
        closeHour: "15:00",
      },
      {
        openHour: "15:00",
        closeHour: "16:00",
      },
    ],
    status: "CONFIRMED",
  },
];

