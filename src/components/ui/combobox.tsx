"use client"

import * as React from "react"
import { Check, FilterIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const filterStatus = [
  {
    value: "Court",
    label: "Court",
  },
  {
    value: "Status",
    label: "Status",
  },
]

export function ComboboxFilter() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")
  const selectedLabel = value
    ? filterStatus.find((status) => status.value === value)?.label
    : "Filter"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[94px] w-max-[100px]justify-between border-[1px] border-[#C3D223]"
        > <span className="text-sm font-medium">{selectedLabel}</span>
          <FilterIcon/>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" side="bottom" align="end" sideOffset={6} alignOffset={0}>
        <Command>
          <CommandInput placeholder="Filter by" className="h-9" />
          <CommandList>
            <CommandEmpty>No filter found.</CommandEmpty>
            <CommandGroup>
              {filterStatus.map((status) => (
                <CommandItem
                  key={status.value}
                  value={status.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  {status.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === status.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
export default ComboboxFilter