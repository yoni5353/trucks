import { entitiesQuery, getHighlightsQuery } from "@/lib/requests";
import { useQuery } from "@tanstack/react-query";
import { DataSet } from "vis-data";
import "vis-timeline/styles/vis-timeline-graph2d.min.css";
import { TimelineComponent, TimelineCore } from "../../../components/timeline";
import type { Select } from "ol/interaction";
import type VectorSource from "ol/source/Vector";
import { selectEntities, type MapStore } from "@/lib/map";
import { useEffect, useMemo, useState } from "react";
import type { TimelineGroup, TimelineItem } from "vis-timeline";
import { ShieldX, SquareKanban } from "lucide-static";
import { getFeatureId, sameValues } from "@/lib/utils";
import { useStore } from "zustand";
import { parametersStore } from "../parameters";

type TimelineGroupWithFeatureId = TimelineGroup & { featureId: string };

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
    const parameters = useStore(parametersStore);

    const { data: events } = useQuery(getHighlightsQuery(parameters.timeRange));
    const { data: entitiesData } = useQuery(entitiesQuery(parameters));
    const [timeline, setTimeline] = useState<TimelineCore | null>(null);

    const items = useMemo(() => new DataSet<TimelineItem>(), []);
    const groups = useMemo(() => {
        return new DataSet<TimelineGroupWithFeatureId>(entitiesData?.map((entity) => ({
            id: entity.id,
            featureId: getFeatureId(entity),
            order: parseInt(entity.id),
            content: createGroupContent(entity.id),
        })) || []);
    }, [entitiesData]);

    useEffect(() => {
        if (events) {
            items.clear();
            const newItems = events.map((event) => ({
                id: event.id,
                content: `${ShieldX}`,
                start: event.timestamp,
                end: event.timestampEnd,
                group: event.entityIds[0],
            }));
            items.add(newItems);
        }
    }, [events, items]);

    useEffect(() => {
        if (!timeline) return;

        const selectSub = timeline.events.on('select')
            .subscribe((payload) => {
                const selected = items.get(payload.itemIds);
                const groupIds = new Set(
                    selected.map((item) => item.group).filter((g): g is string => !!g),
                );
                selectEntities(select, entities, Array.from(groupIds));
            });

        const clickSub = timeline.events.on('click')
            .subscribe((payload) => {
                if (onFocusEntity && payload.eventProperties.what === "group-label" && payload.eventProperties.group) {
                    const group = groups.get(payload.eventProperties.group.toString());
                    if (!group) {
                        return;
                    }

                    onFocusEntity(group.featureId);
                }
            });

        return () => {
            selectSub.unsubscribe();
            clickSub.unsubscribe();
        };
    }, [timeline, items, select, entities, onFocusEntity]);

    useEffect(() => {
        const unsubscribe = mapStore.subscribe((state, prev) => {
            if (state.selectedEntities !== prev.selectedEntities) {
                if (state.selectedEntities.length === 0) {
                    timeline?.setSelection([]);
                    return;
                }
                const relatedEventsIds = events
                    ?.filter((event) =>
                        event.entityIds.find((entityId) =>
                            state.selectedEntities.includes(entityId),
                        ),
                    )
                    .map((e) => e.id);
                const currentSelection = timeline?.getSelection() || [];
                if (relatedEventsIds && !sameValues(relatedEventsIds, currentSelection)) {
                    timeline?.setSelection(relatedEventsIds);
                }
            }
        });

        return () => {
            unsubscribe();
        };
    }, [mapStore, events, timeline]);

    if (!events) {
        return <div>Loading...</div>;
    }

    return (
        <TimelineComponent
            onReady={setTimeline}
            items={items}
            groups={groups}
            options={{ verticalScroll: true }}
        />
    );
}
