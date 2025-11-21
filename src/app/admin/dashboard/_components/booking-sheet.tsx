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
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  manualBookingSchema,
  ManualBookingInput,
} from "@/lib/validations/manual-booking.validation";
import { useVenue } from "@/hooks/use-venue";
import { useCourtByVenue, useAvailableTimeSlots } from "@/hooks/use-court";
import { useManualBooking } from "@/hooks/use-booking";

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
    watchVenueId || ""
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

  // Set startTime when availableTimeSlotsData is ready and defaults are provided
  useEffect(() => {
    if (!open) return;
    const startTime = defaults?.startTime;
    if (!startTime) return;
    if (!availableTimeSlotsData?.startTimeOptions) return;

    // Normalize time format to ensure it's in "HH:00" format
    const normalizedStartTime = normalizeTimeFormat(startTime);

    // Only set if the value is valid in the options
    if (availableTimeSlotsData.startTimeOptions.includes(normalizedStartTime)) {
      // Use setTimeout to ensure this runs after reset() completes
      const timer = setTimeout(() => {
        setValue("startTime", normalizedStartTime, { shouldValidate: false });
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [
    open,
    defaults?.startTime,
    availableTimeSlotsData?.startTimeOptions,
    setValue,
  ]);

  // Set endTime after startTime is set and endTimeOptionsMap is ready
  useEffect(() => {
    if (!open) return;
    const endTime = defaults?.endTime;
    if (!endTime) return;
    if (!watchStartTime) return; // Wait for startTime to be set first
    if (!availableTimeSlotsData?.endTimeOptionsMap) return;

    // Normalize time format to ensure it's in "HH:00" format
    const normalizedEndTime = normalizeTimeFormat(endTime);

    // Get end options for the current startTime
    const endOptions =
      availableTimeSlotsData.endTimeOptionsMap?.[watchStartTime] || [];

    if (endOptions.length > 0) {
      const timer = setTimeout(() => {
        if (endOptions.includes(normalizedEndTime)) {
          setValue("endTime", normalizedEndTime, { shouldValidate: false });
        } else {
          // If default endTime is not valid, use first available option
          setValue("endTime", endOptions[0], { shouldValidate: false });
        }
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [
    open,
    defaults?.endTime,
    watchStartTime,
    availableTimeSlotsData?.endTimeOptionsMap,
    setValue,
  ]);

  // Get start time options from available time slots
  const startTimeOptions = useMemo(() => {
    if (!availableTimeSlotsData?.startTimeOptions) return [];
    return availableTimeSlotsData.startTimeOptions;
  }, [availableTimeSlotsData]);

  // Get end time options based on selected start time
  const endTimeOptions = useMemo(() => {
    if (!watchStartTime || !availableTimeSlotsData?.endTimeOptionsMap)
      return [];
    return availableTimeSlotsData.endTimeOptionsMap[watchStartTime] || [];
  }, [availableTimeSlotsData, watchStartTime]);

  useEffect(() => {
    if (watchStartTime && !startTimeOptions.includes(watchStartTime)) {
      setValue("startTime", "");
      setValue("endTime", "");
    }
  }, [watchStartTime, startTimeOptions, setValue]);

  useEffect(() => {
    if (watchEndTime && !endTimeOptions.includes(watchEndTime)) {
      setValue("endTime", "");
    }
  }, [watchEndTime, endTimeOptions, setValue]);

  const courts =
    (courtData?.data as Array<{ id: string; name: string }> | undefined) || [];

  const handleVenueChange = (value: string) => {
    setValue("venueId", value);
    setValue("courtId", "");
  };

  const handleCourtChange = (value: string) => {
    setValue("courtId", value);
  };

  const handleStartTimeChange = (value: string) => {
    setValue("startTime", value);
    setValue("endTime", "");
  };

  const handleEndTimeChange = (value: string) => {
    setValue("endTime", value);
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
    (timeSlotsLoading ||
      !availableTimeSlotsData?.startTimeOptions ||
      !availableTimeSlotsData?.endTimeOptionsMap);

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
                    <SelectValue placeholder="Pilih venue" />
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
                    <SelectValue placeholder="Pilih court" />
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
                        : "Pilih tanggal"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDateObj}
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

              <div className="flex w-full gap-4">
                <div className="space-y-2 flex-1 w-full">
                  <Label>
                    Start Time <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={watchStartTime}
                    onValueChange={handleStartTimeChange}
                    disabled={manualBooking.isPending}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih jam" />
                    </SelectTrigger>
                    <SelectContent>
                      {startTimeOptions.length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          Pilih court & tanggal untuk melihat jam tersedia
                        </div>
                      )}
                      {startTimeOptions.map((time: string) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.startTime && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.startTime.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2 flex-1 w-full">
                  <Label>
                    End Time <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={watchEndTime}
                    onValueChange={handleEndTimeChange}
                    disabled={!watchStartTime || manualBooking.isPending}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih jam" />
                    </SelectTrigger>
                    <SelectContent>
                      {endTimeOptions.length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          Pilih jam mulai terlebih dahulu
                        </div>
                      )}
                      {endTimeOptions.map((time: string) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.endTime && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.endTime.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <SheetFooter className="flex flex-row gap-2 w-full px-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={manualBooking.isPending}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={manualBooking.isPending}
                className="flex-1"
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
