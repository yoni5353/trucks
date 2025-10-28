import { QueryClient, queryOptions } from "@tanstack/react-query";
import { isGeographicEvent, type EntityEvent } from "./types";
import type { PageParameters } from "@/pages/main/parameters";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const url = import.meta.env.VITE_BE_URL || "http://localhost:8080";

export const entitiesQuery = (parameters?: PageParameters) =>
    queryOptions({
        queryKey: ["entities", parameters],
        queryFn: async () => {
            // 5 trucks with their final/current locations
            return [
                { type: "truck", id: "1", location: [34.7818, 32.0853] }, // Tel Aviv area
                { type: "truck", id: "2", location: [35.2137, 31.7683] }, // Jerusalem area  
                { type: "truck", id: "3", location: [34.9896, 32.7940] }, // Haifa area
                { type: "truck", id: "4", location: [34.8516, 31.0461] }, // Beer Sheva area
                { type: "truck", id: "5", location: [35.4983, 32.9257] }, // Tiberias area
            ];
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
            
            // Each truck has a unique route ending at their final location
            const truckRoutes: { [key: string]: EntityEvent[] } = {
                "1": [ // Tel Aviv route - coastal journey ending in Tel Aviv
                    { id: "t1-g1", group: "location", t: "point", coords: [34.8516, 31.0461], start: beforeXMinutes(240) }, // Started in Beer Sheva
                    { id: "t1-g2", group: "location", t: "point", coords: [34.8200, 31.2500], start: beforeXMinutes(200) },
                    { id: "t1-g3", group: "location", t: "point", coords: [34.8000, 31.5000], start: beforeXMinutes(160) },
                    { id: "t1-g4", group: "location", t: "point", coords: [34.7900, 31.7500], start: beforeXMinutes(120) },
                    { id: "t1-g5", group: "location", t: "point", coords: [34.7850, 31.9500], start: beforeXMinutes(80) },
                    { id: "t1-g6", group: "location", t: "point", coords: [34.7818, 32.0853], start: beforeXMinutes(40) }, // Final: Tel Aviv
                    { id: "t1-a1", group: "audio", t: "audio", start: beforeXMinutes(180), end: beforeXMinutes(170) },
                    { id: "t1-e1", group: "event", t: "event", what: "speeding", start: beforeXMinutes(150) },
                ],
                "2": [ // Jerusalem route - mountain climb to Jerusalem
                    { id: "t2-g1", group: "location", t: "point", coords: [34.7818, 32.0853], start: beforeXMinutes(240) }, // Started in Tel Aviv
                    { id: "t2-g2", group: "location", t: "point", coords: [34.8500, 31.9500], start: beforeXMinutes(200) },
                    { id: "t2-g3", group: "location", t: "point", coords: [34.9500, 31.8500], start: beforeXMinutes(160) },
                    { id: "t2-g4", group: "location", t: "point", coords: [35.0500, 31.8000], start: beforeXMinutes(120) },
                    { id: "t2-g5", group: "location", t: "point", coords: [35.1500, 31.7800], start: beforeXMinutes(80) },
                    { id: "t2-g6", group: "location", t: "point", coords: [35.2137, 31.7683], start: beforeXMinutes(40) }, // Final: Jerusalem
                    { id: "t2-a1", group: "audio", t: "audio", start: beforeXMinutes(130), end: beforeXMinutes(115) },
                    { id: "t2-e1", group: "event", t: "event", what: "harsh_braking", start: beforeXMinutes(90) },
                ],
                "3": [ // Haifa route - northern coastal journey
                    { id: "t3-g1", group: "location", t: "point", coords: [34.7818, 32.0853], start: beforeXMinutes(240) }, // Started in Tel Aviv
                    { id: "t3-g2", group: "location", t: "point", coords: [34.8000, 32.2500], start: beforeXMinutes(200) },
                    { id: "t3-g3", group: "location", t: "point", coords: [34.8500, 32.4000], start: beforeXMinutes(160) },
                    { id: "t3-g4", group: "location", t: "point", coords: [34.9000, 32.5500], start: beforeXMinutes(120) },
                    { id: "t3-g5", group: "location", t: "point", coords: [34.9500, 32.7000], start: beforeXMinutes(80) },
                    { id: "t3-g6", group: "location", t: "point", coords: [34.9896, 32.7940], start: beforeXMinutes(40) }, // Final: Haifa
                    { id: "t3-a1", group: "audio", t: "audio", start: beforeXMinutes(210), end: beforeXMinutes(195) },
                    { id: "t3-e1", group: "event", t: "event", what: "speeding", start: beforeXMinutes(100) },
                ],
                "4": [ // Beer Sheva route - southern desert journey
                    { id: "t4-g1", group: "location", t: "point", coords: [35.2137, 31.7683], start: beforeXMinutes(240) }, // Started in Jerusalem
                    { id: "t4-g2", group: "location", t: "point", coords: [35.1000, 31.6000], start: beforeXMinutes(200) },
                    { id: "t4-g3", group: "location", t: "point", coords: [35.0000, 31.4500], start: beforeXMinutes(160) },
                    { id: "t4-g4", group: "location", t: "point", coords: [34.9500, 31.3000], start: beforeXMinutes(120) },
                    { id: "t4-g5", group: "location", t: "point", coords: [34.9000, 31.1500], start: beforeXMinutes(80) },
                    { id: "t4-g6", group: "location", t: "point", coords: [34.8516, 31.0461], start: beforeXMinutes(40) }, // Final: Beer Sheva
                    { id: "t4-a1", group: "audio", t: "audio", start: beforeXMinutes(150), end: beforeXMinutes(140) },
                    { id: "t4-e1", group: "event", t: "event", what: "harsh_acceleration", start: beforeXMinutes(110) },
                ],
                "5": [ // Tiberias route - valley to lake journey
                    { id: "t5-g1", group: "location", t: "point", coords: [34.9896, 32.7940], start: beforeXMinutes(240) }, // Started in Haifa
                    { id: "t5-g2", group: "location", t: "point", coords: [35.1000, 32.8000], start: beforeXMinutes(200) },
                    { id: "t5-g3", group: "location", t: "point", coords: [35.2000, 32.8500], start: beforeXMinutes(160) },
                    { id: "t5-g4", group: "location", t: "point", coords: [35.3000, 32.8800], start: beforeXMinutes(120) },
                    { id: "t5-g5", group: "location", t: "point", coords: [35.4000, 32.9000], start: beforeXMinutes(80) },
                    { id: "t5-g6", group: "location", t: "point", coords: [35.4983, 32.9257], start: beforeXMinutes(40) }, // Final: Tiberias
                    { id: "t5-a1", group: "audio", t: "audio", start: beforeXMinutes(190), end: beforeXMinutes(175) },
                    { id: "t5-e1", group: "event", t: "event", what: "geofence_exit", start: beforeXMinutes(130) },
                ],
            };

            // Return the route for the requested truck, or empty if not found
            return truckRoutes[entityId] || [];
        },
    });

export const eventsQuery = queryOptions({
    queryKey: ["events"],
    queryFn: async () => {
        const now = new Date();
        const beforeXHours = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
        
        // Events for the 5 trucks matching their journeys
        return [
            { id: "event-1", entityIds: ["truck-1"], type: "speeding", timestamp: beforeXHours(2.5) },
            { id: "event-2", entityIds: ["truck-2"], type: "harsh_braking", timestamp: beforeXHours(1.5) },
            { id: "event-3", entityIds: ["truck-3"], type: "speeding", timestamp: beforeXHours(1.7) },
            { id: "event-4", entityIds: ["truck-4"], type: "harsh_acceleration", timestamp: beforeXHours(1.8) },
            { id: "event-5", entityIds: ["truck-5"], type: "geofence_exit", timestamp: beforeXHours(2.2) },
            { id: "event-6", entityIds: ["truck-1"], type: "audio_alert", timestamp: beforeXHours(3.0) },
            { id: "event-7", entityIds: ["truck-2"], type: "audio_alert", timestamp: beforeXHours(2.2), timestampEnd: beforeXHours(1.9) },
            { id: "event-8", entityIds: ["truck-3"], type: "audio_alert", timestamp: beforeXHours(3.5), timestampEnd: beforeXHours(3.25) },
            { id: "event-9", entityIds: ["truck-4"], type: "audio_alert", timestamp: beforeXHours(2.5), timestampEnd: beforeXHours(2.33) },
            { id: "event-10", entityIds: ["truck-5"], type: "audio_alert", timestamp: beforeXHours(3.2), timestampEnd: beforeXHours(2.9) },
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
