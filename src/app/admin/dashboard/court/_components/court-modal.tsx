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
import { X, Plus, Trash2 } from "lucide-react";
import {
  courtCreateSchema,
  CourtCreateData,
} from "@/lib/validations/court.validation";
import { OpeningHoursType } from "@/types/prisma";
import { useCreateCourt, useUpdateCourt } from "@/hooks/use-court";

interface CourtModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  venueId: string;
  venueName?: string;
  court?: {
    id?: string;
    name?: string;
    price?: number;
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
  const [timeSlots, setTimeSlots] = useState<{
    [key: string]: Array<{ openHour: string; closeHour: string }>;
  }>({
    saturday: [{ openHour: "07:00", closeHour: "07:30" }],
    sunday: [{ openHour: "07:00", closeHour: "07:30" }],
    monday: [{ openHour: "07:00", closeHour: "07:30" }],
  });

  // Add mutation hooks
  const createCourtMutation = useCreateCourt();
  const updateCourtMutation = useUpdateCourt();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<CourtCreateData>({
    resolver: zodResolver(courtCreateSchema),
    defaultValues: {
      courtName: "",
      venueId: venueId,
      price: 200000,
      openingHours: OpeningHoursType.REGULAR,
      schedule: {
        monday: {
          closed: false,
          timeSlots: [{ openHour: "07:00", closeHour: "07:30" }],
        },
        tuesday: {
          closed: false,
          timeSlots: [{ openHour: "07:00", closeHour: "07:30" }],
        },
        wednesday: {
          closed: false,
          timeSlots: [{ openHour: "07:00", closeHour: "07:30" }],
        },
        thursday: {
          closed: false,
          timeSlots: [{ openHour: "07:00", closeHour: "07:30" }],
        },
        friday: {
          closed: false,
          timeSlots: [{ openHour: "07:00", closeHour: "07:30" }],
        },
        saturday: {
          closed: false,
          timeSlots: [{ openHour: "07:00", closeHour: "07:30" }],
        },
        sunday: {
          closed: false,
          timeSlots: [{ openHour: "07:00", closeHour: "07:30" }],
        },
      },
    },
  });

  // Reset form when modal opens/closes or court changes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && court) {
        console.log("Edit mode - court data:", court);
        console.log("Edit mode - court price:", court.price);

        setValue("courtName", court.name || "");
        setValue("venueId", venueId);
        setValue("price", court.price || 200000);
        setValue(
          "openingHours",
          court.openingHours || OpeningHoursType.REGULAR
        );

        console.log("Form values after setValue:", {
          courtName: court.name || "",
          price: court.price || 200000,
          openingHours: court.openingHours || OpeningHoursType.REGULAR,
        });

        // Debug opening hours specifically
        console.log("Opening hours debug:", {
          courtOpeningHours: court.openingHours,
          setValueOpeningHours: court.openingHours || OpeningHoursType.REGULAR,
          watchOpeningHours: watch("openingHours"),
        });

        // Force re-render to ensure form updates
        setTimeout(() => {
          console.log("Delayed opening hours check:", watch("openingHours"));
        }, 100);

        // Set schedule data from operatingHours when openingHours is WITHOUT_FIXED
        if (
          court.openingHours === OpeningHoursType.WITHOUT_FIXED &&
          court.operatingHours
        ) {
          console.log(
            "Loading schedule data from operatingHours:",
            court.operatingHours
          );

          // Transform operatingHours to schedule format
          const scheduleData: any = {};
          const timeSlotsData: any = {};

          // Initialize all days
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
              (oh) => oh.dayOfWeek === dayUpper
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
              // Default values if no operating hour found
              scheduleData[day] = {
                closed: false,
                timeSlots: [{ openHour: "09:00", closeHour: "17:00" }],
              };
              timeSlotsData[day] = [{ openHour: "09:00", closeHour: "17:00" }];
            }
          });

          console.log("Transformed schedule data:", scheduleData);
          console.log("Transformed timeSlots data:", timeSlotsData);

          // Set the schedule data
          setValue("schedule", scheduleData);
          setTimeSlots(timeSlotsData);
        }
      } else {
        reset({
          courtName: "",
          venueId: venueId,
          price: 200000,
          openingHours: OpeningHoursType.REGULAR,
          schedule: {
            monday: {
              closed: false,
              timeSlots: [{ openHour: "09:00", closeHour: "17:00" }],
            },
            tuesday: {
              closed: false,
              timeSlots: [{ openHour: "09:00", closeHour: "17:00" }],
            },
            wednesday: {
              closed: false,
              timeSlots: [{ openHour: "09:00", closeHour: "17:00" }],
            },
            thursday: {
              closed: false,
              timeSlots: [{ openHour: "09:00", closeHour: "17:00" }],
            },
            friday: {
              closed: false,
              timeSlots: [{ openHour: "09:00", closeHour: "17:00" }],
            },
            saturday: {
              closed: false,
              timeSlots: [{ openHour: "09:00", closeHour: "17:00" }],
            },
            sunday: {
              closed: false,
              timeSlots: [{ openHour: "09:00", closeHour: "17:00" }],
            },
          },
        });
        setTimeSlots({
          monday: [{ openHour: "07:00", closeHour: "07:30" }],
          tuesday: [{ openHour: "07:00", closeHour: "07:30" }],
          wednesday: [{ openHour: "07:00", closeHour: "07:30" }],
          thursday: [{ openHour: "07:00", closeHour: "07:30" }],
          friday: [{ openHour: "07:00", closeHour: "07:30" }],
          saturday: [{ openHour: "07:00", closeHour: "07:30" }],
          sunday: [{ openHour: "07:00", closeHour: "07:30" }],
        });
      }
    }
  }, [open, mode, court, setValue, reset, venueId]);

  const onSubmit: SubmitHandler<CourtCreateData> = async (data) => {
    try {
      console.log("Court Form Data:", data);
      console.log("Price value:", data.price);
      console.log("Price type:", typeof data.price);
      console.log("Opening hours value:", data.openingHours);
      console.log("Opening hours type:", typeof data.openingHours);
      console.log("All form values:", watch());
      console.log("Form errors:", errors);

      if (mode === "add") {
        console.log("Creating new court:", data);
        await createCourtMutation.mutateAsync(data);
        onOpenChange(false);
      } else if (mode === "edit" && court?.id) {
        console.log("Updating court:", data);
        console.log("Court ID:", court.id);
        console.log("Update payload:", {
          courtId: court.id,
          ...data,
        });

        await updateCourtMutation.mutateAsync({
          courtId: court.id,
          ...data,
        });
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const addTimeSlot = (day: string) => {
    const lastSlot = timeSlots[day][timeSlots[day].length - 1];
    const lastCloseIndex = timeOptions.indexOf(lastSlot.closeHour);
    const nextOpenHour =
      lastCloseIndex < timeOptions.length - 1
        ? timeOptions[lastCloseIndex + 1]
        : "23:00";
    const nextCloseHour =
      lastCloseIndex < timeOptions.length - 2
        ? timeOptions[lastCloseIndex + 2]
        : "23:30";

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
    value: string
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

  // Generate time options from 00:00 to 23:30 with 30-minute intervals
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        options.push(timeString);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  // Validation function to check if time slots are in correct sequence
  const validateTimeSlots = (
    slots: Array<{ openHour: string; closeHour: string }>
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

    // Return options that are at least 30 minutes after open hour
    return timeOptions.slice(openIndex + 1);
  };

  // Get available time options for open hour based on previous slot's close hour
  const getAvailableOpenHours = (day: string, slotIndex: number) => {
    if (slotIndex === 0) return timeOptions;

    const previousSlot = timeSlots[day]?.[slotIndex - 1];
    if (!previousSlot) return timeOptions;

    const previousCloseIndex = timeOptions.indexOf(previousSlot.closeHour);
    if (previousCloseIndex === -1) return timeOptions;

    // Return options that start after previous slot ends
    return timeOptions.slice(previousCloseIndex + 1);
  };

  const isAddMode = mode === "add";
  const title = isAddMode ? "Add New Court" : "Edit Court";
  const description = isAddMode
    ? "Create a new court under this venue and set its base information for booking."
    : "Update court information and schedule settings.";
  const primaryButtonText = isAddMode ? "Add Court" : "Save Changes";

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
                      {...register("price", { valueAsNumber: true })}
                      onChange={(e) => {
                        console.log("Price input changed:", e.target.value);
                        console.log("Price input type:", typeof e.target.value);
                      }}
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
                  >
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem
                        value={OpeningHoursType.REGULAR}
                        id="regular"
                        className="mt-1"
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
                        className="mt-1"
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
                                          e.target.value
                                        )
                                      }
                                      className="w-full p-2 border rounded-md text-sm"
                                    >
                                      {getAvailableOpenHours(day, index).map(
                                        (time) => (
                                          <option key={time} value={time}>
                                            {time}
                                          </option>
                                        )
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
                                          e.target.value
                                        )
                                      }
                                      className="w-full p-2 border rounded-md text-sm"
                                    >
                                      {getAvailableCloseHours(
                                        slot.openHour
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
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeTimeSlot(day, index)}
                                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                      disabled={timeSlots[day].length === 1}
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
          <div className="flex flex-1 h-fit items-center bg-background gap-3 p-6 border-t rounded-b-3xl">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
