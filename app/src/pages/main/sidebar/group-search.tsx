import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { groupSearchQuery } from "@/lib/requests";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";

export function GroupSearch({ inputClassName }: { inputClassName?: string }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<{ value: string; label: string }>();

    const { data: groups } = useQuery({
        ...groupSearchQuery(query),
        staleTime: Infinity,
        gcTime: 10000,
        placeholderData: keepPreviousData,
        refetchOnWindowFocus: false,
    });

    return (
        <div className="relative">
            <Command shouldFilter={true} className="rounded-md border bg-background shadow-sm">
                <CommandInput
                    className={inputClassName}
                    value={open ? query : selected?.label}
                    onValueChange={setQuery}
                    placeholder="חפש קבוצה..."
                    onFocus={() => {
                        if (selected) setQuery("");
                        setOpen(true);
                    }}
                    // Workaround to not blur before mouse click on option is registered
                    onBlur={() => setTimeout(() => setOpen(false), 100)}
                />
                {open && (
                    <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-md border bg-popover shadow-lg">
                        <CommandList>
                            <CommandEmpty>לא נמצאו תוצאות</CommandEmpty>
                            {Object.entries(groups ?? [])?.map(([groupName, options]) => (
                                <CommandGroup key={groupName} heading={groupName}>
                                    {options.map((option) => (
                                        <CommandItem
                                            key={option.value}
                                            onSelect={() => {
                                                setOpen(false);
                                                setSelected(option);
                                            }}
                                        >
                                            {option.label}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            ))}
                        </CommandList>
                    </div>
                )}
            </Command>
        </div>
    );
}
