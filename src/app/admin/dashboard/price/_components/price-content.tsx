"use client";

import * as React from "react";
import { Timetable } from "@/app/admin/dashboard/timetable/_components/timetable";
import { TimetableHeader } from "@/app/admin/dashboard/timetable/_components/timetable-header";
import { TimetableSkeleton } from "@/app/admin/dashboard/timetable/_components/timetable-skeleton";
import { TimetableError } from "@/app/admin/dashboard/timetable/_components/timetable-error";
import { TimetableEmptyState } from "@/components/timetable-empty-state";
import { DynamicPriceCell } from "./dynamic-price-cell";
import { DynamicPriceModal } from "./dynamic-price-modal";
import { useVenue } from "@/hooks/use-venue";
import { useCourtByVenue } from "@/hooks/use-court";
import { useCourtDynamicPrices } from "@/hooks/use-court-dynamic-price";
import { transformPrismaCourtToTimetable } from "@/lib/booking-transform";
import type {
  Court,
  Venue,
  TimetableRenderCell,
  DynamicPrice,
} from "@/components/timetable-types";
import { getTimeSlotDynamicPrice } from "@/components/timetable-dynamic-price-helpers";
import { generateTimeSlots, getNextHour } from "@/components/timetable-utils";

type DragState = {
  court: Court;
  startSlot: string;
  lastSlot: string;
};

export function PriceContent() {
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [selectedVenueId, setSelectedVenueId] = React.useState<string>("");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalContext, setModalContext] = React.useState<{
    courtId: string;
    startHour: string;
    endHour: string;
    initialPrice?: number;
    fromCell?: boolean;
  } | null>(null);
  const [dragState, setDragState] = React.useState<DragState | null>(null);

  const {
    data: venuesData,
    isLoading: venuesLoading,
    isError: venuesError,
    error: venuesErrorData,
    refetch: refetchVenues,
  } = useVenue();

  const {
    data: courtsData,
    isLoading: courtsLoading,
    isError: courtsError,
    error: courtsErrorData,
    refetch: refetchCourts,
  } = useCourtByVenue(selectedVenueId);

  const venues: Venue[] = React.useMemo(() => {
    if (!venuesData?.data) return [];
    return venuesData.data.map((venue: any) => ({
      id: venue.id,
      name: venue.name,
    }));
  }, [venuesData]);

  React.useEffect(() => {
    if (venues.length > 0 && !selectedVenueId) {
      setSelectedVenueId(venues[0].id);
    }
  }, [venues, selectedVenueId]);

  const courts: Court[] = React.useMemo(() => {
    if (!courtsData?.data) return [];
    return transformPrismaCourtToTimetable(courtsData.data, selectedDate);
  }, [courtsData, selectedDate]);

  const courtIds = React.useMemo(
    () => courts.map((court) => court.id),
    [courts]
  );

  const {
    data: dynamicPriceQuery,
    isLoading: dynamicPriceLoading,
    isError: dynamicPriceError,
    error: dynamicPriceErrorData,
    refetch: refetchDynamicPrices,
  } = useCourtDynamicPrices(courtIds);

  const pricesByCourt = React.useMemo<Record<string, DynamicPrice[]>>(
    () => dynamicPriceQuery?.byCourt ?? {},
    [dynamicPriceQuery]
  );

  const timeSlots = React.useMemo(() => generateTimeSlots(), []);

  const handleVenueChange = (venueId: string) => {
    setSelectedVenueId(venueId);
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const openModal = React.useCallback(
    (context: {
      courtId: string;
      startHour: string;
      endHour: string;
      initialPrice?: number;
      fromCell?: boolean;
    }) => {
      setModalContext(context);
      setIsModalOpen(true);
    },
    []
  );

  const renderDynamicPriceCell = React.useCallback<TimetableRenderCell>(
    ({ court, timeSlot, timeIndex, timeSlots, selectedDate }) => {
      const courtPrices: DynamicPrice[] = pricesByCourt[court.id] ?? [];
      const slotInfo = getTimeSlotDynamicPrice(
        timeSlot,
        timeIndex,
        court.id,
        courtPrices,
        selectedDate,
        timeSlots
      );

      const isFirstSlot = slotInfo?.isFirstSlot ?? false;
      const span = slotInfo?.span ?? 1;
      const dynamicPrice = slotInfo?.dynamicPrice ?? null;

      let isDragPreview = false;
      if (dragState && dragState.court.id === court.id) {
        const startIndex = timeSlots.indexOf(dragState.startSlot);
        const endIndex = timeSlots.indexOf(dragState.lastSlot);
        if (startIndex !== -1 && endIndex !== -1) {
          const min = Math.min(startIndex, endIndex);
          const max = Math.max(startIndex, endIndex);
          if (timeIndex >= min && timeIndex <= max) {
            isDragPreview = true;
          }
        }
      }

      return (
        <DynamicPriceCell
          court={court}
          timeSlot={timeSlot}
          dynamicPrice={dynamicPrice}
          isFirstSlot={isFirstSlot}
          span={span}
          isDragPreview={isDragPreview && !dynamicPrice}
          onClick={(dynamicPrice, cellCourt, slot) => {
            if (!dragState) {
              openModal({
                courtId: cellCourt.id,
                startHour: dynamicPrice?.startHour ?? slot,
                endHour: dynamicPrice?.endHour ?? getNextHour(slot),
                initialPrice: dynamicPrice?.price,
                fromCell: true,
              });
            }
          }}
          onMouseDown={(cellCourt, slot) => {
            setDragState({
              court: cellCourt,
              startSlot: slot,
              lastSlot: slot,
            });
          }}
          onMouseEnter={(cellCourt, slot) => {
            setDragState((prev) => {
              if (!prev || prev.court.id !== cellCourt.id) return prev;
              return { ...prev, lastSlot: slot };
            });
          }}
        />
      );
    },
    [pricesByCourt, dragState, openModal]
  );

  React.useEffect(() => {
    if (!dragState) return;

    const handleMouseUp = () => {
      setDragState((current) => {
        if (!current) return null;

        const sortedSlots = [current.startSlot, current.lastSlot].sort();
        const startHour = sortedSlots[0];
        const endHour = getNextHour(sortedSlots[sortedSlots.length - 1]);

        openModal({
          courtId: current.court.id,
          startHour,
          endHour,
          fromCell: true,
        });

        return null;
      });
    };

    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragState, openModal]);

  const handleAddCustomPrice = () => {
    if (!courts.length) return;
    const defaultStart = timeSlots[0] ?? "06:00";
    openModal({
      courtId: courts[0].id,
      startHour: defaultStart,
      endHour: getNextHour(defaultStart),
    });
  };

  if (venuesError) {
    return (
      <TimetableError
        error={venuesErrorData as Error}
        onRetry={refetchVenues}
      />
    );
  }

  if (courtsError && !courtsLoading) {
    return (
      <TimetableError
        error={courtsErrorData as Error}
        onRetry={refetchCourts}
      />
    );
  }

  if (dynamicPriceError && !dynamicPriceLoading) {
    return (
      <TimetableError
        error={dynamicPriceErrorData as Error}
        onRetry={refetchDynamicPrices}
      />
    );
  }

  const isInitialLoading = venuesLoading || courtsLoading;

  if (isInitialLoading) {
    return <TimetableSkeleton />;
  }

  // Show empty state if no venues
  if (venues.length === 0 && !venuesLoading) {
    return (
      <div className="space-y-4 w-full max-w-full">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold">Custom Price Configuration</h2>
          </div>
        </div>
        <TimetableEmptyState type="no-venues" />
      </div>
    );
  }

  // Show empty state if no courts for selected venue
  if (courts.length === 0 && !courtsLoading && selectedVenueId) {
    return (
      <div className="space-y-4 w-full max-w-full">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold">Custom Price Configuration</h2>
          </div>
        </div>
        <TimetableHeader
          venues={venues}
          selectedVenueId={selectedVenueId}
          onVenueChange={handleVenueChange}
          isLoading={courtsLoading}
        />
        <TimetableEmptyState type="no-courts" />
      </div>
    );
  }

  const isTableLoading = dynamicPriceLoading;

  return (
    <div className="space-y-4 w-full max-w-full">
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold">Custom Price Configuration</h2>
        </div>
      </div>
      <TimetableHeader
        venues={venues}
        selectedVenueId={selectedVenueId}
        onVenueChange={handleVenueChange}
        isLoading={courtsLoading}
      />

      <Timetable
        courts={courts}
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        showQuickJumpButtons={false}
        primaryAction={{
          label: "Add Custom Price",
          onClick: handleAddCustomPrice,
          disabled: courts.length === 0,
        }}
        isLoading={isTableLoading}
        renderCell={renderDynamicPriceCell}
      />

      {modalContext && (
        <DynamicPriceModal
          open={isModalOpen}
          onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) {
              setModalContext(null);
            }
          }}
          courts={courts.map((court) => ({ id: court.id, name: court.name }))}
          initialCourtId={modalContext.courtId}
          initialDate={selectedDate}
          initialStartHour={modalContext.startHour}
          initialEndHour={modalContext.endHour}
          initialPrice={modalContext.initialPrice}
          venueName={
            venues.find((v) => v.id === selectedVenueId)?.name ?? undefined
          }
          disableCourtSelection={modalContext.fromCell === true}
        />
      )}
    </div>
  );
}
