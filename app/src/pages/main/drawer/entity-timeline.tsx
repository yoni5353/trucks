import { eventsOfEntityQuery } from "@/lib/requests";
import { useQuery } from "@tanstack/react-query";
import { DataSet } from "vis-data";
import "vis-timeline/styles/vis-timeline-graph2d.min.css";
import { MovieTimeline } from "../../../components/timeline/movie-timeline";
import { useEffect, useMemo, useRef } from "react";
import type { Timeline } from "vis-timeline";
import { MapPinned, Volume2, Image, Bot, LayoutList, MapPin } from "lucide-static";
import { intervalToDuration } from "date-fns";

const EVENT_GROUPS = [
    {
        id: "locations",
        content: `<div style="height: 36px; padding-top: 6px; padding-inline: 4px;">${MapPinned}</div>`,
        clusterIcon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>`,
    },
    {
        id: "audio",
        content: `<div style="height: 36px; padding-top: 6px; padding-inline: 4px;">${Volume2}</div>`,
        clusterIcon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/></svg>`,
    },
    {
        id: "visual",
        content: `<div style="height: 36px; padding-top: 6px; padding-inline: 4px;">${Image}</div>`,
        // clusterIcon: Image,
    },
    {
        id: "text",
        content: `<div style="height: 36px; padding-top: 6px; padding-inline: 4px;">${LayoutList}</div>`,
        // clusterIcon: LayoutList,
    },
    {
        id: "events",
        content: `<div style="height: 36px; padding-top: 6px; padding-inline: 4px;">${Bot}</div>`,
        // clusterIcon: Bot,
    },
];

export function EntityTimeline({ enityId, entityType }: { enityId: string; entityType: string }) {
    const { data: events } = useQuery(eventsOfEntityQuery(entityType, enityId));

    const timelineRef = useRef<Timeline | null>(null);

    useEffect(
        function focusEventOnClick() {
            if (timelineRef.current) {
                timelineRef.current.on("click", (properties) => {
                    const event = timelineRef.current?.getEventProperties(properties.event);
                    // if (event && event.what === "group-label") {
                    //     const groupId = event.group;
                    //     if (groupId) {
                    //         onFocusEntity(groupId.toString());
                    //     }
                    // }
                });
            }
        },
        [timelineRef, events],
    );

    const items = useMemo(() => new DataSet(), []);
    const groups = useMemo(() => new DataSet(EVENT_GROUPS), []);
    if (events && items.getIds().length === 0) {
        for (const location of events.locations) {
            items.add({
                id: events.locations.indexOf(location).toString(),
                className: "w-8 h-8 p-0.5",
                start: location.time,
                content:
                    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>',
                group: "locations",
            });
        }
        let x = 0;
        for (const event of events.events) {
            const duration = intervalToDuration({
                start: new Date(event.start),
                end: new Date(event.end),
            });
            const minutes = duration.minutes || 0;
            const seconds = duration.seconds || 0;
            const durationText = `${minutes}:${seconds.toString().padStart(2, "0")}`;

            items.add({
                id: x++,
                content: `<div style="display: flex; align-items: center; gap: 6px; padding: 2px 6px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/></svg><span style="font-size: 12px; white-space: nowrap;">${durationText}</span></div>`,
                start: event.start,
                end: event.end,
                group: "audio",
            });
        }
    }

    if (!events) {
        return <div>Loading...</div>;
    }

    return (
        <MovieTimeline
            timelineRef={timelineRef}
            items={items}
            groups={groups}
            timelineOptions={{ moveable: true }}
            clusterTitleTemplate={({ items, group }) => {
                return [
                    `<div style="display: flex; align-items: center; gap: 2px;">${items.length.toString()} ${EVENT_GROUPS.find((g) => g.id === group.groupId)?.clusterIcon}</div>`,
                ];
            }}
            // onSelect={(itemIds) => {
            //     const selected = items.get(itemIds);
            //     const groupIds = new Set(selected.map((item) => item.group));
            //     selectEntities(select, entities, groupIds);
            // }}
        />
    );
}
