import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { CalendarIcon, Clock } from "lucide-react";
import { useState } from "react";
import { useStore } from "zustand";
import { parametersStore } from "../parameters";
import { format } from "date-fns";

export const DateRangePicker = () => {
    const range = useStore(parametersStore, (state) => state.timeRange);
    const setRange = useStore(parametersStore, (state) => state.setTimeRange);
    const [open, setOpen] = useState(false);

    const formatDisplay = () => {
        const start = range.start ? format(range.start, "dd/MM HH:mm:ss") : "--";
        const end = range.end ? format(range.end, "dd/MM HH:mm:ss") : "עכשיו";
        return `${start} - ${end}`;
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <SidebarMenuButton
                    variant="outline"
                    className={cn("w-full text-right font-normal")}
                >
                    <CalendarIcon className="h-4 w-4" />
                    <span className="text-xs truncate">{formatDisplay()}</span>
                </SidebarMenuButton>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <DateTimeRangePicker
                    range={range}
                    setRange={setRange}
                    onClose={() => setOpen(false)}
                />
            </PopoverContent>
        </Popover>
    );
};

function DateTimeRangePicker({
    range,
    setRange,
    onClose,
}: {
    range: { start: Date; end?: Date };
    setRange: (range: { start: Date; end?: Date }) => void;
    onClose: () => void;
}) {
    const [activeTab, setActiveTab] = useState<'from' | 'to'>('from');
    const [tempRange, setTempRange] = useState(range);
    const [fromDate, setFromDate] = useState<Date | undefined>(range.start);
    const [toDate, setToDate] = useState<Date | undefined>(range.end);
    
    const [fromTime, setFromTime] = useState(() => {
        const d = range.start;
        return {
            hours: d.getHours().toString().padStart(2, '0'),
            minutes: d.getMinutes().toString().padStart(2, '0'),
            seconds: d.getSeconds().toString().padStart(2, '0'),
        };
    });
    
    const [toTime, setToTime] = useState(() => {
        const d = range.end || new Date();
        return {
            hours: d.getHours().toString().padStart(2, '0'),
            minutes: d.getMinutes().toString().padStart(2, '0'),
            seconds: d.getSeconds().toString().padStart(2, '0'),
        };
    });

    const handleApply = () => {
        if (fromDate) {
            const newFromDate = new Date(fromDate);
            newFromDate.setHours(parseInt(fromTime.hours) || 0);
            newFromDate.setMinutes(parseInt(fromTime.minutes) || 0);
            newFromDate.setSeconds(parseInt(fromTime.seconds) || 0);
            
            let newToDate = undefined;
            if (toDate) {
                newToDate = new Date(toDate);
                newToDate.setHours(parseInt(toTime.hours) || 0);
                newToDate.setMinutes(parseInt(toTime.minutes) || 0);
                newToDate.setSeconds(parseInt(toTime.seconds) || 0);
            }
            
            setRange({ start: newFromDate, end: newToDate });
            onClose();
        }
    };

    const TimeInput = ({ time, setTime, label }: { 
        time: { hours: string; minutes: string; seconds: string };
        setTime: (time: { hours: string; minutes: string; seconds: string }) => void;
        label: string;
    }) => (
        <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">{label}</div>
            <div className="flex gap-2 items-center justify-center">
                <div className="flex flex-col items-center">
                    <label className="text-xs text-muted-foreground mb-1">שעה</label>
                    <Input
                        type="number"
                        min="0"
                        max="23"
                        value={time.hours}
                        onChange={(e) => setTime({...time, hours: e.target.value.padStart(2, '0')})}
                        className="w-14 text-center"
                        placeholder="00"
                    />
                </div>
                <span className="mt-5">:</span>
                <div className="flex flex-col items-center">
                    <label className="text-xs text-muted-foreground mb-1">דקה</label>
                    <Input
                        type="number"
                        min="0"
                        max="59"
                        value={time.minutes}
                        onChange={(e) => setTime({...time, minutes: e.target.value.padStart(2, '0')})}
                        className="w-14 text-center"
                        placeholder="00"
                    />
                </div>
                <span className="mt-5">:</span>
                <div className="flex flex-col items-center">
                    <label className="text-xs text-muted-foreground mb-1">שניה</label>
                    <Input
                        type="number"
                        min="0"
                        max="59"
                        value={time.seconds}
                        onChange={(e) => setTime({...time, seconds: e.target.value.padStart(2, '0')})}
                        className="w-14 text-center"
                        placeholder="00"
                    />
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-3 space-y-3">
            <div className="text-center font-semibold">זמנים</div>
            
            <div className="flex gap-2 justify-center">
                <Button
                    variant={activeTab === 'from' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('from')}
                >
                    מ- (From)
                </Button>
                <Button
                    variant={activeTab === 'to' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('to')}
                >
                    עד- (To)
                </Button>
            </div>

            <Calendar
                mode="single"
                selected={activeTab === 'from' ? fromDate : toDate}
                onSelect={(date) => {
                    if (activeTab === 'from') {
                        setFromDate(date);
                    } else {
                        setToDate(date);
                    }
                }}
                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                captionLayout="dropdown"
            />

            <div className="border-t pt-3">
                <TimeInput 
                    time={activeTab === 'from' ? fromTime : toTime}
                    setTime={activeTab === 'from' ? setFromTime : setToTime}
                    label={activeTab === 'from' ? 'זמן התחלה' : 'זמן סיום'}
                />
            </div>

            <div className="flex justify-between pt-2 border-t">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        if (activeTab === 'to') {
                            setToDate(undefined);
                        }
                    }}
                    disabled={activeTab === 'from'}
                >
                    עכשיו
                </Button>
                <Button
                    size="sm"
                    onClick={handleApply}
                    disabled={!fromDate}
                >
                    אישור
                </Button>
            </div>
        </div>
    );
}
