import { createStore } from "zustand";

export interface PageParameters {
    selectedWkt?: string;
    timeRange?: { start: Date; end: Date | undefined };
}

export type TimeRange = {
    start: Date;
    end: Date | undefined;
};

export const parametersStore = createStore<{
    selectedWkt: string | undefined;
    setSelectedWkt: (wkt?: string) => void;
    timeRange: { start: Date; end: Date | undefined };
    setTimeRange: (timeRange: TimeRange) => void;
}>((set) => ({
    selectedWkt: undefined,
    setSelectedWkt: (wkt: string | undefined) => set({ selectedWkt: wkt }),
    timeRange: { start: new Date(Date.now() - 6 * 60 * 60 * 1000), end: undefined },
    setTimeRange: (timeRange: TimeRange) => set({ timeRange }),
}));
