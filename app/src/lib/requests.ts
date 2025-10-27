import { QueryClient, queryOptions } from "@tanstack/react-query";
import { isGeographicEvent, type EntityEvent } from "./types";
import type { PageParameters } from "@/pages/main/parameters";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const url = import.meta.env.VITE_BE_URL || "http://localhost:8080";

export const entitiesQuery = (parameters?: PageParameters) =>
    queryOptions({
        queryKey: ["entities", parameters],
        queryFn: async () => {
            return Array.from({ length: 500 }).map((_, i) => {
                const location = [34.8 + Math.random() * 0.5, 30.2 + Math.random() * 0.5];
                return {
                    type: "truck",
                    id: `${i + 1}`,
                    location,
                };
            });
        },
    });

export const getHistoryOfEntity = async (
    queryClient: QueryClient,
    entityType: string,
    entityId: string,
) => {
    return (await queryClient.fetchQuery(eventsOfEntityQuery(entityType, entityId))).filter(
        isGeographicEvent,
    );
};

export const eventsOfEntityQuery = (entityType: string, entityId: string) =>
    queryOptions<EntityEvent[]>({
        queryKey: ["events", entityType, entityId],
        queryFn: async () => {
            const beforeXMinutes = (minutes: number) =>
                new Date(Date.now() - minutes * 60 * 1000).toISOString();
            const events: Array<EntityEvent> = [];

            // prettier-ignore
            return events.concat(
                [
                    { id: "g1", group: "location", t: "point", coords: [34.7818, 31.0853], start: beforeXMinutes(250), },
                    { id: "g2", group: "location", t: "point", coords: [34.7518, 31.143], start: beforeXMinutes(170), },
                    { id: "g3", group: "location", t: "point", coords: [34.7418, 31.153], start: beforeXMinutes(160), },
                    { id: "g4", group: "location", t: "point", coords: [34.7618, 31.28], start: beforeXMinutes(110) },
                    { id: "g5", group: "location", t: "point", coords: [34.8, 31.28], start: beforeXMinutes(60) },
                ],
                [
                    { id: "a1", group: "audio", t: "audio", start: beforeXMinutes(210), end: beforeXMinutes(175), },
                    { id: "a2", group: "audio", t: "audio", start: beforeXMinutes(100), end: beforeXMinutes(87), },
                ],
                [
                    { id: "e1", group: "event", t: "event", what: "speeding", start: beforeXMinutes(210), end: beforeXMinutes(175), },
                    { id: "e2", group: "event", t: "event", what: "harsh_braking", start: beforeXMinutes(100), end: beforeXMinutes(87), },
                ],
            );
        },
    });

export const eventsQuery = queryOptions({
    queryKey: ["events"],
    queryFn: async () => {
        // prettier-ignore
        return [
            { id: "event-1", entityIds: ["truck-1"], type: "speeding", timestamp: "2024-01-01T00:00:00Z", },
            { id: "event-2", entityIds: ["truck-2"], type: "harsh_braking", timestamp: "2024-01-01T11:00:00Z", },
            { id: "event-3", entityIds: ["truck-1"], type: "geofence_exit", timestamp: "2024-01-01T12:00:00Z", },
            { id: "event-4", entityIds: ["truck-3"], type: "speeding", timestamp: "2024-01-01T19:00:00Z", },
            { id: "event-5", entityIds: ["truck-2"], type: "harsh_acceleration", timestamp: "2024-01-01T14:00:00Z", timestampEnd: "2024-01-01T14:20:00Z", },
            { id: "event-6", entityIds: ["truck-4"], type: "speeding", timestamp: "2024-01-01T16:00:00Z", },
            { id: "event-7", entityIds: ["truck-5"], type: "harsh_braking", timestamp: "2024-01-01T17:00:00Z", },
            { id: "event-8", entityIds: ["truck-6"], type: "geofence_exit", timestamp: "2024-01-01T18:00:00Z", },
            { id: "event-9", entityIds: ["truck-4"], type: "speeding", timestamp: "2024-01-01T20:00:00Z", },
            { id: "event-10", entityIds: ["truck-5"], type: "harsh_acceleration", timestamp: "2024-01-01T21:00:00Z", timestampEnd: "2024-01-01T21:20:00Z", },
            { id: "event-12", entityIds: ["truck-7"], type: "speeding", timestamp: "2024-01-01T23:00:00Z", },
            { id: "event-13", entityIds: ["truck-7"], type: "speeding", timestamp: "2024-01-01T12:00:00Z", },
            { id: "event-14", entityIds: ["truck-7"], type: "speeding", timestamp: "2024-01-01T11:30:00Z", },
            { id: "event-15", entityIds: ["truck-7"], type: "speeding", timestamp: "2024-01-01T12:15:00Z", },
            { id: "event-16", entityIds: ["truck-7"], type: "speeding", timestamp: "2024-01-01T13:00:00Z", },
        ];
    },
});

export const groupSearchQuery = (query: string) =>
    queryOptions<{ [groupName: string]: Array<{ value: string; label: string }> }>({
        queryKey: ["groupSearch", query],
        queryFn: async () => {
            return {
                קבוצות: [
                    { value: "1", label: "קבוצה 1" },
                    { value: "2", label: "קבוצה 2" },
                    { value: "3", label: "קבוצה 3" },
                ],
            };
        },
    });
