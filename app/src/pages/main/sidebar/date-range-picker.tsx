import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { CalendarCogIcon, CalendarIcon } from "lucide-react";
import { useState } from "react";
import { useStore } from "zustand";
import { parametersStore } from "../parameters";

export const DateRangePicker = () => {
    const range = useStore(parametersStore, (state) => state.timeRange);
    const setRange = useStore(parametersStore, (state) => state.setTimeRange);

    return (
        <div className="flex flex-col items-center gap-1 group-data-[collapsible=icon]:gap-0">
            <span className="text-xs font-semibold text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
                מ-
            </span>
            <SingleDatePicker
                value={range.start}
                setValue={(v) => v && setRange({ ...range, start: v })}
            />
            <span className="text-xs font-semibold text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
                ועד-
            </span>
            <span className="hidden group-data-[collapsible=icon]:block">-</span>
            <SingleDatePicker
                value={range.end}
                setValue={(v) => setRange({ ...range, end: v })}
                canBeNow
            />
        </div>
    );
};

function SingleDatePicker({
    value,
    setValue,
    canBeNow,
}: {
    value: Date | undefined;
    setValue: (value: Date | undefined) => void;
    canBeNow?: boolean;
}) {
    const [advanced, setAdvanced] = useState(false);
    const [open, setOpen] = useState(false);

    let approxCurrentHours = 0;
    if (value) {
        approxCurrentHours = Math.round((Date.now() - value.getTime()) / (1000 * 60 * 60));
    }

    const [hours, setHours] = useState<number>(approxCurrentHours);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <SidebarMenuButton
                    variant="outline"
                    className={cn("w-full text-right font-normal")}
                >
                    <CalendarIcon className="h-4 w-4 text-right" />
                    {approxCurrentHours ? `${approxCurrentHours} שעות אחורה` : "עכשיו"}
                </SidebarMenuButton>
            </PopoverTrigger>
            <PopoverContent className="dark w-auto p-0" align="start">
                {!advanced ? (
                    <div className="flex w-[238px] items-center justify-center gap-4 p-2" dir="rtl">
                        <Input
                            type="number"
                            min="0"
                            value={hours}
                            defaultValue={approxCurrentHours}
                            onChange={(e) => setHours(parseInt(e.target.value))}
                            className="w-14"
                        />
                        <span className="text-sm">שעות אחורה</span>
                    </div>
                ) : (
                    <Calendar
                        mode="single"
                        // selected={field.value}
                        // onSelect={field.onChange}
                        // disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        captionLayout="dropdown"
                    />
                )}
                <div className="flex justify-between px-2 pb-2">
                    <Button
                        className="h-8"
                        disabled={advanced}
                        onClick={() => {
                            setValue(new Date(Date.now() - hours * 60 * 60 * 1000));
                            setOpen(false);
                        }}
                    >
                        אשר
                    </Button>
                    <Button
                        className="h-8 p-2"
                        variant="ghost"
                        onClick={() => setAdvanced(!advanced)}
                    >
                        <CalendarCogIcon />
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
