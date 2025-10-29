// Core timeline functionality
export { TimelineCore } from './timeline-core';
export { TimelineEventBus } from './event-bus';

// React component
export { TimelineComponent, type TimelineComponentProps } from './timeline-component';

// Types
export type {
  ClickPayload,
  DoubleClickPayload,
  MarkerChangePayload,
  MouseDownPayload,
  MouseUpPayload,
  MouseMovePayload,
  WindowChangePayload,
  TimelineEventMap,
  TimelineEventType,
  TimelineMarker,
  TimelineWindow,
} from './types';

// Options
export { timelineOptions } from './timeline-options';

// Legacy components (for backward compatibility)
export { MovieTimeline } from './movie-timeline';

// Default export
export { TimelineComponent as default } from './timeline-component';
