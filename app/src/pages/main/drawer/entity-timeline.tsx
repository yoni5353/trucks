import { eventsOfEntityQuery } from "@/lib/requests";
import { useQuery } from "@tanstack/react-query";
import { DataSet } from "vis-data";
import "vis-timeline/styles/vis-timeline-graph2d.min.css";
import { MovieTimeline } from "../../../components/timeline/movie-timeline";
import { useEffect, useMemo, useRef } from "react";
import { Timeline, type TimelineGroup } from "vis-timeline";
// no icon imports needed; all timeline icons use project SVGs
const BASE_URL = import.meta.env.BASE_URL || "/";
const LOCATION_ICON_URL = `${BASE_URL}location.svg`;
const PHOTO_ICON_URL = `${BASE_URL}photo.svg`;
const AUDIO_ICON_URL = `${BASE_URL}audio.svg`;
const DEVICE_ICON_URL = `${BASE_URL}device.svg`;
const MESSAGE_ICON_URL = `${BASE_URL}message.svg`;
import { intervalToDuration } from "date-fns";
import { useStore } from "zustand";
import { parametersStore } from "../parameters";
import type { EntityEvent, EventGroup } from "@/lib/types";
import { focusedTimeStore } from "../focus";
import { LoaderIcon } from "lucide-react";
import { type TimelineItem } from "vis-timeline";

const EVENT_GROUPS = [
    {
        id: "location",
        content: `<div style="height: 36px; padding-top: 6px; padding-inline: 4px;"><img src="${LOCATION_ICON_URL}" alt="Location" width="24" height="24" /></div>`,
        clusterIcon: `<img src="${LOCATION_ICON_URL}" alt="Location" width="16" height="16" />`,
    },
    {
        id: "audio",
        content: `<div style="height: 36px; padding-top: 6px; padding-inline: 4px;"><img src="${AUDIO_ICON_URL}" alt="Audio" width="24" height="24" /></div>`,
        clusterIcon: `<img src="${AUDIO_ICON_URL}" alt="Audio" width="16" height="16" />`,
    },
    {
        id: "visual",
        content: `<div style="height: 36px; padding-top: 6px; padding-inline: 4px;"><img src="${PHOTO_ICON_URL}" alt="Photo" width="24" height="24" /></div>`,
        clusterIcon: `<img src="${PHOTO_ICON_URL}" alt="Photo" width="16" height="16" />`,
    },
    {
        id: "text",
        content: `<div style="height: 36px; padding-top: 6px; padding-inline: 4px;"><img src="${MESSAGE_ICON_URL}" alt="Message" width="24" height="24" /></div>`,
        clusterIcon: `<img src="${MESSAGE_ICON_URL}" alt="Message" width="16" height="16" />`,
    },
    {
        id: "event",
        content: `<div style="height: 36px; padding-top: 6px; padding-inline: 4px;"><img src="${DEVICE_ICON_URL}" alt="Device" width="24" height="24" /></div>`,
        clusterIcon: `<img src="${DEVICE_ICON_URL}" alt="Device" width="16" height="16" />`,
    },
] satisfies { id: EventGroup; content: string; clusterIcon?: string }[];

export function EntityTimeline({ enityId, entityType }: { enityId: string; entityType: string }) {
    const timeRange = useStore(parametersStore, (s) => s.timeRange);
    const { data: events } = useQuery(eventsOfEntityQuery(entityType, enityId, timeRange));

    const timelineRef = useRef<Timeline | null>(null);

    // const focusedTimeStart = useStore(focusStore, (s) => s.focusedTimeStart);
    // const setFocusedTimeStart = useStore(focusStore, (s) => s.setFocusedTimeStart);
    const focusedTime = useStore(focusedTimeStore);

    useEffect(
        function focusEventOnClick() {
            if (timelineRef.current) {
                timelineRef.current.on("click", (_properties) => {
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

    // Add buffers for edges of items
    const min = useMemo(() => new Date(timeRange.start.getTime() - 30 * 60 * 1000), [timeRange]);
    const max = useMemo(
        () => new Date((timeRange.end?.getTime() ?? Date.now()) + 30 * 60 * 1000),
        [timeRange],
    );
    useEffect(
        function resizeTimelineWindowOnTimeRangeChange() {
            if (timelineRef.current) {
                // TOFIX: the cluster setting is forgotten here
                // timelineRef.current.setOptions({
                //     min,
                //     start: min,
                //     end: max,
                //     max,
                // });
            }
        },
        [max, min, timeRange],
    );

    // LOAD DATA
    const groups = useMemo(() => new DataSet(EVENT_GROUPS), []);
    const items = useMemo(() => new DataSet<TimelineItem>(), []);
    if (events && items.getIds().length === 0) {
        for (const e of events) {
            items.add(e as unknown as TimelineItem);
        }
    }

    if (!events) {
        return (
            <div className="flex h-full animate-spin items-center">
                <LoaderIcon />
            </div>
        );
    }

    return (
        <MovieTimeline
            timelineRef={timelineRef}
            items={items}
            groups={groups}
            timelineOptions={{
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
            markerStart={focusedTime.start}
            onMarkerStartChange={focusedTime.setStart}
            // onSelect={(itemIds) => {
            //     const selected = items.get(itemIds);
            //     const groupIds = new Set(selected.map((item) => item.group));
            //     selectEntities(select, entities, groupIds);
            // }}
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
            return `<img src="${LOCATION_ICON_URL}" alt="Location" width="16" height="16" />`;
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
            return `<div style="display: flex; align-items: center; gap: 6px; padding: 2px 6px;"><img src="${AUDIO_ICON_URL}" alt="Audio" width="16" height="16" /><span style="font-size: 12px; white-space: nowrap;">${durationText}</span></div>`;
        }
        default:
            return "";
    }
}
