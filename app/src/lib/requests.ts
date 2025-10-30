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
    timeRange: PageParameters["timeRange"],
) => {
    return (
        await queryClient.fetchQuery(eventsOfEntityQuery(entityType, entityId, timeRange))
    ).filter(isGeographicEvent);
};

export const eventsOfEntityQuery = (
    entityType: string,
    entityId: string,
    timeRange: PageParameters["timeRange"],
) =>
    queryOptions<EntityEvent[]>({
        queryKey: ["events", entityType, entityId, timeRange],
        queryFn: async () => {
            const beforeXMinutes = (minutes: number) =>
                new Date(Date.now() - minutes * 60 * 1000).toISOString();
            const events: Array<EntityEvent> = [];

            // prettier-ignore
            return events.concat(
                [
                    { id: "g1", group: "location", t: "point", coords: [34.7818, 31.0853], start: beforeXMinutes(250), retrievalType: 'A'},
                    { id: "g2", group: "location", t: "point", coords: [34.7518, 31.143], start: beforeXMinutes(170), retrievalType: 'A'},
                    { id: "g3", group: "location", t: "point", coords: [34.7418, 31.153], start: beforeXMinutes(160), retrievalType: 'A'},
                    { id: "g4", group: "location", t: "point", coords: [34.7618, 31.28], start: beforeXMinutes(110),  retrievalType: 'A' },
                    { id: "g5", group: "location", t: "point", coords: [34.8, 31.28], start: beforeXMinutes(60), retrievalType: 'A' },
                    { id: "gg1", group: "location", t: "loc", wkt: "POLYGON((34.7777 32.0846, 34.77929 32.0846, 34.77929 32.08595, 34.7777 32.08595, 34.7777 32.0846))", start: beforeXMinutes(50),  retrievalType: 'A' },
                    { id: "gg2", group: "location", t: "loc", wkt: "POLYGON((34.77949 32.0846, 34.78108 32.0846, 34.78108 32.08595, 34.77949 32.08595, 34.77949 32.0846))", start: beforeXMinutes(45),  retrievalType: 'A' },
                    { id: "gg3", group: "location", t: "loc", wkt: "POLYGON((34.78128 32.0846, 34.78287 32.0846, 34.78287 32.08595, 34.78128 32.08595, 34.78128 32.0846))", start: beforeXMinutes(40),  retrievalType: 'A' },
                    { id: "gg4", group: "location", t: "loc", wkt: "POLYGON((34.78307 32.0846, 34.78466 32.0846, 34.78466 32.08595, 34.78307 32.08595, 34.78307 32.0846))", start: beforeXMinutes(35),  retrievalType: 'B' },
                    { id: "gg5", group: "location", t: "loc", wkt: "POLYGON((34.78486 32.0846, 34.78645 32.0846, 34.78645 32.08595, 34.78486 32.08595, 34.78486 32.0846))", start: beforeXMinutes(30), retrievalType: 'A' },
                    { id: "gg6", group: "location", t: "loc", wkt: "POLYGON((34.78665 32.0846, 34.78824 32.0846, 34.78824 32.08595, 34.78665 32.08595, 34.78665 32.0846))", start: beforeXMinutes(25),  retrievalType: 'A' },
                    { id: "gg7", group: "location", t: "loc", wkt: "POLYGON((34.78844 32.0846, 34.79003 32.0846, 34.79003 32.08595, 34.78844 32.08595, 34.78844 32.0846))", start: beforeXMinutes(20),  retrievalType: 'A' },
                    { id: "gg8", group: "location", t: "loc", wkt: "POLYGON((34.79023 32.0846, 34.79182 32.0846, 34.79182 32.08595, 34.79023 32.08595, 34.79023 32.0846))", start: beforeXMinutes(15),  retrievalType: 'A' }
                ],
                [
                    { id: "a1", group: "audio", t: "audio", start: beforeXMinutes(210), end: beforeXMinutes(175), retrievalType: 'A' },
                    { id: "a2", group: "audio", t: "audio", start: beforeXMinutes(100), end: beforeXMinutes(87), retrievalType: 'A' },
                ],
                [
                    { id: "e1", group: "event", t: "event", what: "speeding", start: beforeXMinutes(210), end: beforeXMinutes(175), retrievalType: 'A' },
                    { id: "e2", group: "event", t: "event", what: "harsh_braking", start: beforeXMinutes(100), end: beforeXMinutes(87), retrievalType: 'A' },
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

// Mock truck details data for use in UI components
export const truckDetails = [
    { entity_id: "1", op_id: "OP-001", is_drive: "true", description: "Long-haul tractor", number: "TRK-001", id_ei: "EI-0001", id_si: "SI-0001", mac: "00:1A:2B:3C:4D:01", app_id: "telemetry-v1", app_source: "simulator", first_seen: "2025-10-20T08:00:00Z", last_seen: "2025-10-28T10:30:00Z", first_id: "F-0001", final_decription: "Delivered to Depot A" },
    { entity_id: "2", op_id: "OP-002", is_drive: "false", description: "Refrigerated box truck", number: "TRK-002", id_ei: "EI-0002", id_si: "SI-0002", mac: "00:1A:2B:3C:4D:02", app_id: "telemetry-v1", app_source: "edge-device", first_seen: "2025-10-18T06:15:00Z", last_seen: "2025-10-28T09:45:00Z", first_id: "F-0002", final_decription: "Maintenance scheduled" },
    { entity_id: "3", op_id: "OP-003", is_drive: "true", description: "Flatbed carrier", number: "TRK-003", id_ei: "EI-0003", id_si: "SI-0003", mac: "00:1A:2B:3C:4D:03", app_id: "telemetry-v2", app_source: "simulator", first_seen: "2025-10-10T12:00:00Z", last_seen: "2025-10-28T11:05:00Z", first_id: "F-0003", final_decription: "Assigned to Route 7" },
];

// Query helper to get details for a specific entity
export const truckDetailsQuery = (entityId: string) =>
    queryOptions<typeof truckDetails[number] | undefined>({
        queryKey: ["truckDetails", entityId],
        queryFn: async () => truckDetails.find((d) => d.entity_id === entityId),
    });
