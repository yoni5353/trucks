import { createStore } from "zustand";

export type TimeRange = {
    start: Date;
    end: Date | undefined;
};

export const parametersStore = createStore<{
    timeRange: { start: Date; end: Date | undefined };
    setTimeRange: (timeRange: TimeRange) => void;
}>((set) => ({
    timeRange: { start: new Date(Date.now() - 6 * 60 * 60 * 1000), end: undefined },
    setTimeRange: (timeRange: TimeRange) => set({ timeRange }),
}));
