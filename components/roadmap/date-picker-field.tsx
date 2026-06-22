"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { buttonVariants } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DatePickerFieldProps = {
  name: string;
  label: string;
  placeholder: string;
  defaultValue?: string;
};

export function DatePickerField({ name, label, placeholder, defaultValue }: DatePickerFieldProps) {
  const parsedDefault = defaultValue ? parseISO(defaultValue) : undefined;
  const initialDate = parsedDefault && isValid(parsedDefault) ? parsedDefault : undefined;
  const [date, setDate] = React.useState<Date | undefined>(initialDate);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm font-medium leading-none">
        {label}
      </label>
      <input type="hidden" id={name} name={name} value={date ? format(date, "yyyy-MM-dd") : ""} />
      <Popover>
        <PopoverTrigger
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-11 w-full justify-start px-3 text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon data-icon="inline-start" />
          {date ? format(date, "PPP") : placeholder}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selected) => setDate(selected ?? undefined)}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
