import { format } from "date-fns";
import type { DynamicPrice, DynamicPriceSlotInfo } from "./timetable-types";
import { getNextHour } from "./timetable-utils";

const DAY_OF_WEEK_MAP = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;

const getDateKey = (date: Date) => format(date, "yyyy-MM-dd");

const isSameDate = (dateA: Date, dateB: Date) =>
  getDateKey(dateA) === getDateKey(dateB);

const calculateSpan = (
  startHour: string,
  endHour: string,
  timeSlots: string[]
) => {
  let startIndex = -1;
  let endIndex = -1;

  for (let i = 0; i < timeSlots.length; i++) {
    const slotStart = timeSlots[i];
    const slotEnd = getNextHour(slotStart);

    if (startIndex === -1 && slotStart === startHour) {
      startIndex = i;
    }

    if (slotEnd === endHour) {
      endIndex = i;
    }
  }

  if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
    return endIndex - startIndex + 1;
  }

  const [startH, startM] = startHour.split(":").map(Number);
  const [endH, endM] = endHour.split(":").map(Number);
  const durationMinutes = endH * 60 + endM - (startH * 60 + startM);
  return Math.max(1, Math.ceil(durationMinutes / 60));
};

const matchesSelectedDate = (price: DynamicPrice, selectedDate: Date) => {
  if (price.date) {
    return isSameDate(price.date, selectedDate);
  }

  if (price.dayOfWeek) {
    const dayName = DAY_OF_WEEK_MAP[selectedDate.getDay()];
    return price.dayOfWeek === dayName;
  }

  return true;
};

export function getTimeSlotDynamicPrice(
  timeSlot: string,
  _timeSlotIndex: number,
  courtId: string,
  dynamicPrices: DynamicPrice[],
  selectedDate: Date,
  allTimeSlots: string[]
): DynamicPriceSlotInfo | null {
  const timeStart = timeSlot;
  const timeEnd = getNextHour(timeSlot);

  for (const price of dynamicPrices) {
    if (price.courtId !== courtId) continue;
    if (!price.isActive) continue;

    if (!matchesSelectedDate(price, selectedDate)) continue;

    if (timeStart < price.endHour && timeEnd > price.startHour) {
      const isFirstSlot = timeStart === price.startHour;
      if (isFirstSlot) {
        const span = calculateSpan(price.startHour, price.endHour, allTimeSlots);
        return { dynamicPrice: price, isFirstSlot: true, span };
      }

      return { dynamicPrice: price, isFirstSlot: false, span: 0 };
    }
  }

  return null;
}

