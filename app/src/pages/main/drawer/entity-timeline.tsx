import { eventsOfEntityQuery } from "@/lib/requests";
import { useQuery } from "@tanstack/react-query";
import { DataSet } from "vis-data";
import "vis-timeline/styles/vis-timeline-graph2d.min.css";
import { MovieTimeline } from "../../../components/timeline/movie-timeline";
import { useEffect, useMemo, useRef, useState } from "react";
import { Timeline, type TimelineGroup, type TimelineItem } from "vis-timeline";
import { MapPinned, Volume2, Image, Bot, LayoutList } from "lucide-static";
import { intervalToDuration } from "date-fns";
import { useStore } from "zustand";
import { parametersStore } from "../parameters";
import type { EntityEvent, EventGroup } from "@/lib/types";
import { focusedTimeStore } from "../focus";
import { LoaderIcon } from "lucide-react";
// Dialog removed in favor of a lightweight floating card
import { audioEventMetadataQuery, eventMetadataQuery, visualEventMetadataQuery, textEventMetadataQuery } from "@/lib/requests";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

    const timelineRef = useRef<Timeline | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<EntityEvent | null>(null);
    const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null);
    const [computedPos, setComputedPos] = useState<{ left: number; top: number } | null>(null);
    const popupRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!selectedEvent || !popupPos) {
            setComputedPos(null);
            return;
        }
        const margin = 8;
        let left = popupPos.x + margin;
        let top = popupPos.y + margin;

        // First set a provisional position so we can measure
        setComputedPos({ left, top });

        // Measure after paint and adjust to keep within viewport and choose above/below
        const id = requestAnimationFrame(() => {
            const el = popupRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            // Horizontal clamp
            if (left + rect.width + margin > vw) {
                left = Math.max(margin, vw - rect.width - margin);
            }

            // Prefer below; if not enough space, place above
            if (top + rect.height + margin > vh) {
                const above = popupPos.y - rect.height - margin;
                top = above < margin ? Math.max(margin, vh - rect.height - margin) : above;
            }

            setComputedPos({ left, top });
        });

        return () => cancelAnimationFrame(id);
    }, [selectedEvent, popupPos]);

    // const focusedTimeStart = useStore(focusStore, (s) => s.focusedTimeStart);
    // const setFocusedTimeStart = useStore(focusStore, (s) => s.setFocusedTimeStart);
    const focusedTime = useStore(focusedTimeStore);

    // Selection is handled via onSelect prop on MovieTimeline

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
    const items = useMemo<DataSet<EntityEvent>>(() => new DataSet<EntityEvent>(), []);
    if (events && items.getIds().length === 0) {
        for (const e of events) {
            items.add(e);
        }
    }

    // Query audio metadata when an audio event is selected
    const { data: audioMeta } = useQuery({
        ...audioEventMetadataQuery((selectedEvent?.id as string) ?? ""),
        enabled: selectedEvent?.t === "audio",
    });

    // Query event/visual/text metadata when relevant
    const { data: genericEventMeta } = useQuery({
        ...eventMetadataQuery((selectedEvent?.id as string) ?? ""),
        enabled: selectedEvent?.t === "event",
    });
    const { data: visualMeta } = useQuery({
        ...visualEventMetadataQuery((selectedEvent?.id as string) ?? ""),
        enabled: selectedEvent?.t === "visual",
    });
    const { data: textMeta } = useQuery({
        ...textEventMetadataQuery((selectedEvent?.id as string) ?? ""),
        enabled: selectedEvent?.t === "text",
    });

    if (!events) {
        return (
            <div className="flex h-full animate-spin items-center">
                <LoaderIcon />
            </div>
        );
    }

    return (
        <>
        <MovieTimeline
            timelineRef={timelineRef}
            items={items as unknown as DataSet<TimelineItem>}
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
            onSelect={(itemIds) => {
                const selected = (items.get(itemIds as unknown as string[]) as EntityEvent[]) || [];
                setSelectedEvent(selected[0] ?? null);
            }}
            onSelectAt={({ itemIds, pageX, pageY }) => {
                const selected = (items.get(itemIds as unknown as string[]) as EntityEvent[]) || [];
                setSelectedEvent(selected[0] ?? null);
                setPopupPos({ x: pageX, y: pageY });
            }}
        />

        {/* lightweight floating card instead of full-screen dialog */}

        {selectedEvent && popupPos && (
            <div
                ref={popupRef}
                style={{
                    position: "fixed",
                    left: (computedPos?.left ?? popupPos.x + 8),
                    top: (computedPos?.top ?? popupPos.y + 8),
                    zIndex: 60,
                    maxWidth: "90vw",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <Card className="w-[320px] shadow-lg">
                    <CardHeader className="py-3">
                        <CardTitle className="text-base">Event details</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4 max-h-[50vh] overflow-auto">
                        <div className="space-y-2 text-sm">
                            <div className="grid grid-cols-2 gap-x-4">
                                <span className="text-muted-foreground">ID</span>
                                <span>{selectedEvent.id}</span>
                                <span className="text-muted-foreground">Type</span>
                                <span>{selectedEvent.t ?? "unknown"}</span>
                                <span className="text-muted-foreground">Group</span>
                                <span>{selectedEvent.group}</span>
                                <span className="text-muted-foreground">Start</span>
                                <span>{selectedEvent.start}</span>
                                {selectedEvent.end && (
                                    <>
                                        <span className="text-muted-foreground">End</span>
                                        <span>{selectedEvent.end}</span>
                                    </>
                                )}
                            </div>

                            {selectedEvent.t === "audio" && (
                                <div className="mt-2 space-y-2">
                                    {audioMeta ? (
                                        <div className="grid grid-cols-2 gap-x-4 text-sm">
                                            <span className="text-muted-foreground">Duration</span>
                                            <span>{audioMeta.duration}s</span>
                                            <span className="text-muted-foreground">Side A</span>
                                            <span>{audioMeta.side_a} ({audioMeta.name_a})</span>
                                            <span className="text-muted-foreground">Side B</span>
                                            <span>{audioMeta.side_b} ({audioMeta.name_b})</span>
                                            <span className="text-muted-foreground">Direction</span>
                                            <span>{audioMeta.call_direction}</span>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground">Loading...</span>
                                    )}
                                    {audioMeta?.href && (
                                        <div>
                                            <a className="text-blue-600 underline" href={audioMeta.href} target="_blank" rel="noreferrer">Open audio</a>
                                        </div>
                                    )}
                                </div>
                            )}

                            {selectedEvent.t === "event" && (
                                <div className="mt-2 space-y-2">
                                    {genericEventMeta ? (
                                        <div className="grid grid-cols-2 gap-x-4 text-sm">
                                            <span className="text-muted-foreground">Entity</span>
                                            <span>{genericEventMeta.entity_id}</span>
                                            <span className="text-muted-foreground">Time</span>
                                            <span>{genericEventMeta.time}</span>
                                            <span className="text-muted-foreground">Type</span>
                                            <span>{genericEventMeta.event_type}</span>
                                            <span className="text-muted-foreground">Link</span>
                                            <a className="text-blue-600 underline" href={genericEventMeta.href} target="_blank" rel="noreferrer">Open</a>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground">Loading...</span>
                                    )}
                                </div>
                            )}

                            {selectedEvent.t === "visual" && (
                                <div className="mt-2 space-y-2">
                                    {visualMeta ? (
                                        <div className="grid grid-cols-2 gap-x-4 text-sm">
                                            <span className="text-muted-foreground">Entity</span>
                                            <span>{visualMeta.entity_id}</span>
                                            <span className="text-muted-foreground">Time</span>
                                            <span>{visualMeta.time}</span>
                                            <span className="text-muted-foreground">Type</span>
                                            <span>{visualMeta.event_type}</span>
                                            <span className="text-muted-foreground">Preview</span>
                                            <iframe
                                                src={visualMeta.href}
                                                className="rounded border"
                                                style={{ width: "100%", height: "160px" }}
                                            />
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground">Loading...</span>
                                    )}
                                </div>
                            )}

                            {selectedEvent.t === "text" && (
                                <div className="mt-2 space-y-2">
                                    {textMeta ? (
                                        <div className="grid grid-cols-2 gap-x-4 text-sm">
                                            <span className="text-muted-foreground">Entity</span>
                                            <span>{textMeta.entity_id}</span>
                                            <span className="text-muted-foreground">Time</span>
                                            <span>{textMeta.time}</span>
                                            <span className="text-muted-foreground">Type</span>
                                            <span>{textMeta.event_type}</span>
                                            <span className="text-muted-foreground">Text</span>
                                            <span className="col-span-1 whitespace-pre-wrap">{textMeta.text}</span>
                                            <span className="text-muted-foreground">Link</span>
                                            <a className="text-blue-600 underline" href={textMeta.href} target="_blank" rel="noreferrer">Open</a>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground">Loading...</span>
                                    )}
                                </div>
                            )}

                            <div className="pt-2">
                                <button
                                    className="rounded bg-secondary px-2 py-1 text-xs"
                                    onClick={() => {
                                        setSelectedEvent(null);
                                        setPopupPos(null);
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )}
        </>
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
