"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type MultipleValue = string[];
type SingleValue = string | undefined;

type ToggleGroupContextType = {
  type: "single" | "multiple";
  value: MultipleValue | SingleValue;
  onValueChange?: (value: any) => void;
};

const ToggleGroupContext = React.createContext<ToggleGroupContextType | null>(
  null
);

export function ToggleGroup({
  type = "multiple",
  value,
  onValueChange,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  type?: "single" | "multiple";
  value: MultipleValue | SingleValue;
  onValueChange?: (value: any) => void;
}) {
  return (
    <ToggleGroupContext.Provider value={{ type, value, onValueChange }}>
      <div className={cn("inline-flex flex-wrap gap-3", className)} {...props}>
        {children}
      </div>
    </ToggleGroupContext.Provider>
  );
}

export function ToggleGroupItem({
  value,
  className,
  children,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string;
}) {
  const ctx = React.useContext(ToggleGroupContext);
  if (!ctx) {
    throw new Error("ToggleGroupItem must be used within ToggleGroup");
  }

  const isSelected = React.useMemo(() => {
    if (ctx.type === "multiple") {
      return Array.isArray(ctx.value) && (ctx.value as MultipleValue).includes(value);
    }
    return ctx.value === value;
  }, [ctx.type, ctx.value, value]);

  function handleClick() {
    if (!ctx.onValueChange || disabled) return;
    if (ctx.type === "multiple") {
      const current = Array.isArray(ctx.value) ? (ctx.value as MultipleValue) : [];
      const next = isSelected
        ? current.filter((v) => v !== value)
        : [...current, value];
      ctx.onValueChange(next);
    } else {
      ctx.onValueChange(isSelected ? undefined : value);
    }
  }

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        "h-9 items-center justify-center rounded-md border px-3 text-sm transition-colors",
        "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
        isSelected
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background text-foreground hover:bg-muted border-input",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
      data-state={isSelected ? "on" : "off"}
      {...props}
    >
      {children}
    </button>
  );
}


