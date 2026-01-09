"use client";

import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X, Plus, Trash2, ExternalLink } from "lucide-react";
import {
  courtCreateSchema,
  CourtCreateData,
} from "@/lib/validations/court.validation";
import { OpeningHoursType } from "@/types/prisma";
import { useCreateCourt, useUpdateCourt } from "@/hooks/use-court";
import { FileUploader } from "@/components/file-uploader";
import { useVenueById } from "@/hooks/use-venue";
import Image from "next/image";
import { currencyUtils } from "@/lib/format/currency";
import { AyoFieldsModal } from "./ayo-fields-modal";

interface CourtModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit" | "view";
  venueId: string;
  venueName?: string;
  court?: {
    id?: string;
    name?: string;
    price?: number;
    image?: string;
    openingHours?: OpeningHoursType;
    operatingHours?: Array<{
      id: string;
      dayOfWeek: string;
      closed: boolean;
      slots: Array<{
        id: string;
        openHour: string;
        closeHour: string;
      }>;
    }>;
    ayoFieldId?: number | null;
    // Add other court properties as needed
  };
}

export function CourtModal({
  open,
  onOpenChange,
  mode,
  venueId,
  venueName = "Slipi Padel Center",
  court,
}: CourtModalProps) {
  // Fetch venue data to get default hours
  const { data: venueData } = useVenueById(venueId);
  const venue = venueData?.data;

  // Get venue hours with fallback
  const venueOpenHour = venue?.openHour || "07:00";
  const venueCloseHour = venue?.closeHour || "23:00";

  const [timeSlots, setTimeSlots] = useState<{
    [key: string]: Array<{ openHour: string; closeHour: string }>;
  }>({});

  // State for formatted price display
  const [priceDisplay, setPriceDisplay] = useState<string>("");

  // State for AYO fields modal - Requirements: 1.1, 1.3
  const [ayoFieldsModalOpen, setAyoFieldsModalOpen] = useState(false);

  // Add mutation hooks
  const createCourtMutation = useCreateCourt();
  const updateCourtMutation = useUpdateCourt();

  /**
   * Handler for AYO field selection from the modal
   * Sets the ayoFieldId in the form when a field is selected
   * Requirements: 5.1, 5.2, 5.3
   */
  const handleAyoFieldSelect = (fieldId: number) => {
    setValue("ayoFieldId", fieldId, { shouldValidate: true });
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<CourtCreateData>({
    resolver: zodResolver(courtCreateSchema),
  });

  // Helper to create default schedule from venue hours
  const createDefaultSchedule = () => {
    const daysOfWeek = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    const schedule: any = {};
    const slots: any = {};

    daysOfWeek.forEach((day) => {
      schedule[day] = {
        closed: false,
        timeSlots: [{ openHour: venueOpenHour, closeHour: venueCloseHour }],
      };
      slots[day] = [{ openHour: venueOpenHour, closeHour: venueCloseHour }];
    });

    return { schedule, slots };
  };

  // Reset form when modal opens/closes or court changes
  useEffect(() => {
    if (open && venue) {
      if ((mode === "edit" || mode === "view") && court) {
        console.log("Edit mode - court data:", court);

        setValue("courtName", court.name || "");
        setValue("venueId", venueId);
        const priceValue = court.price || 200000;
        setValue("price", priceValue);
        setPriceDisplay(
          priceValue
            ? currencyUtils.formatCurrencyInput(priceValue.toString())
            : "",
        );
        setValue("image", court.image || "");
        setValue(
          "openingHours",
          court.openingHours || OpeningHoursType.REGULAR,
        );
        setValue("ayoFieldId", court.ayoFieldId || null);

        // Load schedule from operatingHours (for both REGULAR and WITHOUT_FIXED)
        // This provides baseline when switching from REGULAR to WITHOUT_FIXED
        if (court.operatingHours && court.operatingHours.length > 0) {
          console.log(
            "Loading schedule from DB operatingHours:",
            court.operatingHours,
          );

          const scheduleData: any = {};
          const timeSlotsData: any = {};
          const daysOfWeek = [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ];

          daysOfWeek.forEach((day) => {
            const dayUpper = day.toUpperCase();
            const operatingHour = court.operatingHours?.find(
              (oh) => oh.dayOfWeek === dayUpper,
            );

            if (operatingHour) {
              scheduleData[day] = {
                closed: operatingHour.closed,
                timeSlots: operatingHour.slots.map((slot) => ({
                  openHour: slot.openHour,
                  closeHour: slot.closeHour,
                })),
              };

              timeSlotsData[day] = operatingHour.slots.map((slot) => ({
                openHour: slot.openHour,
                closeHour: slot.closeHour,
              }));
            } else {
              // Fallback to venue hours
              scheduleData[day] = {
                closed: false,
                timeSlots: [
                  { openHour: venueOpenHour, closeHour: venueCloseHour },
                ],
              };
              timeSlotsData[day] = [
                { openHour: venueOpenHour, closeHour: venueCloseHour },
              ];
            }
          });

          setValue("schedule", scheduleData);
          setTimeSlots(timeSlotsData);
        } else {
          // No operatingHours yet, use venue defaults
          const { schedule, slots } = createDefaultSchedule();
          setValue("schedule", schedule);
          setTimeSlots(slots);
        }
      } else {
        // Add mode: Initialize with venue hours
        const { schedule, slots } = createDefaultSchedule();

        reset({
          courtName: "",
          venueId: venueId,
          price: 200000,
          image: undefined,
          openingHours: OpeningHoursType.REGULAR,
          schedule,
          ayoFieldId: null,
        });
        setPriceDisplay(currencyUtils.formatCurrencyInput("200000"));
        setTimeSlots(slots);
      }
    }
  }, [
    open,
    mode,
    court,
    setValue,
    reset,
    venueId,
    venue,
    venueOpenHour,
    venueCloseHour,
  ]);

  const onSubmit: SubmitHandler<CourtCreateData> = async (data) => {
    try {
      console.log("Court Form Data:", data);

      // Prepare payload: only include schedule for WITHOUT_FIXED mode
      const payload = {
        ...data,
        // Only send schedule if opening hours is WITHOUT_FIXED
        // For REGULAR mode, backend will auto-generate from venue hours
        schedule:
          data.openingHours === OpeningHoursType.WITHOUT_FIXED
            ? data.schedule
            : undefined,
      };

      console.log("Payload to send:", payload);

      if (mode === "add") {
        console.log("Creating new court");
        await createCourtMutation.mutateAsync(payload as CourtCreateData);
        onOpenChange(false);
      } else if (mode === "edit" && court?.id) {
        console.log("Updating court");
        await updateCourtMutation.mutateAsync({
          courtId: court.id,
          ...(payload as CourtCreateData),
        });
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const addTimeSlot = (day: string) => {
    // Safety check: if timeSlots[day] doesn't exist or is empty, use venue defaults
    if (!timeSlots[day] || timeSlots[day].length === 0) {
      const defaultSlot = [
        { openHour: venueOpenHour, closeHour: venueCloseHour },
      ];
      setTimeSlots((prev) => ({ ...prev, [day]: defaultSlot }));
      setValue(`schedule.${day}.timeSlots` as any, defaultSlot);
      return;
    }

    const lastSlot = timeSlots[day][timeSlots[day].length - 1];
    const lastCloseIndex = timeOptions.indexOf(lastSlot.closeHour);

    // Next slot starts from last slot's close hour
    const nextOpenHour =
      lastCloseIndex < timeOptions.length
        ? timeOptions[lastCloseIndex]
        : "23:00";
    const nextCloseHour =
      lastCloseIndex < timeOptions.length - 1
        ? timeOptions[lastCloseIndex + 1]
        : "23:00";

    const newSlots = [
      ...timeSlots[day],
      { openHour: nextOpenHour, closeHour: nextCloseHour },
    ];
    setTimeSlots((prev) => ({ ...prev, [day]: newSlots }));
    setValue(`schedule.${day}.timeSlots` as any, newSlots);
  };

  const removeTimeSlot = (day: string, index: number) => {
    const newSlots = timeSlots[day].filter((_, i) => i !== index);
    setTimeSlots((prev) => ({ ...prev, [day]: newSlots }));
    setValue(`schedule.${day}.timeSlots` as any, newSlots);
  };

  const updateTimeSlot = (
    day: string,
    index: number,
    field: "openHour" | "closeHour",
    value: string,
  ) => {
    const newSlots = [...timeSlots[day]];
    newSlots[index] = { ...newSlots[index], [field]: value };

    // Auto-adjust subsequent slots if needed
    if (field === "closeHour" && index < newSlots.length - 1) {
      const currentCloseIndex = timeOptions.indexOf(value);
      const nextSlot = newSlots[index + 1];

      // If next slot's open hour is before or equal to current close hour, adjust it
      if (
        nextSlot.openHour <= value &&
        currentCloseIndex < timeOptions.length - 1
      ) {
        newSlots[index + 1] = {
          ...nextSlot,
          openHour: timeOptions[currentCloseIndex + 1],
        };
      }
    }

    setTimeSlots((prev) => ({ ...prev, [day]: newSlots }));
    setValue(`schedule.${day}.timeSlots` as any, newSlots);
  };

  const toggleDayClosed = (day: string, closed: boolean) => {
    setValue(`schedule.${day}.closed` as any, closed);
    if (closed) {
      setValue(`schedule.${day}.timeSlots` as any, []);
    } else {
      const defaultSlot = [{ openHour: "09:00", closeHour: "10:00" }];
      setTimeSlots((prev) => ({ ...prev, [day]: defaultSlot }));
      setValue(`schedule.${day}.timeSlots` as any, defaultSlot);
    }
  };

  // Generate time options from 00:00 to 23:00 with 1-hour intervals
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      const timeString = `${hour.toString().padStart(2, "0")}:00`;
      options.push(timeString);
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  // Validation function to check if time slots are in correct sequence
  const validateTimeSlots = (
    slots: Array<{ openHour: string; closeHour: string }>,
  ) => {
    for (let i = 0; i < slots.length; i++) {
      const currentSlot = slots[i];

      // Check if open hour is before close hour
      if (currentSlot.openHour >= currentSlot.closeHour) {
        return {
          isValid: false,
          message: `Jam buka harus lebih awal dari jam tutup`,
        };
      }

      // Check if next slot starts after current slot ends
      if (i < slots.length - 1) {
        const nextSlot = slots[i + 1];
        if (nextSlot.openHour <= currentSlot.closeHour) {
          return {
            isValid: false,
            message: `Time slot berikutnya harus dimulai setelah time slot sebelumnya berakhir`,
          };
        }
      }
    }
    return { isValid: true, message: "" };
  };

  // Get available time options for close hour based on open hour
  const getAvailableCloseHours = (openHour: string) => {
    const openIndex = timeOptions.indexOf(openHour);
    if (openIndex === -1) return timeOptions;

    // Return options that are at least 1 hour after open hour
    return timeOptions.slice(openIndex + 1);
  };

  // Get available time options for open hour based on previous slot's close hour
  const getAvailableOpenHours = (day: string, slotIndex: number) => {
    if (slotIndex === 0) return timeOptions;

    const previousSlot = timeSlots[day]?.[slotIndex - 1];
    if (!previousSlot) return timeOptions;

    const previousCloseIndex = timeOptions.indexOf(previousSlot.closeHour);
    if (previousCloseIndex === -1) return timeOptions;

    // Return options that start from or after previous slot ends
    // closeHour of previous slot can be openHour of next slot
    return timeOptions.slice(previousCloseIndex);
  };

  const isAddMode = mode === "add";
  const isEditMode = mode === "edit";
  const isViewMode = mode === "view";

  const title = isAddMode
    ? "Add New Court"
    : isEditMode
      ? "Edit Court"
      : "View Court";

  const description = isAddMode
    ? "Create a new court under this venue and set its base information for booking."
    : isEditMode
      ? "Update court information and schedule settings."
      : "View court information and schedule settings.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[600px] max-h-[85vh] p-0"
        showCloseButton={false}
      >
        <div className="flex flex-col h-full">
          {/* Header - Fixed */}
          <div className="flex-shrink-0 p-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  {title}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 mt-1">
                  {description}
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="max-h-[calc(60vh)] overflow-scroll px-6 py-4">
            <div className="h-full">
              {" "}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Integration Settings Section - At top with special styling */}
                <div className="space-y-4 p-4 border border-dashed border-brand/50 rounded-lg bg-brand/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">
                        Integration Settings
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Configure third-party integrations for this court
                      </p>
                    </div>
                    {/* View AYO Fields button - only show in add/edit mode */}
                    {/* Requirements: 1.1, 1.2, 1.3 */}
                    {!isViewMode && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setAyoFieldsModalOpen(true)}
                        className="gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View AYO Fields
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="ayoFieldId"
                      className="text-sm font-medium text-gray-700"
                    >
                      Ayo Field ID
                    </Label>
                    <Input
                      id="ayoFieldId"
                      placeholder="Enter Ayo Field ID"
                      {...register("ayoFieldId", {
                        valueAsNumber: true,
                        setValueAs: (v) =>
                          v === "" || Number.isNaN(v) ? null : v,
                      })}
                      className="w-full h-11"
                      disabled={isViewMode}
                    />
                    <p className="text-xs text-muted-foreground">
                      External court identifier from the AYO system. Click "View
                      AYO Fields" to browse available fields.
                    </p>
                  </div>
                </div>

                {/* Court Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="courtName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Court Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="courtName"
                    placeholder="e.g., Court 1, Court A"
                    {...register("courtName")}
                    className="w-full h-11"
                    disabled={isViewMode}
                  />
                  {errors.courtName && (
                    <p className="text-sm text-red-600">
                      {errors.courtName.message}
                    </p>
                  )}
                </div>

                {/* Venue Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="venueName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Venue Name
                  </Label>
                  <Input
                    id="venueName"
                    value={venueName}
                    disabled
                    className="w-full bg-muted text-foreground h-11"
                  />
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label
                    htmlFor="price"
                    className="text-sm font-medium text-gray-700"
                  >
                    Price<span className="text-red-500">*</span>
                  </Label>

                  <InputGroup className="w-full h-11">
                    <InputGroupAddon>
                      <InputGroupText>Rp</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      placeholder="200.000"
                      value={priceDisplay}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        const formattedValue =
                          currencyUtils.formatCurrencyInput(inputValue);
                        const numericValue =
                          currencyUtils.parseCurrencyInput(inputValue);

                        setPriceDisplay(formattedValue);
                        setValue("price", numericValue, {
                          shouldValidate: true,
                        });
                      }}
                      disabled={isViewMode}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>per hour</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>

                  {errors.price && (
                    <p className="text-sm text-red-600">
                      {errors.price.message}
                    </p>
                  )}
                </div>

                {/* Court Image */}
                <div className="space-y-2">
                  <Label
                    htmlFor="image"
                    className="text-sm font-medium text-gray-700"
                  >
                    Court Image <span className="text-red-500">*</span>
                  </Label>
                  {!isViewMode ? (
                    <FileUploader
                      folderPath="court"
                      value={watch("image") ? [watch("image")] : []}
                      onChange={(urls) => {
                        setValue("image", urls[0] || "", {
                          shouldValidate: true,
                        });
                      }}
                      multiple={false}
                      accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
                      maxFiles={1}
                    />
                  ) : (
                    <Image
                      src={watch("image")}
                      alt="Court Image"
                      width={100}
                      height={100}
                      className="w-full h-full"
                    />
                  )}
                  {errors.image && (
                    <p className="text-sm text-red-600">
                      {errors.image.message}
                    </p>
                  )}
                </div>

                {/* Opening Hours */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-700">
                    Opening Hours <span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup
                    value={watch("openingHours")}
                    onValueChange={(value) => {
                      console.log("RadioGroup value changed:", value);
                      setValue("openingHours", value as OpeningHoursType);
                    }}
                    className="space-y-3"
                    disabled={isViewMode}
                  >
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem
                        value={OpeningHoursType.REGULAR}
                        id="regular"
                        className="mt-1 border-brand text-brand"
                      />
                      <div className="space-y-1">
                        <Label
                          htmlFor="regular"
                          className="text-sm font-medium text-gray-900 cursor-pointer"
                        >
                          Open with regular hours
                        </Label>
                        <p className="text-sm text-gray-500">
                          Display court opening hours according to the venue's
                          main schedule.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem
                        value={OpeningHoursType.WITHOUT_FIXED}
                        id="without-fixed"
                        className="mt-1 border-brand text-brand"
                      />
                      <div className="space-y-1">
                        <Label
                          htmlFor="without-fixed"
                          className="text-sm font-medium text-gray-900 cursor-pointer"
                        >
                          Open without fixed hours
                        </Label>
                        <p className="text-sm text-gray-500">
                          Display the court's custom defined schedule (e.g.
                          09:00-24:00).
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                  {errors.openingHours && (
                    <p className="text-sm text-red-600">
                      {errors.openingHours.message}
                    </p>
                  )}
                </div>

                {/* Schedule - Only show when WITHOUT_FIXED is selected */}
                {watch("openingHours") === OpeningHoursType.WITHOUT_FIXED && (
                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-gray-700">
                      Schedule
                    </Label>
                    <div className="space-y-4">
                      {[
                        "monday",
                        "tuesday",
                        "wednesday",
                        "thursday",
                        "friday",
                        "saturday",
                        "sunday",
                      ].map((day) => (
                        <div key={day} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium text-gray-900 capitalize">
                              {day}
                            </Label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`${day}-closed`}
                                checked={watch(`schedule.${day}.closed` as any)}
                                onChange={(e) =>
                                  toggleDayClosed(day, e.target.checked)
                                }
                                className="rounded"
                                disabled={isViewMode}
                              />
                              <Label
                                htmlFor={`${day}-closed`}
                                className="text-sm text-gray-600"
                              >
                                Closed
                              </Label>
                            </div>
                          </div>

                          {!watch(`schedule.${day}.closed` as any) && (
                            <div className="space-y-3">
                              {timeSlots[day]?.map((slot, index) => (
                                <div
                                  key={index}
                                  className="flex items-center space-x-3 bg-gray-50 p-3 rounded-md"
                                >
                                  <div className="flex-1">
                                    <Label className="text-xs text-gray-500 mb-1 block">
                                      Open Hour *
                                    </Label>
                                    <select
                                      value={slot.openHour}
                                      onChange={(e) =>
                                        updateTimeSlot(
                                          day,
                                          index,
                                          "openHour",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full p-2 border rounded-md text-sm"
                                      disabled={isViewMode}
                                    >
                                      {getAvailableOpenHours(day, index).map(
                                        (time) => (
                                          <option key={time} value={time}>
                                            {time}
                                          </option>
                                        ),
                                      )}
                                    </select>
                                  </div>
                                  <div className="flex-1">
                                    <Label className="text-xs text-gray-500 mb-1 block">
                                      Close Hour *
                                    </Label>
                                    <select
                                      value={slot.closeHour}
                                      onChange={(e) =>
                                        updateTimeSlot(
                                          day,
                                          index,
                                          "closeHour",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full p-2 border rounded-md text-sm"
                                      disabled={isViewMode}
                                    >
                                      {getAvailableCloseHours(
                                        slot.openHour,
                                      ).map((time) => (
                                        <option key={time} value={time}>
                                          {time}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="flex items-center space-x-1 pt-5">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => addTimeSlot(day)}
                                      className="h-8 w-8 p-0"
                                      disabled={isViewMode}
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeTimeSlot(day, index)}
                                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                      disabled={
                                        timeSlots[day].length === 1 ||
                                        isViewMode
                                      }
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </form>
              {/* Empty gap */}
              <div className="h-10"></div>
            </div>
          </div>

          {/* Footer */}
          {!isViewMode && (
            <div className="flex flex-1 h-fit items-center bg-background gap-3 p-6 border-t rounded-b-3xl">
              <Button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex-1 border border-primary bg-primary/20 text-black hover:bg-primary/50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-brand text-brand-foreground hover:bg-brand/90"
                onClick={handleSubmit(onSubmit)}
              >
                {isSubmitting
                  ? mode === "add"
                    ? "Creating Court..."
                    : "Updating Court..."
                  : mode === "add"
                    ? "Create Court"
                    : "Save Changes"}
              </Button>
            </div>
          )}
        </div>

        {/* AYO Fields Reference Modal - Requirements: 1.3, 5.1, 5.2, 5.3 */}
        <AyoFieldsModal
          open={ayoFieldsModalOpen}
          onOpenChange={setAyoFieldsModalOpen}
          onSelectField={handleAyoFieldSelect}
        />
      </DialogContent>
    </Dialog>
  );
}
