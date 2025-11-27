"use client";

import { Button } from "@/components/ui/button";
import { X, ShoppingCart, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePublicVenues } from "@/hooks/use-venue";
import { Court, Venue } from "@prisma/client";
import { Separator } from "@/components/ui/separator";
import { usePublicCourtByVenue } from "@/hooks/use-court";
import { useMemo, useEffect } from "react";
import Image from "next/image";
import { Calendar } from "@/components/ui/calendar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { UseFormReturn } from "react-hook-form";
import {
  getAvailableSlots,
  filterBlockedSlots,
} from "@/lib/booking-slots-utils";
import { useActiveBlockings } from "@/hooks/use-blocking";
import { stringUtils } from "@/lib/format/string";
import { BookingFormSkeleton } from "./booking-form-skeleton";
import { BookingItem } from "./order-summary-container";
import { BookingFormValues } from "@/types/booking";
import {
  useBookingDefaults,
  useBookingPricing,
  useBookingDateConstraint,
  useCourtSlotsPersistence,
  useBookingSelections,
} from "@/hooks/use-booking-form";
import { CourtSkeleton } from "./court-skeleton";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DynamicPrice } from "@/components/timetable-types";
import { transformPrismaDynamicPrice } from "@/lib/dynamic-price-transform";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

type CourtSelectionContainerProps = {
  form: UseFormReturn<BookingFormValues>;
  onClose: () => void;
  isModal?: boolean;
  onProceedToSummary: () => void;
};

export function CourtSelectionContainer({
  form,
  onClose,
  isModal = false,
  onProceedToSummary,
}: CourtSelectionContainerProps) {
  const { isAuthenticated } = useAuth();
  const isMobile = useIsMobile();

  // All state now comes from RHF
  const watchVenueId = form.watch("venueId");
  const watchCourtId = form.watch("courtId");
  const watchDate = form.watch("date");
  const watchSlots = form.watch("slots");
  const watchBookings = form.watch("bookings");
  const watchGuestEmail = form.watch("guestEmail");
  const watchGuestFullName = form.watch("guestFullName");
  const watchCourtSelections = form.watch("courtSelections");

  // Computed: selectedVenueId from form
  const selectedVenueId = watchVenueId;

  const { data: venues, isLoading: isLoadingVenues } = usePublicVenues();
  const venuesData: Venue[] = Array.isArray(venues?.data) ? venues.data : [];

  const { data: courts, isLoading: isLoadingCourts } =
    usePublicCourtByVenue(watchVenueId);
  const courtsData: Court[] = Array.isArray(courts?.data)
    ? courts.data.filter((court: Court) => court.isActive === true)
    : [];

  // Get available slots based on selected court + date
  const selectedCourt = courtsData.find((c) => c.id === watchCourtId);
  const operatingHoursSlots = getAvailableSlots(selectedCourt, watchDate);

  // Get dynamic prices from selected court data (already included in query)
  const dynamicPrices: DynamicPrice[] = useMemo(() => {
    if (!selectedCourt || !("dynamicPrices" in selectedCourt)) {
      return [];
    }
    const prismaPrices = (selectedCourt as any).dynamicPrices || [];
    return prismaPrices
      .filter((price: any) => !price.isArchived)
      .map((price: any) => {
        // Transform Prisma Date objects to DynamicPrice format
        return {
          id: price.id,
          courtId: price.courtId,
          dayOfWeek: price.dayOfWeek,
          date: price.date ? new Date(price.date) : null,
          startHour: price.startHour,
          endHour: price.endHour,
          price: price.price,
          isActive: price.isActive,
          isArchived: price.isArchived ?? false,
          createdAt: new Date(price.createdAt),
          updatedAt: new Date(price.updatedAt),
        };
      });
  }, [selectedCourt]);

  // Get active blockings for the selected court and date
  const { data: blockingsData } = useActiveBlockings({
    courtId: watchCourtId || "",
    date: watchDate || new Date(),
  });

  // Extract blocked time slots from blocking data
  const blockedTimeSlots = (() => {
    if (!blockingsData || blockingsData.length === 0) return [];

    // Flatten all time slots from all blockings
    return blockingsData.flatMap((blocking) => blocking.booking.timeSlots);
  })();

  // Filter out blocked slots from available slots (HIDE them, don't just disable)
  const allSlots = filterBlockedSlots(operatingHoursSlots, blockedTimeSlots);

  // Hide time slots that are already in the past when the selected date is today
  const now = new Date();
  const isSameDaySelection =
    watchDate &&
    now.getFullYear() === watchDate.getFullYear() &&
    now.getMonth() === watchDate.getMonth() &&
    now.getDate() === watchDate.getDate();

  const availableFutureSlots =
    isSameDaySelection && allSlots.length
      ? allSlots.filter((slot) => {
          const [start] = slot.split("–");
          const [hour, minute] = start.split(".").map(Number);
          const slotStartMinutes = hour * 60 + minute;
          const currentMinutes = now.getHours() * 60 + now.getMinutes();
          return slotStartMinutes > currentMinutes;
        })
      : allSlots;

  useEffect(() => {
    const filteredSelections = watchSlots.filter((slot) =>
      availableFutureSlots.includes(slot)
    );
    if (filteredSelections.length !== watchSlots.length) {
      form.setValue("slots", filteredSelections);
    }
  }, [availableFutureSlots, watchSlots, form]);

  // Custom hooks untuk manage effects (separation of concerns)
  useBookingDefaults(form, venuesData, courtsData, watchVenueId, watchCourtId);

  useBookingPricing(form, selectedCourt, watchSlots, watchDate, dynamicPrices);

  // Business Rule: 1 order = 1 date
  useBookingDateConstraint(form, watchDate, watchCourtId);

  useCourtSlotsPersistence(form, watchCourtId, watchDate, watchCourtSelections);

  useBookingSelections(
    form,
    watchSlots,
    watchCourtId,
    watchDate,
    selectedCourt,
    watchVenueId,
    venuesData,
    dynamicPrices
  );

  return isLoadingVenues ? (
    <BookingFormSkeleton isModal={isModal} />
  ) : (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="relative">
        <div className={cn(isModal ? "pr-8 gap-0" : "")}>
          <h3 className="text-2xl font-semibold">Book your court</h3>
          <p className="text-sm text-muted-foreground">
            Select venue, court, date and time slots
          </p>
        </div>
        {isModal && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 h-8 w-8 rounded-full bg-primary hover:bg-primary/90"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Venue Tabs */}
      <Tabs
        defaultValue={venuesData[0]?.id}
        onValueChange={(value) => {
          // Business Rule: 1 order = 1 venue
          // When switching venue, force reset all data and bookings

          // 1. Clear all bookings
          form.setValue("bookings", []);

          // 2. Clear court selections state
          form.setValue("courtSelections", new Map());

          // 3. Reset all form fields
          form.setValue("venueId", value);
          form.setValue("courtId", "");
          form.setValue("slots", []);
          form.setValue("date", new Date());
          form.setValue("totalPrice", 0);
        }}
      >
        <div>
          <TabsList className="bg-transparent p-0">
            {venuesData?.map((venue: Venue) => {
              return (
                <TabsTrigger
                  key={venue.id}
                  value={venue.id}
                  className="pb-2 data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-b-primary data-[state=active]:shadow-none rounded-none text-muted-foreground"
                >
                  {venue.name}
                </TabsTrigger>
              );
            })}
          </TabsList>
          <Separator />
        </div>
      </Tabs>

      {/* Courts Grid */}
      {isLoadingCourts ? (
        <CourtSkeleton />
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-sm">Available Court</p>
          {courtsData.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No court available
            </div>
          ) : (
            <div
              className="flex flex-row gap-3 overflow-x-auto py-2 px-1 scrollbar-hide"
              style={{
                scrollbarWidth: "none" /* Firefox */,
                msOverflowStyle: "none" /* IE and Edge */,
              }}
            >
              {courtsData.map((court: Court) => {
                const isActive = watchCourtId === court.id;
                // Check both courtId AND date untuk accurate bookings status
                const isInBookings = watchBookings.some(
                  (item) =>
                    item.courtId === court.id &&
                    item.date.toDateString() === watchDate?.toDateString()
                );

                return (
                  <div
                    key={court.id}
                    className={cn(
                      "relative rounded-lg overflow-hidden group cursor-pointer border transition-all flex-shrink-0",
                      isActive
                        ? "ring-2 ring-primary border-primary shadow-lg"
                        : ""
                    )}
                    style={{ width: "140px", height: "90px" }}
                    onClick={() => {
                      form.setValue("courtId", court.id);
                      // Don't reset slots here - will be loaded by useEffect
                    }}
                  >
                    <Image
                      src={court.image || "/paddle-court1.svg"}
                      alt={court.name}
                      width={100}
                      height={70}
                      className="h-28 w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />
                    <div className="absolute bottom-2 left-2 right-2 text-white text-sm font-medium truncate text-center">
                      {court.name}
                    </div>
                    {isInBookings && (
                      <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1.5 shadow-md">
                        <Check className="h-3 w-3 text-black" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Date & Time Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <p className="text-sm">Available Date</p>
          {isMobile ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !watchDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {watchDate ? (
                    format(watchDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={watchDate}
                  onSelect={(d) => {
                    form.setValue("date", d);
                    // Slots will be loaded by useEffect if there's a previous selection
                    // Otherwise will be reset to empty
                  }}
                  showOutsideDays
                  className="w-full"
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const compareDate = new Date(date);
                    compareDate.setHours(0, 0, 0, 0);
                    return compareDate < today;
                  }}
                />
              </PopoverContent>
            </Popover>
          ) : (
            <Calendar
              mode="single"
              selected={watchDate}
              onSelect={(d) => {
                form.setValue("date", d);
                // Slots will be loaded by useEffect if there's a previous selection
                // Otherwise will be reset to empty
              }}
              showOutsideDays
              className="w-full border rounded-sm"
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const compareDate = new Date(date);
                compareDate.setHours(0, 0, 0, 0);
                return compareDate < today;
              }}
            />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-sm">Available Time</p>
            <Button
              variant="outline"
              className="border-primary"
              size="sm"
              onClick={() => {
                // All slots in allSlots are already filtered (not blocked)

                if (
                  form.watch("slots").length === availableFutureSlots.length
                ) {
                  form.setValue("slots", []);
                } else {
                  form.setValue("slots", availableFutureSlots);
                }
              }}
              disabled={
                !watchCourtId || !watchDate || availableFutureSlots.length === 0
              }
            >
              {form.watch("slots").length === availableFutureSlots.length
                ? "Unselect All"
                : "Select All"}
            </Button>
          </div>
          <ToggleGroup
            type="multiple"
            value={form.watch("slots")}
            onValueChange={(val) => {
              form.setValue("slots", val as string[]);
            }}
            className="grid grid-cols-2 gap-3"
          >
            {(availableFutureSlots.length ? availableFutureSlots : []).map(
              (slot) => {
                return (
                  <ToggleGroupItem
                    key={slot}
                    value={slot}
                    className="justify-center border rounded-md data-[state=on]:bg-primary data-[state=on]:text-black"
                  >
                    {slot}
                  </ToggleGroupItem>
                );
              }
            )}
          </ToggleGroup>
          {watchCourtId && watchDate && availableFutureSlots.length === 0 && (
            <p className="text-xs text-muted-foreground">
              {isSameDaySelection
                ? "No time slots available for the rest of today."
                : "No time slots available for this day."}
            </p>
          )}
        </div>
      </div>

      {/* Guest Info Input (only if not authenticated) */}
      {!isAuthenticated && (
        <div className="flex flex-col gap-3 pt-2">
          <div className="space-y-2">
            <Label htmlFor="guest-email" className="text-sm">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="guest-email"
              type="email"
              placeholder="your.email@example.com"
              value={watchGuestEmail || ""}
              onChange={(e) => {
                form.setValue("guestEmail", e.target.value);
              }}
              required
            />
            <p className="text-xs text-muted-foreground">
              We'll send your order details to this email
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="guest-name" className="text-sm">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="guest-name"
              type="text"
              placeholder="John Doe"
              value={watchGuestFullName || ""}
              onChange={(e) => {
                form.setValue("guestFullName", e.target.value);
              }}
              required
            />
          </div>
        </div>
      )}

      {/* Total Price */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <p className="text-sm">Total Payment</p>
        </div>
        <p className="text-sm font-medium">
          {stringUtils.formatRupiah(
            watchBookings.reduce((sum, item) => sum + item.totalPrice, 0)
          )}
        </p>
      </div>

      {/* Action Button */}
      <Button
        className="w-full h-11"
        onClick={onProceedToSummary}
        disabled={
          watchBookings.length === 0 ||
          (!isAuthenticated && (!watchGuestEmail || !watchGuestFullName))
        }
      >
        Book
      </Button>
    </div>
  );
}
