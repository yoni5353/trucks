import type { TimelineItem } from "vis-timeline";

export type EventGroup = "location" | "audio" | "visual" | "text" | "event";

export type XterEntity = {
    type: string;
    id: string;
    location: [number, number]
}

export type EntityEvent = Omit<TimelineItem, "content"> & {
    id: string;
    group: string;
    start: string;
    end?: string;
    retrievalType: 'A' | 'B' | 'C';
} & (
        | {
              t: "point";
              coords: [number, number];
          }
        | {
              t: "loc";
              wkt: string;
          }
        | {
              t: "audio";
          }
        | {
              t: "event";
              what: string;
          }
        | {
              t?: undefined;
          }
    );

export type GeographicEvent = Extract<EntityEvent, { t: "point" | "loc" }>;

export function isGeographicEvent(event: EntityEvent): event is GeographicEvent {
    return event.t === "point" || event.t === "loc";
}

export type TruckDetails = {
    entity_id: string;
    op_id: string;
    is_drive: string;
    description: string;
    number: string;
    id_ei: string;
    id_si: string;
    mac: string;
    app_id: string;
    app_source: string;
    first_seen: string;
    last_seen: string;
    first_id: string;
    final_decription: string;
};
