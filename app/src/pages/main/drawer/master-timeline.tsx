import { getHighlightsQuery } from "@/lib/requests";
import { useQuery } from "@tanstack/react-query";
import { DataSet } from "vis-data";
import "vis-timeline/styles/vis-timeline-graph2d.min.css";
import { MovieTimeline } from "../../../components/timeline/movie-timeline";
import type { Select } from "ol/interaction";
import type VectorSource from "ol/source/Vector";
import { selectEntities, type MapStore } from "@/lib/map";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Timeline, TimelineEventPropertiesResult, TimelineItem } from "vis-timeline";
import { ShieldX, SquareKanban } from "lucide-static";
import { sameValues } from "@/lib/utils";

const createGroupContent = (entityId: string) => {
    return `<div class="flex gap-3 justify-center items-center px-4"><div class="w-2 scale-50"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none" class="tabler-icon tabler-icon-circle-check-filled fill-green-500 dark:fill-green-400"><path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.293 5.953a1 1 0 0 0 -1.32 -.083l-.094 .083l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.403 1.403l.083 .094l2 2l.094 .083a1 1 0 0 0 1.226 0l.094 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z"></path></svg></div>${entityId}
                                    <button class="hidden text-secondary hover:text-primary">${SquareKanban}</button></div>`;
};

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
    const { data: events } = useQuery(getHighlightsQuery);
    const timelineRef = useRef<Timeline | null>(null);

    const items = useMemo(() => new DataSet<TimelineItem>(), []);
    const groups = useMemo(() => new DataSet(), []);

    useEffect(() => {
        if (events) {
            items.clear();
            const d = events.map((event) => ({
                id: event.id,
                className: "w-9 h-9",
                content: `${ShieldX}`, //${event.type}`,
                start: event.timestamp,
                end: event.timestampEnd,
                group: event.entityIds[0],
            }));
            items.add(d);
        }
    }, [events, items]);

    useEffect(() => {
        const syncGroups = () => {
            const features = entities.getFeatures();
            const featureIds = new Set(features.map((f) => f.getId()?.toString()).filter(Boolean));
            const currentGroupIds = new Set(groups.getIds().map(String));

            const groupsToAdd = features
                .filter((feature) => feature.getId() && !currentGroupIds.has(feature.getId()!.toString()))
                .map((feature) => {
                    const entityId = feature.getId()!.toString();
                    return {
                        id: entityId,
                        order: parseInt(entityId.split("-")[1] ?? "0"),
                        content: createGroupContent(entityId),
                    };
                });

            if (groupsToAdd.length > 0) {
                groups.add(groupsToAdd);
            }

            const groupsToRemove = Array.from(currentGroupIds).filter((id) => !featureIds.has(id));

            if (groupsToRemove.length > 0) {
                groups.remove(groupsToRemove);
            }
        };

        syncGroups(); // initial sync

        entities.on("addfeature", syncGroups);
        entities.on("removefeature", syncGroups);
        entities.on("clear", syncGroups);

        return () => {
            entities.un("addfeature", syncGroups);
            entities.un("removefeature", syncGroups);
            entities.un("clear", syncGroups);
        };
    }, [entities, groups]);

    useEffect(() => {
        const unsubscribe = mapStore.subscribe((state, prev) => {
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

        return () => {
            unsubscribe();
        };
    }, [mapStore, events, onFocusEntity]);

    const onGroupClick = (event: TimelineEventPropertiesResult) => {
        if (onFocusEntity && event.what === "group-label" && event.group) {
            onFocusEntity(event.group.toString());
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
                const groupIds = new Set(
                    selected.map((item) => item.group).filter((g): g is string => !!g),
                );
                selectEntities(select, entities, Array.from(groupIds));
            }}
            onClick={onGroupClick}
            timelineOptions={{ verticalScroll: true }}
        />
    );
}
