"use client";

import { Button } from "@/components/ui/button";
import { X, ShoppingCart, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePublicVenues } from "@/hooks/use-venue";
import { Court, Venue } from "@prisma/client";
import { Separator } from "@/components/ui/separator";
import { usePublicCourtByVenue } from "@/hooks/use-court";
import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Calendar } from "@/components/ui/calendar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useForm } from "react-hook-form";
import {
  getAvailableSlots,
  filterBlockedSlots,
} from "@/lib/booking-slots-utils";
import { useActiveBlockings } from "@/hooks/use-blocking";
import { stringUtils } from "@/lib/format/string";
import { BookingFormSkeleton } from "./booking-form-skeleton";
import { CartItem } from "./order-summary-container";
import { useBookingDefaults } from "@/hooks/use-booking-defaults";
import { useBookingPricing } from "@/hooks/use-booking-pricing";
import { useCourtSlotsPersistence } from "@/hooks/use-court-slots-persistence";
import { useBookingCartSync } from "@/hooks/use-booking-cart-sync";
import { BookingFormValues, CourtSelections } from "@/types/booking";
import { CourtSkeleton } from "./court-skeleton";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DynamicPrice } from "@/components/timetable-types";
import { transformPrismaDynamicPrice } from "@/lib/dynamic-price-transform";

type CourtSelectionContainerProps = {
  onClose: () => void;
  isModal?: boolean;
  cart: CartItem[];
  onAddToCart: (item: CartItem | ((prev: CartItem[]) => CartItem[])) => void;
  onRemoveFromCart: (
    index: number | ((prev: CartItem[]) => CartItem[])
  ) => void;
  onProceedToSummary: () => void;
  onGuestInfoChange?: (email: string, fullName: string) => void;
};

export function CourtSelectionContainer({
  onClose,
  isModal = false,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onProceedToSummary,
  onGuestInfoChange,
}: CourtSelectionContainerProps) {
  const [selectedVenueId, setSelectedVenueId] = useState<string>("");
  const { isAuthenticated } = useAuth();

  // Guest info state (only for non-authenticated users)
  const [guestEmail, setGuestEmail] = useState<string>("");
  const [guestFullName, setGuestFullName] = useState<string>("");

  // Track selections per court (courtId + date as key)
  const [courtSelections, setCourtSelections] = useState<CourtSelections>(
    new Map()
  );

  const form = useForm<BookingFormValues>({
    defaultValues: {
      venueId: "",
      courtId: "",
      date: new Date(),
      slots: [],
      totalPrice: 0,
    },
  });
  const watchCourtId = form.watch("courtId");
  const watchDate = form.watch("date");
  const watchSlots = form.watch("slots");

  const { data: venues, isLoading: isLoadingVenues } = usePublicVenues();
  const venuesData: Venue[] = Array.isArray(venues?.data) ? venues.data : [];

  const { data: courts, isLoading: isLoadingCourts } =
    usePublicCourtByVenue(selectedVenueId);
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
  useBookingDefaults(
    form,
    venuesData,
    courtsData,
    selectedVenueId,
    setSelectedVenueId,
    watchCourtId
  );

  useBookingPricing(form, selectedCourt, watchSlots, watchDate, dynamicPrices);

  useCourtSlotsPersistence(form, watchCourtId, watchDate, courtSelections);

  useBookingCartSync(
    watchSlots,
    watchCourtId,
    watchDate,
    selectedCourt,
    selectedVenueId,
    venuesData,
    courtSelections,
    setCourtSelections,
    cart,
    onAddToCart,
    onRemoveFromCart,
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
          // When switching venue, force reset all data and cart

          // 1. Clear all cart items (remove from end to start to avoid index issues)
          for (let i = cart.length - 1; i >= 0; i--) {
            onRemoveFromCart(i);
          }

          // 2. Clear court selections state
          setCourtSelections(new Map());

          // 3. Reset all form fields
          setSelectedVenueId(value);
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
                // Check both courtId AND date untuk accurate cart status
                const isInCart = cart.some(
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
                    {isInCart && (
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
        <div className="flex flex-col gap-2">
          <p className="text-sm">Available Date</p>
          <div className="rounded-lg border p-2">
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
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-sm">Available Time</p>
            <Button
              variant="outline"
              className="border-primary"
              size="sm"
              onClick={() => {
                // Slots are already filtered (not blocked & not in the past)
                form.setValue("slots", availableFutureSlots);
              }}
              disabled={
                !watchCourtId || !watchDate || availableFutureSlots.length === 0
              }
            >
              Select All
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
                    className="justify-center border rounded-md"
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
              value={guestEmail}
              onChange={(e) => {
                const email = e.target.value;
                setGuestEmail(email);
                onGuestInfoChange?.(email, guestFullName);
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
              value={guestFullName}
              onChange={(e) => {
                const name = e.target.value;
                setGuestFullName(name);
                onGuestInfoChange?.(guestEmail, name);
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
            cart.reduce((sum, item) => sum + item.totalPrice, 0)
          )}
        </p>
      </div>

      {/* Action Button */}
      <Button
        className="w-full h-11"
        onClick={onProceedToSummary}
        disabled={
          cart.length === 0 ||
          (!isAuthenticated && (!guestEmail || !guestFullName))
        }
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        Book
      </Button>
    </div>
  );
}
