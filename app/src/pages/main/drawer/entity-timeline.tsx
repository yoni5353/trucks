import { eventsOfEntityQuery } from "@/lib/requests";
import { useQuery } from "@tanstack/react-query";
import { DataSet } from "vis-data";
import "vis-timeline/styles/vis-timeline-graph2d.min.css";
import { TimelineComponent, type TimelineCore } from "../../../components/timeline";
import { useEffect, useMemo, useState } from "react";
import type { TimelineGroup } from "vis-timeline";
import { MapPinned, Volume2, Image, Bot, LayoutList } from "lucide-static";
import { intervalToDuration } from "date-fns";
import { useStore } from "zustand";
import { parametersStore } from "../parameters";
import type { EntityEvent, EventGroup } from "@/lib/types"
import { focusedTimeStore } from "../focus";
import { LoaderIcon } from "lucide-react";
import { RETRIEVAL_COLORS } from "@/consts/timeline-coloring";

const EVENT_GROUPS = [
    {
        id: "location",
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
        id: "event",
        content: `<div style="height: 36px; padding-top: 6px; padding-inline: 4px;">${Bot}</div>`,
        // clusterIcon: Bot,
    },
] satisfies { id: EventGroup; content: string; clusterIcon?: string }[];

export function EntityTimeline({ enityId, entityType }: { enityId: string; entityType: string }) {
    const timeRange = useStore(parametersStore, (s) => s.timeRange);
    const { data: events } = useQuery(eventsOfEntityQuery(entityType, enityId, timeRange));

    const [timeline, setTimeline] = useState<TimelineCore | null>(null);
    const focusedTime = useStore(focusedTimeStore);

    // Add buffers for edges of items
    const min = useMemo(() => new Date(timeRange.start.getTime() - 30 * 60 * 1000), [timeRange]);
    const max = useMemo(
        () => new Date((timeRange.end?.getTime() ?? Date.now()) + 30 * 60 * 1000),
        [timeRange],
    );

    useEffect(() => {
        if (!timeline) return;

        const markerSub = timeline.events.on('markerChange').subscribe((payload) => {
            focusedTime.setStart(payload.time);
        });

        // Example of how to handle clicks if needed in the future
        // const clickSub = timeline.events.on('click').subscribe((payload) => {
        //     console.log('click', payload.eventProperties);
        // });

        return () => {
            markerSub.unsubscribe();
            // clickSub.unsubscribe();
        };
    }, [focusedTime, timeline]);

    // LOAD DATA
    const groups = useMemo(() => new DataSet(EVENT_GROUPS), []);
    const items = useMemo(() => new DataSet(), []);
    if (events && items.getIds().length === 0) {
        for (const e of events) {
            const colors = RETRIEVAL_COLORS[e.retrievalType];
            const style = `
                background-color: ${colors.background};
                border-color: ${colors.border};
                color: ${colors.text};
            `;
            items.add({ ...e, style });
        }
    }

    if (!events) {
        return (
            <div className="flex items-center h-full animate-spin">
                <LoaderIcon />
            </div>
        );
    }

    return (
        <TimelineComponent
            onReady={setTimeline}
            items={items}
            groups={groups}
            options={{
                moveable: true,
                min,
                start: min,
                end: max,
                max,
                template: eventTemplate,
            }}
            clusterTemplate={({ items, group }) => {
                return [
                    `<div style="display: flex; align-items: center; gap: 2px;">${items.length.toString()} ${EVENT_GROUPS.find((g) => g.id === group.groupId)?.clusterIcon}</div>`,
                ];
            }}
            initialMarker={focusedTime.start}
        />
    );
}

function eventTemplate(
    item: EntityEvent & {
        isCluster?: true;
        items: EntityEvent[];
        group: TimelineGroup & { groupId: string };
    },
    _element: HTMLElement,
    _data: unknown,
) {
    if (item.isCluster) {
        return `<div style="display: flex; align-items: center; gap: 2px;">${item.items.length.toString()} ${EVENT_GROUPS.find((g) => g.id === item.group.groupId)?.clusterIcon}</div>`;
    }

    switch (item.t) {
        case "point":
        case "loc":
            return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>';
        case "event":
            return `<span class="m-auto" title="${item.what}">${item.what}</span>`;
        case "audio": {
            const duration = intervalToDuration({
                start: new Date(item.start),
                end: new Date(item.end ?? item.start),
            });
            const minutes = duration.minutes || 0;
            const seconds = duration.seconds || 0;
            const durationText = `${minutes}:${seconds.toString().padStart(2, "0")}`;
            return `<div style="display: flex; align-items: center; gap: 6px; padding: 2px 6px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/></svg><span style="font-size: 12px; white-space: nowrap;">${durationText}</span></div>`;
        }
        default:
            return "";
    }
}
