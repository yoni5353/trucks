import { useEffect, useRef, useState, type ComponentRef } from "react";
import { PageSidebar } from "./sidebar/page-sidebar";
import {
    addEntities,
    clearAllHistory,
    initMap,
    registerHistoryOfEntities,
    dimUnselectedEntities,
} from "@/lib/map";
import { OLMap } from "@/components/map/openlayers-map";
import { PageDrawer } from "./drawer/page-drawer";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { entitiesQuery, getHistoryOfEntity } from "@/lib/requests";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { Pane } from "./pane/pane";
import { focusedTimeStore } from "./focus";
import type { GeographicEvent } from "@/lib/types";
import { throttle } from "lodash-es";
import { parametersStore } from "./parameters";
import { WKT } from "ol/format";
import { useStore } from "zustand";

const DRAWER_DEFAULT_HEIGHT = 40;

export default function Page() {
    const queryClient = useQueryClient();
    const drawerRef = useRef<ComponentRef<typeof ResizablePanel>>(null);
    const rightPaneRef = useRef<ComponentRef<typeof ResizablePanel>>(null);
    const [isDrawerTranstioning, setIsDrawerTransitioning] = useState(false);

    const [{ map, select, entities, histories, entitiesCluster, store, draw }] =
        useState(initMap);

    const parameters = useStore(parametersStore);
    const { data: entitiesData } = useQuery(entitiesQuery(parameters));
    useEffect(
        function loadEntities() {
            if (entitiesData) {
                entities.clear();
                addEntities(entities, entitiesData);
            }
        },
        [entitiesData, entities],
    );

    // Handle feature focus
    const [focusedFeatureId, _setFoucsedFeatureId] = useState<string>();
    const setFocusedFeatureId = async (id: string | undefined) => {
        _setFoucsedFeatureId(id);
        dimUnselectedEntities(entities, id);

        if (id) {
            setIsDrawerTransitioning(true);
            drawerRef.current?.collapse();
        }
    };

    useEffect(
        function trackHistoryOfFocusedFeature() {
            if (!focusedFeatureId) {
                clearAllHistory(histories);
                return;
            } else {
                let history: GeographicEvent[] | undefined = undefined;
                const [type, entityId] = focusedFeatureId?.split("-", 2) as [
                    string,
                    string,
                ];
                const updateHistory = throttle(async (time: Date) => {
                    history ??= await getHistoryOfEntity(
                        queryClient,
                        type,
                        entityId,
                        parameters.timeRange,
                    );
                    if (history) {
                        registerHistoryOfEntities(
                            histories,
                            { [focusedFeatureId]: history },
                            time,
                        );
                    } else {
                        clearAllHistory(histories);
                    }
                }, 100);

                updateHistory(new Date());
                return focusedTimeStore.subscribe((state, prev) => {
                    if (state.start && state.start !== prev.start) {
                        updateHistory(state.start);
                    }
                });
            }
        },
        [focusedFeatureId, histories, queryClient, parameters.timeRange],
    );

    useEffect(
        function syncDrawPolygonWithParameterWkt() {
            const wkt = new WKT();
            return store.subscribe((state, prev) => {
                if (state.drawnPolygon !== prev.drawnPolygon) {
                    const geometry = state.drawnPolygon?.getGeometry();
                    if (geometry) {
                        const wktString = wkt.writeGeometry(geometry);
                        parametersStore.getState().setSelectedWkt(wktString);
                    } else {
                        parametersStore.getState().setSelectedWkt();
                    }
                }
            });
        },
        [store],
    );

    return (
        <div className="flex h-screen w-screen flex-col bg-background">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel
                    collapsible
                    defaultSize={20}
                    minSize={15}
                    maxSize={30}
                >
                    <PageSidebar
                        map={map}
                        draw={draw}
                        entities={entities}
                        entitiesCluster={entitiesCluster}
                    />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel>
                    <ResizablePanelGroup direction="vertical">
                        <ResizablePanel className="relative" order={1}>
                            <div className="relative h-full w-full">
                                <OLMap
                                    map={map}
                                    select={select}
                                    onViewEntity={(
                                        entityId: string | undefined,
                                    ) => {
                                        setFocusedFeatureId(entityId);
                                        if (entityId)
                                            drawerRef?.current?.expand(
                                                DRAWER_DEFAULT_HEIGHT,
                                            );
                                        if (entityId)
                                            rightPaneRef?.current?.expand(50);
                                    }}
                                    onClickSingleEntity={(entityId: string) => {
                                        if (rightPaneRef.current?.isExpanded()) {
                                            setFocusedFeatureId(entityId);
                                            if (entityId)
                                                drawerRef?.current?.expand(
                                                    DRAWER_DEFAULT_HEIGHT,
                                                );
                                        }
                                    }}
                                />
                            </div>
                        </ResizablePanel>
                        <ResizableHandle
                            withHandle
                            onClick={() => {
                                setIsDrawerTransitioning(true);
                                return drawerRef.current?.isCollapsed()
                                    ? drawerRef.current?.expand(
                                          DRAWER_DEFAULT_HEIGHT,
                                      )
                                    : drawerRef.current?.collapse();
                            }}
                        />
                        <ResizablePanel
                            className={cn(
                                isDrawerTranstioning &&
                                    "transition-all duration-100",
                            )}
                            onTransitionEnd={() =>
                                setIsDrawerTransitioning(false)
                            }
                            ref={drawerRef}
                            order={2}
                            collapsible
                            minSize={5}
                            collapsedSize={5}
                            defaultSize={5}
                            maxSize={60}
                        >
                            <PageDrawer
                                map={map}
                                store={store}
                                entities={entities}
                                select={select}
                                focusedEntityId={focusedFeatureId}
                                onFocusEntity={setFocusedFeatureId}
                            />
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel
                    className={cn(
                        isDrawerTranstioning && "transition-all duration-100",
                    )}
                    onTransitionEnd={() => setIsDrawerTransitioning(false)}
                    collapsible
                    defaultSize={20}
                    minSize={15}
                    maxSize={40}
                    ref={rightPaneRef}
                >
                    <Pane
                        focusedFeatureId={focusedFeatureId}
                        map={map}
                        entities={entities}
                        onDismiss={() => rightPaneRef.current?.collapse()}
                    />
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
