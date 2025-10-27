import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PageSidebar } from "./sidebar/page-sidebar";
import { useEffect, useRef, useState, type ComponentRef } from "react";
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
    const paneRef = useRef<ComponentRef<typeof ResizablePanel>>(null);
    const [isDrawerTranstioning, setIsDrawerTransitioning] = useState(false);

    const [{ map, select, entities, histories, entitiesCluster, store, draw }] = useState(initMap);

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
                const [type, entityId] = focusedFeatureId?.split("-", 2) as [string, string];
                const updateHistory = throttle(async (time: Date) => {
                    history ??= await getHistoryOfEntity(queryClient, type, entityId);
                    if (history) {
                        registerHistoryOfEntities(histories, { [focusedFeatureId]: history }, time);
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
        [focusedFeatureId, histories, queryClient],
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
        <>
            <SidebarProvider className="flex h-screen w-screen flex-col">
                <SidebarInset>
                    <ResizablePanelGroup direction="vertical">
                        <ResizablePanel className="relative" order={1}>
                            <ResizablePanelGroup direction="horizontal">
                                <ResizablePanel>
                                    <div className="relative h-screen w-screen">
                                        <OLMap
                                            map={map}
                                            select={select}
                                            onViewEntity={(entityId: string | undefined) => {
                                                setFocusedFeatureId(entityId);
                                                if (entityId)
                                                    drawerRef?.current?.expand(
                                                        DRAWER_DEFAULT_HEIGHT,
                                                    );
                                                if (entityId) paneRef?.current?.expand(50);
                                            }}
                                            onClickSingleEntity={(entityId: string) => {
                                                // if (paneRef.current?.isExpanded()) {
                                                if (true) {
                                                    setFocusedFeatureId(entityId);
                                                    if (entityId)
                                                        drawerRef?.current?.expand(
                                                            DRAWER_DEFAULT_HEIGHT,
                                                        );
                                                    // if (entityId) paneRef?.current?.expand(50);
                                                }
                                            }}
                                        />
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle
                                    className="hover:after:bg-sidebar-border"
                                    onClick={() => {
                                        return paneRef.current?.isCollapsed()
                                            ? paneRef.current?.expand()
                                            : paneRef.current?.collapse();
                                    }}
                                />
                                <ResizablePanel
                                    className={cn(
                                        isDrawerTranstioning && "transition-all duration-100",
                                    )}
                                    onTransitionEnd={() => setIsDrawerTransitioning(false)}
                                    collapsible
                                    minSize={1}
                                    defaultSize={1}
                                    maxSize={70}
                                    collapsedSize={1}
                                    ref={paneRef}
                                >
                                    <Pane
                                        focusedFeatureId={focusedFeatureId}
                                        map={map}
                                        entities={entities}
                                        onDismiss={() => paneRef.current?.collapse()}
                                    />
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </ResizablePanel>
                        <ResizableHandle
                            className="hover:after:bg-sidebar-border"
                            onClick={() => {
                                setIsDrawerTransitioning(true);
                                return drawerRef.current?.isCollapsed()
                                    ? drawerRef.current?.expand(DRAWER_DEFAULT_HEIGHT)
                                    : drawerRef.current?.collapse();
                            }}
                        />
                        <ResizablePanel
                            className={cn(isDrawerTranstioning && "transition-all duration-100")}
                            onTransitionEnd={() => setIsDrawerTransitioning(false)}
                            ref={drawerRef}
                            order={2}
                            collapsible
                            minSize={1}
                            collapsedSize={1}
                            defaultSize={1} // defaultSize={40} when MasterTimeline is functional
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
                </SidebarInset>
                <PageSidebar
                    map={map}
                    draw={draw}
                    entities={entities}
                    entitiesCluster={entitiesCluster}
                />
            </SidebarProvider>
        </>
    );
}
