"use strict";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useI18n } from "@/lib/i18n";

interface DateRangePickerProps {
  className?: string;
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
}

export function DateRangePicker({
  className,
  date,
  setDate,
}: DateRangePickerProps) {
  const { t } = useI18n();
  const [open, setOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id="date"
            className={cn(
              "w-full flex items-center gap-3 px-2 md:px-6 py-2 text-left bg-transparent border-none focus:ring-0 outline-none group transition-all",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="w-5 h-5 text-primary shrink-0 group-hover:scale-110 transition-transform duration-300" />
            <div className="flex flex-col w-full overflow-hidden">
              <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground group-hover:text-cyan-electric transition-colors cursor-pointer">
                {t('explore.dateRange') || "Date Range"}
              </label>
              <span className="text-foreground font-semibold text-sm truncate">
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")}{" - "}{format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>{t('explore.datePlaceholder') || "Select dates"}</span>
                )}
              </span>
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 border-border shadow-lg bg-popover text-popover-foreground"
          align="start"
        >
          <div className="flex flex-col">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={isMobile ? 1 : 2}
              className="p-4"
              classNames={{
                day_range_start: "bg-primary text-primary-foreground rounded-l-full",
                day_range_end: "bg-primary text-primary-foreground rounded-r-full",
                day_range_middle: "aria-selected:bg-primary/15 aria-selected:text-foreground",
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "ring-2 ring-inset ring-primary bg-transparent text-foreground font-semibold",
              }}
            />
            <div className="p-4 pt-0 border-t border-border flex items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={() => setDate(undefined)}
              >
                {t('common.clear') || "Clear"}
              </Button>
              <Button
                variant="default"
                size="sm"
                className="px-6 font-bold uppercase tracking-widest text-xs"
                onClick={() => setOpen(false)}
              >
                {t('common.done') || "Done"}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
