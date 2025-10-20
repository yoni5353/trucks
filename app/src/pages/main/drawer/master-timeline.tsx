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
// @ts-expect-error no type
import { ShieldX, SquareKanban } from "lucide-static";
import { sameValues } from "@/lib/utils";

export function MasterTimeline({
    mapStore,
    entities,
    select,
}: {
    mapStore: MapStore;
    entities: VectorSource;
    select: Select;
}) {
    const { data: events } = useQuery(eventsQuery);

    const timelineRef = useRef<Timeline | null>(null);

    useEffect(function focusEntitiesOnMapEntitySelection() {
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
    });

    const items = useMemo(() => new DataSet(), []);
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

    const groups = useMemo(() => new DataSet(), []);
    if (events && groups.getIds().length === 0) {
        for (const event of events) {
            const entitiesIds = event.entityIds;
            for (const entityId of entitiesIds) {
                const id = entityId;
                if (groups.get(id)) continue;
                groups.add({
                    id: entityId,
                    order: parseInt(entityId.split("-")[1]),
                    content: `<div class="flex items-center gap-2 justify-center px-4">${entityId}
                              <button class="text-secondary hover:text-primary">${SquareKanban}</button></div>`,
                });
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
                const selected = items.get(itemIds);
                const groupIds = new Set(selected.map((item) => item.group));
                selectEntities(select, entities, groupIds);
            }}
            timelineOptions={{ verticalScroll: true }}
        />
    );
}
