import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

export const DateRangePicker = () => {
    const value = "6 שעות אחורה";
    return (
        <Popover>
            <PopoverTrigger asChild>
                <SidebarMenuButton
                    variant="outline"
                    className={cn("w-full text-right font-normal")}
                >
                    <CalendarIcon className="h-4 w-4 text-right" />
                    {value ?? <span>בחר תאריך</span>}
                </SidebarMenuButton>
            </PopoverTrigger>
            <PopoverContent className="dark w-auto p-0" align="start">
                <Calendar
                    mode="range"
                    // selected={field.value}
                    // onSelect={field.onChange}
                    // disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    captionLayout="dropdown"
                />
                <div className="px-2 pb-2">
                    <Button disabled className="h-8">
                        אשר
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};
