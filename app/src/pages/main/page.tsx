import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PageSidebar } from "./page-sidebar";
import { useEffect, useState } from "react";
import { addEntities, addFeature, initMap } from "@/lib/map";
import { OLMap } from "@/components/map/openlayers-map";
import { PageDrawer } from "./drawer";
import { useQuery } from "@tanstack/react-query";
import { entitiesQuery } from "@/lib/requests";

export default function Page() {
    const [drawerOpen, setDrawerOpen] = useState(false);

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
            <SidebarProvider className="flex h-screen flex-col" dir="rtl">
                <SidebarInset>
                    <div className="flex h-full w-full flex-col">
                        <OLMap map={map} select={select} onOpenDrawer={() => setDrawerOpen(true)} />
                        <PageDrawer
                            store={store}
                            open={drawerOpen}
                            onOpenChange={setDrawerOpen}
                            onClose={() => setDrawerOpen(false)}
                        />
                    </div>
                </SidebarInset>
                <PageSidebar map={map} entities={entities} entitiesCluster={entitiesCluster} />
            </SidebarProvider>
        </>
    );
}
