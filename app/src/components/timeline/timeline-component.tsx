import { useEffect, useRef, useState, type RefObject } from "react";
import { DataSet } from "vis-data";
import type { TimelineItem, TimelineOptions } from "vis-timeline/esnext";
import "vis-timeline/styles/vis-timeline-graph2d.min.css";
import "./movie-timeline.css";
import { TimelineCore } from './timeline-core';

export interface TimelineComponentProps<T extends TimelineItem> {
    timelineRef?: RefObject<TimelineCore | null>;
    items: DataSet<T>;
    groups?: DataSet<object>;
    options?: Partial<TimelineOptions>;
    clusterTemplate?: (props: { items: TimelineItem[]; group: { groupId: string } }) => [string];
    initialMarker?: Date;
    className?: string;
}

/**
 * React component wrapper for the TimelineCore class
 */
export function TimelineComponent<T extends TimelineItem>({
    timelineRef,
    items,
    groups,
    options,
    clusterTemplate,
    initialMarker,
    className = "h-full w-[100vw]",
}: TimelineComponentProps<T>) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    timelineRef ??= useRef<TimelineCore | null>(null);
    const [timeline, setTimeline] = useState<TimelineCore | null>(null);

    // Initialize timeline
    useEffect(() => {
        if (containerRef.current && !timelineRef.current) {
            const mergedOptions: Partial<TimelineOptions> = { ...options };
            if (clusterTemplate) {
                mergedOptions.cluster = { titleTemplate: clusterTemplate };
            }

            const newTimeline = new TimelineCore(
                containerRef.current,
                items,
                groups,
                mergedOptions
            );

            timelineRef.current = newTimeline;
            setTimeline(newTimeline);

            // Set initial marker if provided
            if (initialMarker) {
                newTimeline.setOrAddMarker("marker", initialMarker);
            }
        }

        return () => {
            timelineRef.current?.destroy();
            timelineRef.current = null;
            setTimeline(null);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items, groups]);

    useEffect(() => {
        if (timeline && options) {
            timeline.setOptions(options);
        }
    }, [timeline, options]);

    return <div dir="ltr" ref={containerRef} className={className} />;
}
