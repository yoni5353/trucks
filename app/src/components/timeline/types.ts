import type { TimelineEventPropertiesResult } from "vis-timeline/esnext";

// Event Payloads
export interface SelectPayload {
  itemIds: string[];
}

export interface ClickPayload {
  eventProperties: TimelineEventPropertiesResult;
}

export interface DoubleClickPayload {
  eventProperties: TimelineEventPropertiesResult;
}

export interface MarkerChangePayload {
  markerId: string;
  time: Date;
  removed?: boolean;
}

export interface MouseDownPayload {
  eventProperties: TimelineEventPropertiesResult;
}

export interface MouseUpPayload {
  eventProperties?: TimelineEventPropertiesResult;
}

export interface MouseMovePayload {
  eventProperties: TimelineEventPropertiesResult;
}

export interface WindowChangePayload {
  start: Date;
  end: Date;
}

// Event type mapping for type safety
export interface TimelineEventMap {
  select: SelectPayload;
  click: ClickPayload;
  doubleClick: DoubleClickPayload;
  markerChange: MarkerChangePayload;
  mouseDown: MouseDownPayload;
  mouseUp: MouseUpPayload;
  mouseMove: MouseMovePayload;
  windowChange: WindowChangePayload;
}

// Event type keys
export type TimelineEventType = keyof TimelineEventMap;

// Marker interface
export interface TimelineMarker {
  id: string;
  time: Date;
}

// Window interface
export interface TimelineWindow {
  start: Date;
  end: Date;
}
