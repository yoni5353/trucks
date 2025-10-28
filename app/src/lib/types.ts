import type { TimelineItem } from "vis-timeline";

export type EventGroup = "location" | "audio" | "visual" | "text" | "event";

export type EntityEvent = Omit<TimelineItem, "content"> & {
    id: string;
    group: string;
    start: string;
    end?: string;
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
              t: "visual";
          }
        | {
              t: "text";
          }
        | {
              t?: undefined;
          }
    );

export type GeographicEvent = Extract<EntityEvent, { t: "point" | "loc" }>;

export function isGeographicEvent(event: EntityEvent): event is GeographicEvent {
    return event.t === "point" || event.t === "loc";
}
