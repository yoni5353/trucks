import type { EntityEvent } from "@/lib/types";
import { createStore } from "zustand";

/** Current focused time in the timeline (currently in the entity timeline only) */
export const focusedTimeStore = createStore<{
    start?: Date;
    setStart: (timeStart: Date) => void;
}>((set) => ({
    setStart: (start) => set({ start }),
}));

export const focusStore = createStore<{
    focusedEvent?: EntityEvent;
    setFocusedEvent: (event: EntityEvent) => void;
}>((set) => ({
    setFocusedEvent: (event) => set({ focusedEvent: event }),
}));
