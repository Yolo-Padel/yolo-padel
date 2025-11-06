"use client";

import { Button } from "@/components/ui/button";
import { X, ShoppingCart, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVenue } from "@/hooks/use-venue";
import { Court, Venue } from "@prisma/client";
import { Separator } from "@/components/ui/separator";
import { useCourtByVenue } from "@/hooks/use-court";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Calendar } from "@/components/ui/calendar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useForm } from "react-hook-form";
import {
  getAvailableSlots,
  filterBlockedSlots,
  normalizeDateToLocalStartOfDay,
} from "@/lib/booking-slots-utils";
import { useActiveBlockings } from "@/hooks/use-blocking";
import { BookingFormSkeleton } from "./booking-form-skeleton";
import { CartItem } from "./step-2-order-summary";

type BookingFormValues = {
  venueId: string;
  courtId: string;
  date: Date | undefined;
  slots: string[];
  totalPrice: number;
};

// Track selections per court (courtId → CartItem)
type CourtSelections = Map<string, CartItem>;

type CourtSelectionStepProps = {
  onClose: () => void;
  isModal?: boolean;
  cart: CartItem[];
  onAddToCart: (item: CartItem) => void;
  onRemoveFromCart: (index: number) => void;
  onProceedToSummary: () => void;
};

export function CourtSelectionStep({
  onClose,
  isModal = false,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onProceedToSummary,
}: CourtSelectionStepProps) {
  const [selectedVenueId, setSelectedVenueId] = useState<string>("");

  // Track selections per court (courtId + date as key)
  const [courtSelections, setCourtSelections] = useState<
    Map<
      string,
      {
        courtId: string;
        date: Date;
        slots: string[];
      }
    >
  >(new Map());

  // Use ref to track previous sync state to prevent infinite loops
  const previousSyncRef = useRef<string>("");
  const previousLoadRef = useRef<string>("");

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

  const { data: venues, isLoading: isLoadingVenues } = useVenue();
  const venuesData: Venue[] = Array.isArray(venues?.data) ? venues.data : [];

  // Set default venue on mount
  useEffect(() => {
    if (venuesData.length > 0 && !selectedVenueId) {
      const firstId = venuesData[0].id;
      setSelectedVenueId(firstId);
      form.setValue("venueId", firstId);
    }
  }, [venuesData, selectedVenueId]);

  const { data: courts, isLoading: isLoadingCourts } =
    useCourtByVenue(selectedVenueId);
  const courtsData: Court[] = Array.isArray(courts?.data) ? courts.data : [];

  // Set default court when courts are loaded
  useEffect(() => {
    if (courtsData.length > 0 && !watchCourtId) {
      form.setValue("courtId", courtsData[0].id);
    }
  }, [courtsData, watchCourtId]);

  // Get available slots based on selected court + date
  const selectedCourt = courtsData.find((c) => c.id === watchCourtId);
  const operatingHoursSlots = getAvailableSlots(selectedCourt, watchDate);

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

  // Calculate total price
  useEffect(() => {
    if (selectedCourt && watchSlots.length > 0) {
      const totalPrice = watchSlots.length * selectedCourt.price;
      form.setValue("totalPrice", totalPrice);
    } else {
      form.setValue("totalPrice", 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchSlots, selectedCourt]); // Don't include form - it's stable

  // When switching courts or dates, load previous selections if any
  useEffect(() => {
    if (!watchCourtId || !watchDate) return;

    // Use normalized date for consistent comparison
    const dateKey = watchDate.toDateString(); // More stable than toISOString
    const selectionKey = `${watchCourtId}-${dateKey}`;

    // Prevent infinite loop - only load if court/date actually changed
    if (previousLoadRef.current === selectionKey) {
      return;
    }
    previousLoadRef.current = selectionKey;

    // Find previous selection with same court and date
    let previousSelection:
      | { courtId: string; date: Date; slots: string[] }
      | undefined;
    for (const [key, value] of courtSelections.entries()) {
      if (
        value.courtId === watchCourtId &&
        value.date.toDateString() === dateKey
      ) {
        previousSelection = value;
        break;
      }
    }

    if (previousSelection) {
      // Load previous slots for this court
      form.setValue("slots", previousSelection.slots);
    } else {
      // No previous selection, reset slots
      form.setValue("slots", []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchCourtId, watchDate]); // Don't include courtSelections or form

  // Combined Effect: Update courtSelections AND sync to cart
  useEffect(() => {
    if (!watchCourtId || !watchDate || !selectedCourt) return;

    const dateKey = watchDate.toDateString();
    const selectionKey = `${watchCourtId}-${dateKey}`;
    const slotsKey = watchSlots.join(",");
    const syncKey = `${selectionKey}:${slotsKey}`;

    // Prevent infinite loop: only process if state actually changed
    if (previousSyncRef.current === syncKey) {
      return;
    }

    // CRITICAL: Validate that watchSlots BELONG to THIS court selection
    // This prevents Court B from being added with Court A's slots during transition
    if (watchSlots.length > 0) {
      // FIRST CHECK: Does this court already have a selection?
      const existingSelection = courtSelections.get(selectionKey);

      if (!existingSelection) {
        // No selection for THIS court yet. Check if slots exist on ANOTHER court
        let slotsFromAnotherCourt = false;

        for (const [key, value] of courtSelections.entries()) {
          if (key !== selectionKey) {
            // Check if any of watchSlots exist in this other court's selection
            const hasMatchingSlots = value.slots.some((s) =>
              watchSlots.includes(s)
            );
            if (hasMatchingSlots) {
              slotsFromAnotherCourt = true;
              break;
            }
          }
        }

        if (slotsFromAnotherCourt) {
          // Slots exist on another court → cross-court contamination → BLOCK
          return;
        }
      }

      // FINAL CHECK: Are the slots valid for this court's operating hours?
      const currentAvailableSlots = getAvailableSlots(selectedCourt, watchDate);
      const allSlotsValid = watchSlots.every((slot) =>
        currentAvailableSlots.includes(slot)
      );

      if (!allSlotsValid) {
        // Slots not valid for this court's operating hours → BLOCK
        return;
      }
    }

    previousSyncRef.current = syncKey;

    // Step 1: Update courtSelections map (source of truth)
    if (watchSlots.length > 0) {
      setCourtSelections((prev) => {
        const newMap = new Map(prev);
        newMap.set(selectionKey, {
          courtId: watchCourtId,
          date: watchDate,
          slots: watchSlots,
        });
        return newMap;
      });
    } else {
      setCourtSelections((prev) => {
        const newMap = new Map(prev);
        newMap.delete(selectionKey);
        return newMap;
      });
    }

    // Step 2: Sync to cart (in same effect to avoid race condition)
    if (watchSlots.length > 0) {
      // Create cart item
      const cartItem: CartItem = {
        courtId: selectedCourt.id,
        courtName: selectedCourt.name,
        courtImage: selectedCourt.image,
        venueName:
          venuesData.find((v) => v.id === selectedVenueId)?.name || "Unknown",
        date: watchDate,
        slots: watchSlots,
        pricePerSlot: selectedCourt.price,
        totalPrice: watchSlots.length * selectedCourt.price,
      };

      // Remove existing entry for this court/date combo
      const existingIndex = cart.findIndex(
        (item) =>
          item.courtId === watchCourtId &&
          item.date.toDateString() === watchDate.toDateString()
      );

      if (existingIndex >= 0) {
        onRemoveFromCart(existingIndex);
      }
      // Add updated cart item
      setTimeout(() => onAddToCart(cartItem), 0);
    } else {
      // No slots selected, remove from cart if exists
      const existingIndex = cart.findIndex(
        (item) =>
          item.courtId === watchCourtId &&
          item.date.toDateString() === watchDate.toDateString()
      );

      if (existingIndex >= 0) {
        onRemoveFromCart(existingIndex);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    watchSlots,
    watchCourtId,
    watchDate,
    selectedCourt,
    selectedVenueId,
    venuesData,
    onAddToCart,
    onRemoveFromCart,
  ]);

  // Check if current court is in cart
  const courtInCart = cart.some(
    (item) =>
      item.courtId === watchCourtId &&
      item.date.toDateString() === watchDate?.toDateString()
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
          setSelectedVenueId(value);
          form.setValue("venueId", value);
          form.setValue("courtId", "");
          // Slots will be reset when courtId changes
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
      <div className="flex flex-col gap-2">
        <p className="text-sm">Available Court</p>
        {courtsData.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No court available
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 h-[80px]">
            {courtsData.map((court: Court) => {
              const isActive = watchCourtId === court.id;
              const isInCart = cart.some((item) => item.courtId === court.id);

              return (
                <div
                  key={court.id}
                  className={cn(
                    "relative rounded-lg overflow-hidden group cursor-pointer border transition-all",
                    isActive
                      ? "ring-2 ring-primary border-primary shadow-lg"
                      : ""
                  )}
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
                    <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1.5 shadow-md">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

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
                // All slots in allSlots are already filtered (not blocked)
                form.setValue("slots", allSlots);
              }}
              disabled={!watchCourtId || !watchDate || allSlots.length === 0}
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
            {(allSlots.length ? allSlots : []).map((slot) => {
              return (
                <ToggleGroupItem
                  key={slot}
                  value={slot}
                  className="justify-center border rounded-md"
                >
                  {slot}
                </ToggleGroupItem>
              );
            })}
          </ToggleGroup>
          {watchCourtId && watchDate && allSlots.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No time slots available for this day.
            </p>
          )}
        </div>
      </div>

      {/* Total Price */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <p className="text-sm">Total Payment</p>
        </div>
        <p className="text-sm font-medium">
          Rp
          {cart
            .reduce((sum, item) => sum + item.totalPrice, 0)
            .toLocaleString("id-ID")}
        </p>
      </div>

      {/* Action Button */}
      <Button
        className="w-full h-11"
        onClick={onProceedToSummary}
        disabled={cart.length === 0}
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        Book
      </Button>
    </div>
  );
}
