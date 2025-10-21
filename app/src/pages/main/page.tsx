import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PageSidebar } from "./sidebar/page-sidebar";
import { useEffect, useRef, useState, type ComponentRef } from "react";
import { addEntities, clearAllHistory, initMap, registerHistoryOfEntities } from "@/lib/map";
import { OLMap } from "@/components/map/openlayers-map";
import { PageDrawer } from "./drawer/page-drawer";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { entitiesQuery, getHistoryOfEntity } from "@/lib/requests";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { Pane } from "./pane/pane";

export default function Page() {
    const queryClient = useQueryClient();
    const drawerRef = useRef<ComponentRef<typeof ResizablePanel>>(null);
    const paneRef = useRef<ComponentRef<typeof ResizablePanel>>(null);
    const [isDrawerTranstioning, setIsDrawerTransitioning] = useState(false);

    const [{ map, select, entities, histories, entitiesCluster, store }] = useState(initMap);
    const { data: entitiesData } = useQuery(entitiesQuery);
    useEffect(
        function loadEntities() {
            if (entitiesData) {
                entities.clear();
                addEntities(entities, entitiesData);
            }
        },
        [entitiesData, entities],
    );

    const [focusedFeatureId, _setFoucsedFeatureId] = useState<string>();
    const setFocusedFeatureId = async (id: string | undefined) => {
        _setFoucsedFeatureId(id);

        if (id) {
            const [type, entityId] = id?.split("-", 2) as [string, string];
            const focusedFeatureHistory = await getHistoryOfEntity(queryClient, type, entityId);
            if (focusedFeatureHistory) {
                registerHistoryOfEntities(histories, { [id]: focusedFeatureHistory });
            }
        } else {
            clearAllHistory(histories);
        }
    };

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
                                                if (entityId) drawerRef?.current?.expand();
                                                if (entityId) paneRef?.current?.expand(50);
                                            }}
                                            onClickSingleEntity={(entityId: string) => {
                                                if (paneRef.current?.isExpanded()) {
                                                    setFocusedFeatureId(entityId);
                                                    if (entityId) drawerRef?.current?.expand();
                                                    if (entityId) paneRef?.current?.expand(50);
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
                                    ? drawerRef.current?.expand()
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
                            defaultSize={40}
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
                <PageSidebar entities={entities} entitiesCluster={entitiesCluster} />
            </SidebarProvider>
        </>
    );
}
