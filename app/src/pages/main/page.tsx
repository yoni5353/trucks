import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PageSidebar } from "./page-sidebar";
import { useEffect, useRef, useState, type ComponentRef } from "react";
import { addEntities, initMap } from "@/lib/map";
import { OLMap } from "@/components/map/openlayers-map";
import { PageDrawer } from "./drawer";
import { useQuery } from "@tanstack/react-query";
import { entitiesQuery } from "@/lib/requests";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

export default function Page() {
    const drawerRef = useRef<ComponentRef<typeof ResizablePanel>>(null);

    const [{ map, select, entities, entitiesCluster, store }] = useState(initMap);

    const { data: entitiesData } = useQuery(entitiesQuery);
    useEffect(() => {
        if (entitiesData) {
            entities.clear();
            addEntities(entities, entitiesData);
        }
    }, [entitiesData, entities]);

    return (
        <>
            <SidebarProvider className="flex h-screen flex-col">
                <SidebarInset>
                    <ResizablePanelGroup direction="vertical">
                        <ResizablePanel className="relative" order={1}>
                            <div className="relative h-screen w-full">
                                <OLMap
                                    map={map}
                                    select={select}
                                    onOpenDrawer={() => drawerRef?.current?.expand()}
                                />
                            </div>
                        </ResizablePanel>
                        <ResizableHandle
                            onDoubleClick={() =>
                                drawerRef.current?.isCollapsed()
                                    ? drawerRef.current?.expand()
                                    : drawerRef.current?.collapse()
                            }
                        />
                        <ResizablePanel
                            ref={drawerRef}
                            order={2}
                            collapsible
                            minSize={2}
                            collapsedSize={2}
                            defaultSize={40}
                            maxSize={60}
                        >
                            <PageDrawer store={store} />
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </SidebarInset>
                <PageSidebar map={map} entities={entities} entitiesCluster={entitiesCluster} />
            </SidebarProvider>
        </>
    );
}
