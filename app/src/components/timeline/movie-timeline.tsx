import { useEffect, useRef, useState, type RefObject } from "react";
import { DataSet } from "vis-data";
import { Timeline, type TimelineItem, type TimelineOptions } from "vis-timeline/esnext";
import "vis-timeline/styles/vis-timeline-graph2d.min.css";
import "./movie-timeline.css";

/** Shows timeline with a marker selection */
export function MovieTimeline<T extends TimelineItem>({
    timelineRef,
    items,
    groups,
    onSelect,
    timelineOptions,
    clusterTemplate,
    markerStart,
    onMarkerStartChange,
}: {
    timelineRef?: RefObject<Timeline | null>;
    items: DataSet<T>;
    groups?: DataSet<object>;
    onSelect?: (itemIds: string[]) => void;
    timelineOptions?: TimelineOptions;
    clusterTemplate?: (props: { items: TimelineItem[]; group: { groupId: string } }) => [string];
    markerStart?: Date;
    onMarkerStartChange?: (time: Date) => void;
}) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    timelineRef ??= useRef<Timeline | null>(null);
    const timeline = timelineRef.current;

    useEffect(() => {
        if (containerRef.current && !timelineRef.current) {
            const cluster = { titleTemplate: clusterTemplate }; // the "cluster" setting is lost on "setOptions"
            const options = {
                width: "100%",
                height: "100%",
                stack: false,
                zoomMin: 1000 * 60,
                zoomMax: 1000 * 60 * 60 * 24 * 7,
                start: new Date(Date.now() - 24 * 60 * 60 * 1000),
                end: new Date(),
                selectable: true,
                multiselect: true,
                moveable: false,
                rtl: true,
                cluster,
                snap: (date, _scale, _step) => {
                    const minute = 60 * 1000;
                    return Math.round(date.valueOf() / minute) * minute;
                },
                // group drag-and-drop ordering
                groupEditable: { order: true },
                groupOrder: function (a, b) {
                    return a.order - b.order;
                },
                groupOrderSwap: function (a, b, _groups) {
                    const v = a.order;
                    a.order = b.order;
                    b.order = v;
                },
                // Important workaround-fix for initial loading, see https://github.com/visjs/vis-timeline/issues/1340
                rollingMode: { follow: false },
                // temp
                xss: { disabled: true },
                // rest
                ...timelineOptions,
            } satisfies TimelineOptions;
            timelineRef.current = new Timeline(containerRef.current, items, groups, options);
            const timeline = timelineRef.current;

            // Fix for items not showing up initially when clustering is enabled (they show up only after zoom change)
            if (cluster) {
                const w = timeline.getWindow();
                timeline.setWindow(w.start, w.end);
            }

            // Ensure initial render after layout sizing
            try {
                timeline.redraw();
            } catch {}

            // Add events for time marker

            let isDragging = false;
            const setMarker = (time: Date) => {
                timeline.setCustomTime(time, "marker");
                onMarkerStartChange?.(time);
            };
            timeline.on("mouseDown", function (properties) {
                const eventProps = timeline.getEventProperties(properties.event);
                if (
                    (eventProps.what !== "axis" && eventProps.what !== "custom-time") ||
                    properties.event.shiftKey ||
                    properties.event.ctrlKey
                ) {
                    return;
                }
                isDragging = true;

                timeline.setOptions({ moveable: false, cluster });
                try {
                    setMarker(eventProps.time);
                } catch {
                    timeline.addCustomTime(eventProps.time, "marker");
                }
            });
            timeline.on("mouseUp", function () {
                isDragging = false;
                timeline.setOptions({ moveable: true, cluster });
            });
            timeline.on("mouseMove", function (properties) {
                if (isDragging) {
                    const eventProps = timeline.getEventProperties(properties.event);
                    setMarker(eventProps.time);
                }
            });
            timeline.on("doubleClick", function (properties) {
                const w = timeline.getWindow();
                timeline.setWindow(w.start, w.end);
                const eventProps = timeline.getEventProperties(properties.event);
                if (eventProps.what === "custom-time") {
                    timeline.removeCustomTime(eventProps.customTime);
                }
            });
        }

        return () => {
            timelineRef.current?.destroy();
            timelineRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groups, items, timelineRef]);

    useEffect(() => {
        timeline?.on("select", (properties) => {
            const eventProps = timeline.getEventProperties(properties.event);
            onSelect?.(properties.items);
        });
    }, [onSelect, timeline, timelineRef]);

    return <div dir="rtl" ref={containerRef} className="h-[296px] w-full" />;
}
