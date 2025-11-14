import type { DynamicPrice } from "@/components/timetable-types";
import type { DayOfWeek } from "@/types/prisma";

export type PrismaDynamicPrice = {
  id: string;
  courtId: string;
  dayOfWeek: DayOfWeek | null;
  date: string | null;
  startHour: string;
  endHour: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export function transformPrismaDynamicPrice(
  price: PrismaDynamicPrice
): DynamicPrice {
  return {
    id: price.id,
    courtId: price.courtId,
    dayOfWeek: price.dayOfWeek,
    date: price.date ? new Date(price.date) : null,
    startHour: price.startHour,
    endHour: price.endHour,
    price: price.price,
    isActive: price.isActive,
    createdAt: new Date(price.createdAt),
    updatedAt: new Date(price.updatedAt),
  };
}

export function groupDynamicPricesByCourt(
  prices: DynamicPrice[]
): Record<string, DynamicPrice[]> {
  return prices.reduce<Record<string, DynamicPrice[]>>((acc, price) => {
    if (!acc[price.courtId]) {
      acc[price.courtId] = [];
    }
    acc[price.courtId].push(price);
    return acc;
  }, {});
}

