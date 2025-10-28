import { eventsQuery } from "@/lib/requests";
import { useQuery } from "@tanstack/react-query";
import { DataSet } from "vis-data";
import "vis-timeline/styles/vis-timeline-graph2d.min.css";
import { MovieTimeline } from "../../../components/timeline/movie-timeline";
import type { Select } from "ol/interaction";
import type VectorSource from "ol/source/Vector";
import { selectEntities, type MapStore } from "@/lib/map";
import { useEffect, useMemo, useRef } from "react";
import type { Timeline } from "vis-timeline";
import { ShieldX, SquareKanban } from "lucide-static";
import { sameValues } from "@/lib/utils";

export function MasterTimeline({
    mapStore,
    entities,
    select,
    onFocusEntity,
}: {
    mapStore: MapStore;
    entities: VectorSource;
    select: Select;
    onFocusEntity?: (entityId: string) => void;
}) {
    const { data: events } = useQuery(eventsQuery);

    const timelineRef = useRef<Timeline | null>(null);

    useEffect(
        function focusEntitiesOnMapEntitySelection() {
            return mapStore.subscribe((state, prev) => {
                if (state.selectedEntities !== prev.selectedEntities) {
                    if (state.selectedEntities.length === 0) {
                        timelineRef.current?.setSelection([]);
                        return;
                    }
                    const relatedEventsIds = events
                        ?.filter((event) =>
                            event.entityIds.find((entityId) =>
                                state.selectedEntities.includes(entityId),
                            ),
                        )
                        .map((e) => e.id);
                    const currentSelection = timelineRef.current?.getSelection() as string[];
                    if (relatedEventsIds && !sameValues(relatedEventsIds, currentSelection)) {
                        timelineRef.current?.setSelection(relatedEventsIds);
                    }
                }
            });
        },
        [events, mapStore],
    );

    useEffect(
        function focusEntityOnClick() {
            if (timelineRef.current && onFocusEntity) {
                timelineRef.current.on("click", (properties) => {
                    const event = timelineRef.current?.getEventProperties(properties.event);
                    if (!event) return;
                    // If any click yields a group id (label, item, row), focus that entity
                    const groupId = event.group;
                    if (groupId) {
                        onFocusEntity(groupId.toString());
                    }
                });
            }
        },
        [timelineRef, events, onFocusEntity],
    );

    const items = useMemo(() => new DataSet<any>(), []);
    if (events && items.getIds().length === 0) {
        const d = events?.map((event) => ({
            id: event.id,
            className: "w-9 h-9",
            content: `${ShieldX}`, //${event.type}`,
            start: event.timestamp,
            end: event.timestampEnd,
            group: event.entityIds[0],
        }));
        items.add(d);
    }

    const groups = useMemo(() => new DataSet<any>(), []);
    if (events && groups.getIds().length === 0) {
        for (const event of events) {
            const entitiesIds = event.entityIds;
            for (const entityId of entitiesIds) {
                const id = entityId;
                if (groups.get(id)) continue;
                groups.add({
                    id: entityId,
                    order: parseInt(entityId.split("-")[1]),
                    content: `<div class="flex items-center gap-3 justify-center px-4"><div class="w-2 scale-50"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none" class="tabler-icon tabler-icon-circle-check-filled fill-green-500 dark:fill-green-400"><path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.293 5.953a1 1 0 0 0 -1.32 -.083l-.094 .083l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.403 1.403l.083 .094l2 2l.094 .083a1 1 0 0 0 1.226 0l.094 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z"></path></svg></div>${entityId}
                              <button class="hidden text-secondary hover:text-primary">${SquareKanban}</button></div>`,
                } as any);
            }
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
            onSelect={(itemIds) => {
                const selected = items.get(itemIds as any) as any[];
                const groupIds = Array.from(new Set(selected.map((item: any) => item.group)));
                selectEntities(select, entities, groupIds);
                const firstGroupId = groupIds[0];
                if (firstGroupId && onFocusEntity) onFocusEntity(firstGroupId.toString());
            }}
            timelineOptions={{ verticalScroll: true }}
        />
    );
}
