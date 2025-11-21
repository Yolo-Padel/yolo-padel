"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  courtDynamicPriceCreateSchema,
  CourtDynamicPriceCreateData,
} from "@/lib/validations/court-dynamic-price.validation";
import {
  useCreateCourtDynamicPrice,
  useDeleteCourtDynamicPrice,
} from "@/hooks/use-court-dynamic-price";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { generateTimeSlots, getNextHour } from "@/components/timetable-utils";
import { stringUtils } from "@/lib/format/string";
import { z } from "zod";

type CourtOption = {
  id: string;
  name: string;
};

type DynamicPriceModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courts: CourtOption[];
  initialCourtId?: string;
  initialDate: Date;
  initialStartHour: string;
  initialEndHour: string;
  initialPrice?: number;
  initialDynamicPriceId?: string;
  venueName?: string;
  disableCourtSelection?: boolean;
};

const dynamicPriceFormSchema = courtDynamicPriceCreateSchema.safeExtend({
  date: courtDynamicPriceCreateSchema.shape.date.default(null),
  dayOfWeek: z.literal(null).default(null),
});

type FormSchema = typeof dynamicPriceFormSchema;
type FormInput = z.input<FormSchema>;
type FormOutput = z.output<FormSchema>;

export function DynamicPriceModal({
  open,
  onOpenChange,
  courts,
  initialCourtId,
  initialDate,
  initialStartHour,
  initialEndHour,
  initialPrice,
  initialDynamicPriceId,
  venueName,
  disableCourtSelection = false,
}: DynamicPriceModalProps) {
  const timeOptions = React.useMemo(() => generateTimeSlots(), []);

  const [datePickerOpen, setDatePickerOpen] = React.useState(false);
  const [priceInputFocused, setPriceInputFocused] = React.useState(false);

  const createMutation = useCreateCourtDynamicPrice();
  const deleteMutation = useDeleteCourtDynamicPrice();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, any, FormOutput>({
    resolver: zodResolver(dynamicPriceFormSchema),
    defaultValues: {
      courtId: initialCourtId ?? courts[0]?.id ?? "",
      date: initialDate,
      dayOfWeek: null,
      startHour: initialStartHour,
      endHour: initialEndHour,
      price: initialPrice ?? 0,
      isActive: true,
    },
  });

  const selectedStartHour = watch("startHour");
  const selectedCourtId = watch("courtId");
  const canDelete = Boolean(initialDynamicPriceId);

  const selectedCourtName =
    courts.find((court) => court.id === selectedCourtId)?.name ??
    "selected court";

  const endTimeOptions = React.useMemo(() => {
    return timeOptions.filter((time) => time > selectedStartHour);
  }, [selectedStartHour, timeOptions]);

  React.useEffect(() => {
    if (!open) {
      reset({
        courtId: initialCourtId ?? courts[0]?.id ?? "",
        date: initialDate,
        dayOfWeek: null,
        startHour: initialStartHour,
        endHour: initialEndHour,
        price: initialPrice ?? 0,
        isActive: true,
      });
      setDatePickerOpen(false);
      setPriceInputFocused(false);
    } else {
      setValue("courtId", initialCourtId ?? courts[0]?.id ?? "");
      setValue("date", initialDate);
      setValue("startHour", initialStartHour);
      setValue("endHour", initialEndHour);
      setValue("price", initialPrice ?? 0);
    }
  }, [
    open,
    reset,
    initialCourtId,
    initialDate,
    initialStartHour,
    initialEndHour,
    initialPrice,
    setValue,
    courts,
  ]);

  const onSubmit = async (values: FormOutput) => {
    if (!values.courtId) {
      return;
    }

    // Convert date to YYYY-MM-DD string to prevent timezone issues
    // This ensures the date selected by user is preserved exactly when sent to API
    const formatDateToString = (date: Date | null): string | null => {
      if (!date) return null;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const payload = {
      courtId: values.courtId,
      dayOfWeek: null,
      date: formatDateToString(values.date),
      startHour: values.startHour,
      endHour: values.endHour,
      price: values.price,
      isActive: values.isActive ?? true,
    } as CourtDynamicPriceCreateData;

    try {
      await createMutation.mutateAsync(payload);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create dynamic price:", error);
    }
  };

  const handleDelete = async () => {
    if (!initialDynamicPriceId) {
      onOpenChange(false);
      return;
    }

    try {
      await deleteMutation.mutateAsync(initialDynamicPriceId);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete dynamic price:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] p-0" showCloseButton={false}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 pb-0">
            <DialogHeader className="gap-1  ">
              <DialogTitle className="text-xl font-semibold">
                Set Custom Price
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Adjust the price for this specific time slot. <br /> Changes
                will override the default venue rate.
              </DialogDescription>
            </DialogHeader>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-primary hover:bg-primary/90"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4 text-black" />
            </Button>

            <div className="mt-6 space-y-4">
              {venueName && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Venue Name</Label>
                  <Input
                    type="text"
                    value={venueName}
                    disabled
                    className="w-full bg-muted"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Court Name <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="courtId"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => field.onChange(value)}
                      disabled={disableCourtSelection}
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
                  )}
                />
                {errors.courtId && (
                  <p className="text-sm text-red-500">
                    {errors.courtId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Date <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="date"
                  render={({ field }) => (
                    <Popover
                      open={datePickerOpen}
                      onOpenChange={setDatePickerOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          {field.value ? (
                            format(field.value, "EEE, d MMM yyyy")
                          ) : (
                            <span>Select date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="p-0">
                        <Calendar
                          mode="single"
                          selected={
                            field.value instanceof Date
                              ? field.value
                              : field.value
                                ? new Date(field.value)
                                : undefined
                          }
                          onSelect={(date) => {
                            field.onChange(date ?? initialDate);
                            setDatePickerOpen(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.date && (
                  <p className="text-sm text-red-500">
                    {errors.date.message as string}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Start Time <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="startHour"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          const options = timeOptions.filter(
                            (time) => time > value
                          );
                          const fallback = options[0] ?? getNextHour(value);
                          setValue("endHour", fallback, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select start time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.startHour && (
                    <p className="text-sm text-red-500">
                      {errors.startHour.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    End Time <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="endHour"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(value) => field.onChange(value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select end time" />
                        </SelectTrigger>
                        <SelectContent>
                          {endTimeOptions.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.endHour && (
                    <p className="text-sm text-red-500">
                      {errors.endHour.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Custom Price <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="price"
                  render={({ field }) => {
                    const displayValue = priceInputFocused
                      ? field.value && field.value > 0
                        ? field.value.toString()
                        : ""
                      : field.value && field.value > 0
                        ? stringUtils.formatRupiah(field.value)
                        : "";

                    return (
                      <Input
                        type="text"
                        placeholder="Enter price"
                        value={displayValue}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/\D/g, "");
                          const numValue = rawValue
                            ? parseInt(rawValue, 10)
                            : 0;
                          field.onChange(numValue);
                        }}
                        onFocus={() => {
                          setPriceInputFocused(true);
                        }}
                        onBlur={() => {
                          setPriceInputFocused(false);
                        }}
                      />
                    );
                  }}
                />
                {errors.price && (
                  <p className="text-sm text-red-500">{errors.price.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3 border-t bg-muted/30 p-4 sm:px-6 rounded-b-full">
            {canDelete && (
              <Button
                type="button"
                variant="destructive"
                className="flex-1"
                onClick={handleDelete}
                disabled={
                  isSubmitting ||
                  createMutation.isPending ||
                  deleteMutation.isPending
                }
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            )}
            <Button
              type="submit"
              className={cn(
                "flex-1 bg-primary hover:bg-primary/90",
                !canDelete && "w-full"
              )}
              disabled={
                isSubmitting ||
                createMutation.isPending ||
                deleteMutation.isPending
              }
            >
              {createMutation.isPending ? "Saving..." : "Save Custom Price"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
