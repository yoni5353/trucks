import { useEffect, useRef, type RefObject } from "react";
import { DataSet } from "vis-data";
import { Timeline, type TimelineOptions } from "vis-timeline/esnext";
import "vis-timeline/styles/vis-timeline-graph2d.min.css";
import "./movie-timeline.css";

/** Shows timeline with a marker selection */
export function MovieTimeline<T extends object>({
    timelineRef,
    items,
    groups,
    onSelect,
    timelineOptions,
    onCurrentTimeChange,
}: {
    timelineRef?: RefObject<Timeline | null>;
    items: DataSet<T>;
    groups?: DataSet<object>;
    onSelect?: (itemIds: string[]) => void;
    timelineOptions?: TimelineOptions;
    onCurrentTimeChange?: (time: Date) => void;
}) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    timelineRef ??= useRef<Timeline | null>(null);
    const timeline = timelineRef.current;

    useEffect(() => {
        if (containerRef.current && !timelineRef.current) {
            const options = {
                width: "100%",
                height: "100%",
                stack: false,
                zoomMin: 1000 * 60 * 60,
                zoomMax: 1000 * 60 * 60 * 24 * 31,
                start: new Date("2024-01-01T00:00:00Z"),
                end: new Date("2024-01-02T00:00:00Z"),
                selectable: true,
                multiselect: true,
                moveable: false,
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
                    console.log(a.order, b.order);
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

            timeline.on("doubleClick", function (properties) {
                const eventProps = timeline.getEventProperties(properties.event);
                // console.log({ eventProps });
                if (eventProps.what === "custom-time") {
                    timeline.removeCustomTime(eventProps.customTime);
                } else {
                    const id = new Date().getTime();
                    // const markerText = document.getElementById("markerText").value || undefined;
                    timeline.addCustomTime(eventProps.time, id);
                    timeline.setCustomTimeMarker("some text", id);
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

    return <div dir="ltr" ref={containerRef} className="h-full w-[1000px]" />;
}
