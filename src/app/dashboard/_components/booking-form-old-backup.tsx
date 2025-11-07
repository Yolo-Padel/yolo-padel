import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVenue } from "@/hooks/use-venue";
import { Court, Venue } from "@prisma/client";
import { Separator } from "@/components/ui/separator";
import { useCourtByVenue } from "@/hooks/use-court";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Calendar } from "@/components/ui/calendar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useForm } from "react-hook-form";
import {
  getAvailableSlots,
  transformDbFormatToUISlots,
  isSlotBooked,
  normalizeDateToLocalStartOfDay,
} from "@/lib/booking-slots-utils";
import { useCreateBooking, useBookingByCourt } from "@/hooks/use-booking";
import { stringUtils } from "@/lib/format/string";
import { useAuth } from "@/hooks/use-auth";
import { BookingFormSkeleton } from "./booking-form-skeleton";

type BookingFormValues = {
  venueId: string;
  courtId: string;
  date: Date | undefined;
  slots: string[];
  totalPrice: number;
};

export const BookingForm = ({
  onClose,
  isModal = false,
}: {
  onClose: () => void;
  isModal?: boolean;
}) => {
  const [selectedVenueId, setSelectedVenueId] = useState<string>("");

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

  useEffect(() => {
    if (venuesData.length > 0) {
      const firstId = venuesData[0].id;
      setSelectedVenueId(firstId);
      form.setValue("venueId", firstId);
    }
  }, [venuesData]);

  const { data: courts, isLoading: isLoadingCourts } =
    useCourtByVenue(selectedVenueId);
  const courtsData: Court[] = Array.isArray(courts?.data) ? courts.data : [];
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  // Set default court when courts are loaded
  useEffect(() => {
    if (courtsData.length > 0 && !watchCourtId) {
      form.setValue("courtId", courtsData[0].id);
    }
  }, [courtsData, watchCourtId]);

  // Get available slots based on selected court + date
  const selectedCourt = courtsData.find((c) => c.id === watchCourtId);
  const operatingHoursSlots = getAvailableSlots(selectedCourt, watchDate);

  // Get existing bookings for the selected court and date
  const { data: existingBookings } = useBookingByCourt(watchCourtId || "");
  const bookingsData = Array.isArray(existingBookings?.data)
    ? existingBookings.data
    : [];

  // Get booked slots for selected date
  const bookedSlots = (() => {
    if (!watchDate || bookingsData.length === 0) return [];

    // Use normalized date format for consistent comparison
    // This prevents timezone issues when comparing dates
    const selectedDateStr = normalizeDateToLocalStartOfDay(watchDate);
    const bookingsOnDate = bookingsData.filter((booking: any) => {
      const bookingDate = new Date(booking.bookingDate);
      const bookingDateStr = normalizeDateToLocalStartOfDay(bookingDate);
      return (
        bookingDateStr === selectedDateStr && booking.status !== "CANCELLED"
      );
    });

    return bookingsOnDate.flatMap((booking: any) => {
      if (booking.timeSlots && booking.timeSlots.length > 0) {
        return transformDbFormatToUISlots(booking.timeSlots);
      }
      // Backward compatibility: use bookingHour if timeSlots not available
      if (booking.bookingHour) {
        return [booking.bookingHour];
      }
      return [];
    });
  })();

  // Show all slots from operating hours, but mark booked ones as disabled
  // This allows users to see what's available vs what's booked
  const allSlots = operatingHoursSlots;

  // Calculate total price: slots count × court price
  useEffect(() => {
    if (selectedCourt && watchSlots.length > 0) {
      const totalPrice = watchSlots.length * selectedCourt.price;
      form.setValue("totalPrice", totalPrice);
    } else {
      form.setValue("totalPrice", 0);
    }
  }, [watchSlots, selectedCourt, form]);

  // Booking mutation
  const { mutate: createBooking, isPending: isCreatingBooking } =
    useCreateBooking();
  const { user } = useAuth();

  // Handle form submit
  const handleSubmit = form.handleSubmit((data) => {
    if (!user?.id) {
      // Should not happen if user is authenticated, but handle gracefully
      console.error("User not authenticated");
      return;
    }

    if (data.slots.length === 0) {
      return;
    }

    if (!data.date) {
      return;
    }

    if (!data.courtId) {
      return;
    }

    if (!data.totalPrice || data.totalPrice <= 0) {
      return;
    }

    createBooking(
      {
        courtId: data.courtId,
        date: data.date,
        slots: data.slots,
        totalPrice: data.totalPrice,
        userId: user.id,
      },
      {
        onSuccess: () => {
          form.reset();
          onClose();
        },
      }
    );
  });

  return isLoadingVenues ? (
    <BookingFormSkeleton isModal={isModal} />
  ) : (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <div className={cn(isModal ? "pr-8 gap-0" : "")}>
          <h3 className="text-2xl font-semibold">Book your court</h3>
          <p className="text-sm text-muted-foreground">
            Enter the location and select a field for booking
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
      <Tabs
        defaultValue={venuesData[0].id}
        onValueChange={(value) => {
          setSelectedVenueId(value);
          form.setValue("venueId", value);
          form.setValue("courtId", "");
          form.setValue("slots", []);
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
      <div className="flex flex-col gap-2">
        <p className="text-sm">Available Court</p>
        {courtsData.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No court available
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 h-[80px]">
            {courtsData.map((court: Court) => {
              const active = watchCourtId === court.id;
              return (
                <div
                  key={court.id}
                  className={cn(
                    "relative rounded-lg overflow-hidden group cursor-pointer border",
                    active
                      ? "ring-2 ring-primary border-primary"
                      : "border-transparent"
                  )}
                  onClick={() => {
                    form.setValue("courtId", court.id);
                    setSelectedSlots([]);
                    form.setValue("slots", []);
                    form.setValue("totalPrice", 0);
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
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm">Available Date</p>
          <div className="rounded-lg border p-2">
            <Calendar
              mode="single"
              selected={watchDate}
              onSelect={(d) => {
                form.setValue("date", d);
                form.setValue("slots", []);
                form.setValue("totalPrice", 0);
                setSelectedSlots([]);
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
                // Only select available (non-booked) slots
                const availableOnly = allSlots.filter(
                  (slot) => !isSlotBooked(slot, bookedSlots)
                );
                form.setValue("slots", availableOnly);
                setSelectedSlots(availableOnly);
              }}
              disabled={
                !watchCourtId ||
                !watchDate ||
                allSlots.filter((slot) => !isSlotBooked(slot, bookedSlots))
                  .length === 0
              }
            >
              Select All
            </Button>
          </div>
          <ToggleGroup
            type="multiple"
            value={form.watch("slots")}
            onValueChange={(val) => {
              setSelectedSlots(val as string[]);
              form.setValue("slots", val as string[]);
            }}
            className="grid grid-cols-2 gap-3"
          >
            {(allSlots.length ? allSlots : []).map((slot) => {
              const isBooked = isSlotBooked(slot, bookedSlots);
              return (
                <ToggleGroupItem
                  key={slot}
                  value={slot}
                  className={cn(
                    "justify-center",
                    isBooked && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={isBooked}
                  title={isBooked ? "This slot is already booked" : undefined}
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

      <div className="flex items-center justify-between pt-2">
        <div>
          <p className="text-sm">Total Payment</p>
        </div>
        <p className="text-sm font-medium">
          {stringUtils.formatRupiah(form.watch("totalPrice"))}
        </p>
      </div>

      <Button
        className="h-11"
        onClick={handleSubmit}
        disabled={
          isCreatingBooking ||
          !watchCourtId ||
          !watchDate ||
          watchSlots.length === 0 ||
          !user?.id
        }
      >
        {isCreatingBooking ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          "Book Now"
        )}
      </Button>
    </div>
  );
};
