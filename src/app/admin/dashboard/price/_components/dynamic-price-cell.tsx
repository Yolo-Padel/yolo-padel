import { cn } from "@/lib/utils";
import { DYNAMIC_PRICE_COLORS } from "@/constants/timetable";
import type { Court, DynamicPrice } from "@/components/timetable-types";
import { isTimeSlotInOperatingHours } from "@/components/timetable-utils";

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
  const isDisabled = !isCourtOpen && !hasPrice;

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
        <div className="flex flex-col gap-1">
          <span className="text-sm text-[#6B7413]">
            {currencyFormatter.format(dynamicPrice.price)}
          </span>
          <span className="text-xs text-[#6B7413]">Custom Price</span>
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
