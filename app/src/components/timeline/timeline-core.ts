import { DataSet } from "vis-data";
import { Timeline as VisTimeline, type TimelineEventPropertiesResult, type TimelineItem, type TimelineOptions } from "vis-timeline/esnext";
import { TimelineEventBus } from './event-bus';
import { timelineOptions as defaultTimelineOptions } from "./timeline-options";
import type { 
  TimelineMarker, 
  TimelineWindow,
} from './types';


export class TimelineCore {
  private visTimeline: VisTimeline | null = null;
  private container: HTMLElement | null = null;
  private eventBus: TimelineEventBus;
  private markers: Map<string, TimelineMarker> = new Map();
  private isDragging = false;
  private options: TimelineOptions;

  constructor(
    container: HTMLElement,
    items: DataSet<TimelineItem>,
    groups?: DataSet<object>,
    options?: Partial<TimelineOptions>
  ) {
    this.container = container;
    this.eventBus = new TimelineEventBus();
    this.options = this.mergeOptions(options);
    this.initialize(items, groups);
    this.setupEventHandlers();
  }

  /**
   * Get the event bus for subscribing to events
   */
  get events(): TimelineEventBus {
    return this.eventBus;
  }

  // Private methods
  private mergeOptions(customOptions?: Partial<TimelineOptions>): TimelineOptions {
    return {
      ...defaultTimelineOptions,
      ...customOptions,
    } as TimelineOptions;
  }

  private initialize(items: DataSet<TimelineItem>, groups?: DataSet<object>): void {
    if (!this.container) {
      throw new Error('Container element is required');
    }

    // @ts-expect-error - Type mismatch in vis-timeline DataSet
    this.visTimeline = new VisTimeline(this.container, items, groups, this.options);
    this.fixInitialClusterDisplay();
  }

  private fixInitialClusterDisplay(): void {
    // Fix for items not showing up initially when clustering is enabled
    if (this.options.cluster && this.visTimeline) {
      const window = this.visTimeline.getWindow();
      this.visTimeline.setWindow(window.start, window.end);
    }
  }

  private setupEventHandlers(): void {
    if (!this.visTimeline) return;

    // Selection events
    this.visTimeline.on("select", (properties) => {
      this.eventBus.emit('select', { itemIds: properties.items });
    });

    // Click events
    this.visTimeline.on("click", (properties) => {
      const eventProps = this.visTimeline!.getEventProperties(properties.event);
      this.eventBus.emit('click', { eventProperties: eventProps });
    });

    // Double click events
    this.visTimeline.on("doubleClick", (properties) => {
      const eventProps = this.visTimeline!.getEventProperties(properties.event);
      this.handleDoubleClick(eventProps);
      this.eventBus.emit('doubleClick', { eventProperties: eventProps });
    });

    // Mouse events for marker functionality
    this.setupMarkerEventHandlers();

    // Window change events
    this.visTimeline.on("rangechange", () => {
      if (this.visTimeline) {
        const window = this.visTimeline.getWindow();
        this.eventBus.emit('windowChange', {
          start: window.start,
          end: window.end,
        });
      }
    });
  }

  private setupMarkerEventHandlers(): void {
    if (!this.visTimeline) return;

    this.visTimeline.on("mouseDown", (properties) => {
      const eventProps = this.visTimeline!.getEventProperties(properties.event);
      
      if (this.shouldHandleMarkerEvent(eventProps, properties.event)) {
        this.startMarkerDrag(eventProps);
      }

      this.eventBus.emit('mouseDown', { eventProperties: eventProps });
    });

    this.visTimeline.on("mouseUp", () => {
      if (this.isDragging) {
        this.stopMarkerDrag();
      }
      this.eventBus.emit('mouseUp', {});
    });

    this.visTimeline.on("mouseMove", (properties) => {
      const eventProps = this.visTimeline!.getEventProperties(properties.event);

      if (this.isDragging) {
        this.updateMarkerPosition(eventProps.time);
      }

      this.eventBus.emit('mouseMove', { eventProperties: eventProps });
    });
  }

  private shouldHandleMarkerEvent(eventProps: TimelineEventPropertiesResult, event: Event): boolean {
    const mouseEvent = event as MouseEvent;
    return (
      (eventProps.what === "axis" || eventProps.what === "custom-time") &&
      !mouseEvent.shiftKey &&
      !mouseEvent.ctrlKey
    );
  }

  private startMarkerDrag(eventProps: TimelineEventPropertiesResult): void {
    this.isDragging = true;
    this.setTimelineMoveable(false);
    this.setOrAddMarker("marker", eventProps.time);
  }

  private stopMarkerDrag(): void {
    this.isDragging = false;
    this.setTimelineMoveable(true);
  }

  private updateMarkerPosition(time: Date): void {
    this.setMarker("marker", time);
  }

  private handleDoubleClick(eventProps: TimelineEventPropertiesResult): void {
    if (!this.visTimeline) return;

    // Reset window on double click
    const window = this.visTimeline.getWindow();
    this.visTimeline.setWindow(window.start, window.end);

    // Remove custom time marker if clicked
    if (eventProps.what === "custom-time") {
      this.removeMarker("marker");
    }
  }

  private setTimelineMoveable(moveable: boolean): void {
    if (this.visTimeline) {
      this.visTimeline.setOptions({ 
        moveable, 
        cluster: this.options.cluster 
      });
    }
  }

  // Public API methods
  public setMarker(id: string, time: Date): void {
    if (!this.visTimeline) return;

    try {
      this.visTimeline.setCustomTime(time, id);
      this.markers.set(id, { id, time });
      
      this.eventBus.emit('markerChange', {
        markerId: id,
        time,
      });
    } catch (error) {
      console.warn(`Failed to set marker ${id}:`, error);
    }
  }

  public addMarker(id: string, time: Date): void {
    if (!this.visTimeline) return;

    try {
      this.visTimeline.addCustomTime(time, id);
      this.markers.set(id, { id, time });
      
      this.eventBus.emit('markerChange', {
        markerId: id,
        time,
      });
    } catch (error) {
      console.warn(`Failed to add marker ${id}:`, error);
    }
  }

  public setOrAddMarker(id: string, time: Date): void {
    if (this.markers.has(id)) {
      this.setMarker(id, time);
    } else {
      this.addMarker(id, time);
    }
  }

  public removeMarker(id: string): void {
    if (!this.visTimeline) return;

    try {
      this.visTimeline.removeCustomTime(id);
      const marker = this.markers.get(id);
      this.markers.delete(id);
      
      if (marker) {
        this.eventBus.emit('markerChange', {
          markerId: id,
          time: marker.time,
          removed: true,
        });
      }
    } catch (error) {
      console.warn(`Failed to remove marker ${id}:`, error);
    }
  }

  public getMarker(id: string): TimelineMarker | undefined {
    return this.markers.get(id);
  }

  public getAllMarkers(): TimelineMarker[] {
    return Array.from(this.markers.values());
  }

  public setWindow(start: Date, end: Date): void {
    this.visTimeline?.setWindow(start, end);
  }

  public getWindow(): TimelineWindow | null {
    const window = this.visTimeline?.getWindow();
    return window ? { start: window.start, end: window.end } : null;
  }

  public setOptions(options: Partial<TimelineOptions>): void {
    this.options = this.mergeOptions(options);
    this.visTimeline?.setOptions(this.options);
  }

  public setSelection(ids: string[]): void {
    this.visTimeline?.setSelection(ids);
  }

  public getSelection(): string[] {
    const selection = this.visTimeline?.getSelection() || [];
    return selection.map(id => String(id));
  }

  public destroy(): void {
    this.eventBus.destroy();
    this.markers.clear();
    this.visTimeline?.destroy();
    this.visTimeline = null;
    this.container = null;
  }

  // Getter for the underlying vis-timeline instance (for advanced usage)
  public getVisTimeline(): VisTimeline | null {
    return this.visTimeline;
  }
}
