import { cn } from "@/lib/utils";
import { DYNAMIC_PRICE_COLORS } from "@/constants/timetable";
import type { Court, DynamicPrice } from "@/components/timetable-types";
import { isTimeSlotInOperatingHours } from "@/components/timetable-utils";
import { stringUtils } from "@/lib/format/string";

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

type DynamicPriceCellProps = {
  court: Court;
  timeSlot: string;
  dynamicPrice: DynamicPrice | null;
  isFirstSlot: boolean;
  span: number;
  selectedDate: Date;
  onClick?: (
    dynamicPrice: DynamicPrice | null,
    court: Court,
    timeSlot: string
  ) => void;
  onMouseDown?: (court: Court, timeSlot: string) => void;
  onMouseEnter?: (court: Court, timeSlot: string) => void;
  isDragPreview?: boolean;
  canCreate?: boolean;
  canUpdate?: boolean;
  isPermissionLoading?: boolean;
};

export function DynamicPriceCell({
  court,
  timeSlot,
  dynamicPrice,
  isFirstSlot,
  span,
  selectedDate,
  onClick,
  onMouseDown,
  onMouseEnter,
  isDragPreview = false,
  canCreate = false,
  canUpdate = false,
  isPermissionLoading = false,
}: DynamicPriceCellProps) {
  const hasPrice = dynamicPrice !== null;

  const isCourtOpen = isTimeSlotInOperatingHours(
    timeSlot,
    court.operatingHours?.fullOperatingHours
  );

  // Hitung apakah tanggal/waktu yang dipilih sudah lewat
  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const selectedDay = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate()
  ).getTime();

  const isPastDate = selectedDay < today;

  let isPastTimeSlot = false;
  const isToday = selectedDay === today;

  if (isToday) {
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Jika waktu sekarang 17:30, cutoff menjadi 18:00
    const cutoffHour = currentMinute > 0 ? currentHour + 1 : currentHour;
    const cutoffTime = `${String(cutoffHour).padStart(2, "0")}:00`;

    // Contoh: timeSlot "17:00" < cutoff "18:00" -> dianggap sudah lewat
    isPastTimeSlot = timeSlot < cutoffTime;
  }

  const isPast = isPastDate || isPastTimeSlot;

  // Disabled hanya untuk slot yang:
  // - court-nya tutup ATAU
  // - sudah lewat (tanggal/waktu lampau)
  // DAN tidak punya dynamic price
  const isDisabled = (!isCourtOpen || isPast) && !hasPrice;

  if (hasPrice && !isFirstSlot && span === 0) {
    return null;
  }

  const isInactive = dynamicPrice ? !dynamicPrice.isActive : false;

  const isCreateLocked = !hasPrice && !canCreate;
  const isUpdateLocked = hasPrice && !canUpdate;
  const isInteractionDisabled =
    isDisabled || isPermissionLoading || isCreateLocked;

  const isClickable = Boolean(onClick) && !isInteractionDisabled;

  return (
    <td
      rowSpan={hasPrice && isFirstSlot ? span : 1}
      className={cn(
        "border h-[80px] p-2 align-top",
        hasPrice &&
          (isInactive
            ? "bg-muted text-muted-foreground"
            : `bg-[${DYNAMIC_PRICE_COLORS.ACTIVE_BG}]`),
        isDragPreview &&
          !hasPrice &&
          "bg-primary/10 border-primary/60 ring-1 ring-primary/40",
        isClickable &&
          `cursor-pointer hover:bg-[${DYNAMIC_PRICE_COLORS.ACTIVE_HOVER}] transition-colors`,
        hasPrice && `bg-[#ECF1BB] border-l-2 border-l-[#B1BF20] `,
        !isClickable && "cursor-not-allowed opacity-60"
      )}
      onClick={() => {
        if (!isClickable) {
          return;
        }

        onClick?.(dynamicPrice, court, timeSlot);
      }}
      onMouseDown={(event) => {
        if (isDisabled || isPermissionLoading || !canCreate) {
          return;
        }

        event.preventDefault();
        onMouseDown?.(court, timeSlot);
      }}
      onMouseEnter={() => {
        if (hasPrice && !isFirstSlot && span === 0) return;
        if (isDisabled || isPermissionLoading || !canCreate) {
          return;
        }

        onMouseEnter?.(court, timeSlot);
      }}
    >
      {hasPrice && dynamicPrice && isFirstSlot ? (
        <div className="flex flex-col">
          <span className="text-normal text-[#6B7413]">
            {stringUtils.formatRupiah(dynamicPrice.price)}
          </span>
          <span className="text-[12px] text-[#6B7413]">Custom Price</span>

          <span className="text-sm text-[#6B7413] pt-1">
            Default Price: {stringUtils.formatRupiah(dynamicPrice.court.price)}
          </span>
          {!dynamicPrice.isActive && (
            <span className="text-[10px] uppercase tracking-wide font-medium text-muted-foreground">
              Inactive
            </span>
          )}
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">
          {isDisabled ? "Closed" : "-"}
        </span>
      )}
    </td>
  );
}
