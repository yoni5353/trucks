import { Subject, type Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import type { 
  TimelineEventMap, 
  TimelineEventType, 
} from './types';

interface EmittedEvent<T extends TimelineEventType> {
  type: T;
  payload: TimelineEventMap[T];
}

/**
 * RxJS-based event bus for timeline events with strong typing
 */
export class TimelineEventBus {
  private eventSubject = new Subject<EmittedEvent<TimelineEventType>>();

  /**
   * Emit an event of a specific type
   */
  emit<T extends TimelineEventType>(eventType: T, payload: TimelineEventMap[T]): void {
    this.eventSubject.next({ type: eventType, payload });
  }

  /**
   * Subscribe to events of a specific type
   */
  on<T extends TimelineEventType>(eventType: T): Observable<TimelineEventMap[T]> {
    return this.eventSubject.asObservable().pipe(
      filter((event: EmittedEvent<TimelineEventType>): event is EmittedEvent<T> => event.type === eventType),
      map(event => event.payload)
    );
  }

  /**
   * Complete all subjects and clean up
   */
  destroy(): void {
    this.eventSubject.complete();
  }
}
