"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  manualBookingSchema,
  ManualBookingInput,
} from "@/lib/validations/manual-booking.validation";
import { useVenue } from "@/hooks/use-venue";
import { useCourtByVenue, useAvailableTimeSlots } from "@/hooks/use-court";
import { useManualBooking } from "@/hooks/use-booking";
import { cn } from "@/lib/utils";

export type ManualBookingDefaults = {
  venueId?: string;
  courtId?: string;
  email?: string;
  date?: Date | string;
  startTime?: string;
  endTime?: string;
};

export type ManualBookingSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaults?: ManualBookingDefaults;
  onSuccess?: () => void;
};

function formatDateInput(value?: Date | string): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  console.log("FORMAT DATE INPUT", year, month, day);
  return `${year}-${month}-${day}`;
}

export function ManualBookingSheet({
  open,
  onOpenChange,
  defaults,
  onSuccess,
}: ManualBookingSheetProps) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<ManualBookingInput>({
    resolver: zodResolver(manualBookingSchema),
    defaultValues: {
      email: "",
      venueId: "",
      courtId: "",
      date: formatDateInput(new Date()),
      startTime: "",
      endTime: "",
    },
  });

  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const watchVenueId = watch("venueId");
  const watchCourtId = watch("courtId");
  const watchStartTime = watch("startTime");
  const watchEndTime = watch("endTime");
  const watchDate = watch("date");

  const { data: venueData, isLoading: venuesLoading } = useVenue();
  const { data: courtData, isLoading: courtsLoading } = useCourtByVenue(
    watchVenueId || "",
  );

  const manualBooking = useManualBooking();

  // Get available time slots for selected court and date
  const selectedDate = watchDate ? new Date(watchDate) : undefined;
  const { data: availableTimeSlotsData, isLoading: timeSlotsLoading } =
    useAvailableTimeSlots(watchCourtId || "", selectedDate);

  // Prefill when defaults change or sheet opens
  useEffect(() => {
    if (!open) return;
    reset({
      email: defaults?.email ?? "",
      venueId: defaults?.venueId ?? "",
      courtId: defaults?.courtId ?? "",
      date: formatDateInput(defaults?.date) || formatDateInput(new Date()),
      // Don't set startTime/endTime here if defaults are provided
      // They will be set in the next useEffect after availableTimeSlotsData is ready
      startTime: defaults?.startTime ?? "",
      endTime: defaults?.endTime ?? "",
    });
  }, [defaults, open, reset]);

  // Helper function to normalize time format to "HH:00"
  const normalizeTimeFormat = (time: string): string => {
    const [hours, minutes] = time.split(":").map(Number);
    return `${String(hours).padStart(2, "0")}:${String(minutes || 0).padStart(2, "0")}`;
  };

  // Set time slot when availableTimeSlotsData is ready and defaults are provided
  useEffect(() => {
    if (!open) return;
    const startTime = defaults?.startTime;
    const endTime = defaults?.endTime;
    if (!startTime || !endTime) return;
    if (!availableTimeSlotsData?.availableSlotRanges) return;

    // Normalize time format to ensure it's in "HH:00" format
    const normalizedStartTime = normalizeTimeFormat(startTime);
    const normalizedEndTime = normalizeTimeFormat(endTime);

    // Convert to UI format to check if slot exists in availableSlotRanges
    const startFormatted = normalizedStartTime.replace(":", ".");
    const endFormatted = normalizedEndTime.replace(":", ".");
    const slotValue = `${startFormatted}–${endFormatted}`;

    // Check if this slot combination is valid in availableSlotRanges
    if (availableTimeSlotsData.availableSlotRanges.includes(slotValue)) {
      // Use setTimeout to ensure this runs after reset() completes
      const timer = setTimeout(() => {
        setValue("startTime", normalizedStartTime, { shouldValidate: false });
        setValue("endTime", normalizedEndTime, { shouldValidate: false });
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [
    open,
    defaults?.startTime,
    defaults?.endTime,
    availableTimeSlotsData?.availableSlotRanges,
    setValue,
  ]);

  // Use availableSlotRanges directly from API (already in UI format)
  // Format: ["06.00–07.00", "07.00–08.00", ...]
  // Filter out past time slots on the client side for better UX
  const timeSlotOptions = useMemo(() => {
    if (!availableTimeSlotsData?.availableSlotRanges) {
      return [];
    }

    const slots = availableTimeSlotsData.availableSlotRanges;

    // Check if selected date is today
    if (!selectedDate) return slots;

    const now = new Date();
    const todayOnly = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const selectedDateOnly = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
    );
    const isToday = todayOnly.getTime() === selectedDateOnly.getTime();

    if (!isToday) return slots;

    // Filter out slots that have already started
    const currentHour = String(now.getHours()).padStart(2, "0");
    const currentMinute = String(now.getMinutes()).padStart(2, "0");
    const currentTime = `${currentHour}:${currentMinute}`;

    return slots.filter((slot: string) => {
      const [slotStart] = slot.split("–");
      // Convert UI format "06.00" to DB format "06:00" for comparison
      const slotStartDB = slotStart.replace(".", ":");
      // Only show slots where start time is after current time
      return slotStartDB > currentTime;
    });
  }, [availableTimeSlotsData, selectedDate]);

  // Get currently selected slots in UI format (array)
  const selectedSlots = useMemo(() => {
    if (!watchStartTime || !watchEndTime) return [];

    // Convert startTime and endTime back to slot array
    // This handles the case when defaults are provided
    const slots: string[] = [];
    const startHour = parseInt(watchStartTime.split(":")[0]);
    let endHour = parseInt(watchEndTime.split(":")[0]);

    // Handle 00:00 as end of day (midnight = 24)
    if (endHour === 0) {
      endHour = 24;
    }

    for (let hour = startHour; hour < endHour; hour++) {
      const startFormatted = `${String(hour).padStart(2, "0")}.00`;
      // Handle hour 24 display as 00
      const nextHour = hour + 1 === 24 ? 0 : hour + 1;
      const endFormatted = `${String(nextHour).padStart(2, "0")}.00`;
      slots.push(`${startFormatted}–${endFormatted}`);
    }

    return slots;
  }, [watchStartTime, watchEndTime]);

  // Handle slot selection from ToggleGroup (multiple selection)
  const handleSlotChange = (val: string | string[]) => {
    const values = val as string[];
    if (!values || values.length === 0) {
      setValue("startTime", "");
      setValue("endTime", "");
      return;
    }

    // Sort slots to ensure they're in order
    const sortedSlots = [...values].sort();

    // Extract first slot start and last slot end
    const firstSlot = sortedSlots[0];
    const lastSlot = sortedSlots[sortedSlots.length - 1];

    const [firstStart] = firstSlot.split("–");
    const [, lastEnd] = lastSlot.split("–");

    // Convert "06.00" back to "06:00" format
    const startTime = firstStart.replace(".", ":");
    const endTime = lastEnd.replace(".", ":");

    setValue("startTime", startTime);
    setValue("endTime", endTime);
  };

  const courts =
    (courtData?.data as Array<{ id: string; name: string }> | undefined) || [];

  const handleVenueChange = (value: string) => {
    setValue("venueId", value);
    setValue("courtId", "");
  };

  const handleCourtChange = (value: string) => {
    setValue("courtId", value);
  };

  const onSubmit = (values: ManualBookingInput) => {
    manualBooking.mutate(values, {
      onSuccess: () => {
        onSuccess?.();
        onOpenChange(false);
      },
    });
  };

  const venues =
    (venueData?.data as Array<{ id: string; name: string }> | undefined) || [];

  const selectedDateObj = watchDate ? new Date(watchDate) : undefined;
  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  // Check if we're loading initial data (when sheet opens with defaults)
  const isLoadingInitialData =
    open &&
    Boolean(defaults?.startTime && defaults?.endTime) &&
    (timeSlotsLoading || !availableTimeSlotsData?.availableSlotRanges);

  return (
    <Sheet
      open={open}
      onOpenChange={(value) => !manualBooking.isPending && onOpenChange(value)}
    >
      <SheetContent className="flex flex-col gap-6 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-2xl font-semibold">
            Create Booking
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Book a court on behalf of a customer.
          </SheetDescription>
        </SheetHeader>

        {isLoadingInitialData ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-1 flex-col gap-5 overflow-y-auto px-5"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="customer@email.com"
                  {...register("email")}
                  disabled={manualBooking.isPending}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 w-full">
                <Label>
                  Venue <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watchVenueId}
                  onValueChange={handleVenueChange}
                  disabled={venuesLoading || manualBooking.isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {venues.map((venue) => (
                      <SelectItem key={venue.id} value={venue.id}>
                        {venue.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.venueId && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.venueId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Court <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watchCourtId}
                  onValueChange={handleCourtChange}
                  disabled={
                    courtsLoading || !watchVenueId || manualBooking.isPending
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select court" />
                  </SelectTrigger>
                  <SelectContent>
                    {courts.map((court) => (
                      <SelectItem key={court.id} value={court.id}>
                        {court.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.courtId && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.courtId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Date <span className="text-red-500">*</span>
                </Label>
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      disabled={manualBooking.isPending}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDateObj
                        ? format(selectedDateObj, "PPP")
                        : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDateObj}
                      components={{
                        DayButton(props) {
                          return (
                            <CalendarDayButton
                              {...props}
                              className={cn(
                                props.className,
                                "data-[selected-single=true]:bg-brand",
                              )}
                            />
                          );
                        },
                      }}
                      onSelect={(date) => {
                        if (date) {
                          const formatted = formatDateInput(date);
                          setValue("date", formatted, { shouldValidate: true });
                          setValue("startTime", "");
                          setValue("endTime", "");
                          setDatePickerOpen(false);
                        }
                      }}
                      disabled={(date) => date < today}
                    />
                  </PopoverContent>
                </Popover>
                {errors.date && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.date.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Time Slot <span className="text-red-500">*</span>
                </Label>
                <ToggleGroup
                  type="multiple"
                  value={selectedSlots}
                  onValueChange={handleSlotChange}
                  disabled={manualBooking.isPending}
                  className="grid grid-cols-2 gap-3"
                >
                  {timeSlotOptions.length === 0 ? (
                    <div className="col-span-2 px-3 py-2 text-sm text-muted-foreground text-center">
                      {!watchCourtId || !watchDate
                        ? "Select court & date to see available time slots"
                        : "No slots available for this date"}
                    </div>
                  ) : (
                    timeSlotOptions.map((slot: string) => (
                      <ToggleGroupItem
                        key={slot}
                        value={slot}
                        className="justify-center border rounded-md data-[state=on]:bg-brand data-[state=on]:text-white"
                      >
                        {slot}
                      </ToggleGroupItem>
                    ))
                  )}
                </ToggleGroup>
                {(errors.startTime || errors.endTime) && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.startTime?.message || errors.endTime?.message}
                  </p>
                )}
              </div>
            </div>

            <SheetFooter className="flex flex-row gap-2 w-full px-0">
              <Button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={manualBooking.isPending}
                className="flex-1 border border-primary bg-primary/20 text-black hover:bg-primary/50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={manualBooking.isPending}
                className="flex-1 bg-brand text-brand-foreground hover:bg-brand/90"
              >
                {manualBooking.isPending ? "Processing..." : "Book Now"}
              </Button>
            </SheetFooter>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
