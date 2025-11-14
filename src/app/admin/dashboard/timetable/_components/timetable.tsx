import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { addDays } from "@/lib/date-utils";
import { TimetableTableSkeleton } from "./timetable-table-skeleton";
import {
  generateTimeSlots,
  formatTimeDisplay,
  formatOperatingHours,
} from "@/components/timetable-utils";
import { BOOKING_COLORS } from "@/constants/timetable";
import type { Court, TimetableRenderCell } from "@/components/timetable-types";

type TimetableProps = {
  courts: Court[];
  selectedDate: Date;
  isLoading?: boolean;
  onDateChange?: (date: Date) => void;
  renderCell: TimetableRenderCell;
  showQuickJumpButtons?: boolean;
  primaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
};

/**
 * Timetable Component
 * Renders the main timetable grid with courts and time slots
 */
export function Timetable({
  courts,
  selectedDate,
  isLoading = false,
  onDateChange,
  renderCell,
  showQuickJumpButtons = true,
  primaryAction,
}: TimetableProps) {
  const timeSlots = React.useMemo(() => generateTimeSlots(), []);
  const [calendarOpen, setCalendarOpen] = React.useState(false);

  const handleDateChange = (date: Date | undefined) => {
    if (!date) return;
    onDateChange?.(date);
  };

  const goToPreviousDay = () => {
    const prev = addDays(selectedDate, -1);
    handleDateChange(prev);
  };

  const goToNextDay = () => {
    const next = addDays(selectedDate, 1);
    handleDateChange(next);
  };

  const goToToday = () => {
    handleDateChange(new Date());
  };

  const goToTomorrow = () => {
    const tomorrow = addDays(new Date(), 1);
    handleDateChange(tomorrow);
  };

  // Format tanggal untuk display: "Mon, 14 Okt"
  const formattedDate = format(selectedDate, "EEE, d MMM", { locale: id });

  // Show skeleton when loading
  if (isLoading) {
    return <TimetableTableSkeleton />;
  }

  return (
    <div className="border rounded-lg w-full max-w-full overflow-hidden">
      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)]">
        <table
          className="border-collapse w-full"
          style={{ minWidth: "max-content" }}
        >
          <thead>
            {/* Row 1: Time Slot + Date Navigation */}
            <tr className="bg-muted/50">
              <th className="border p-3 text-left font-semibold sticky left-0 top-0 bg-muted/50 z-30 min-w-[120px]">
                Time
              </th>
              <th
                colSpan={courts.length}
                className="border p-3 text-left font-semibold sticky top-0 bg-muted/50 z-20"
                style={{ padding: 0 }}
              >
                <div className="p-3" style={{ width: "fit-content" }}>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousDay}
                      className={`border-[${BOOKING_COLORS.PRIMARY_BORDER}]`}
                      disabled={isLoading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`border-[${BOOKING_COLORS.PRIMARY_BORDER}] gap-2`}
                          disabled={isLoading}
                        >
                          <CalendarIcon className="h-4 w-4" />
                          <span>{formattedDate}</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            if (date) {
                              handleDateChange(date);
                              setCalendarOpen(false);
                            }
                          }}
                          locale={id}
                          disabled={isLoading}
                        />
                      </PopoverContent>
                    </Popover>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextDay}
                      className={`border-[${BOOKING_COLORS.PRIMARY_BORDER}]`}
                      disabled={isLoading}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>

                    {showQuickJumpButtons && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToToday}
                          className={`border-[${BOOKING_COLORS.PRIMARY_BORDER}]`}
                          disabled={isLoading}
                        >
                          Go to Today
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToTomorrow}
                          className={`border-[${BOOKING_COLORS.PRIMARY_BORDER}]`}
                          disabled={isLoading}
                        >
                          Tomorrow
                        </Button>
                      </>
                    )}

                    {primaryAction && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={primaryAction.onClick}
                        disabled={primaryAction.disabled}
                      >
                        {primaryAction.label}
                      </Button>
                    )}
                  </div>
                </div>
              </th>
            </tr>
            {/* Row 2: Court Names */}
            <tr className="bg-muted/50">
              <th className="border p-3 text-left font-semibold sticky left-0 top-[57px] bg-muted/50 z-30 min-w-[120px]">
                {/* Empty cell for Time Slot column */}
              </th>
              {courts.map((court) => {
                const courtOperatingHours = court.operatingHours || {
                  openHour: "10:00",
                  closeHour: "20:00",
                };

                return (
                  <th
                    key={court.id}
                    className="border p-3 text-center font-semibold min-w-[150px] sticky top-[57px] bg-muted/50 z-20"
                  >
                    <div className="font-semibold">{court.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatOperatingHours(
                        courtOperatingHours.openHour,
                        courtOperatingHours.closeHour
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((time, timeIndex) => (
              <tr key={time} className="hover:bg-muted/30">
                <td className="border p-3 sticky left-0 bg-background z-10 font-semibold text-center min-w-[120px]">
                  {formatTimeDisplay(time)}
                </td>
                {courts.map((court) => {
                  return (
                    <React.Fragment key={`${court.id}-${time}`}>
                      {renderCell({
                        court,
                        timeSlot: time,
                        timeIndex,
                        timeSlots,
                        selectedDate,
                      })}
                    </React.Fragment>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
