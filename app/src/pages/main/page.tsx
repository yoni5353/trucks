import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PageSidebar } from "./page-sidebar";
import { useEffect, useState } from "react";
import { addEntities, addFeature, initMap } from "@/lib/map";
import { OLMap } from "@/components/map/openlayers-map";
import { PageDrawer } from "./drawer";
import { useQuery } from "@tanstack/react-query";
import { entitiesQuery } from "@/lib/requests";
import { useStore } from "zustand";

export default function Page() {
    const [drawerOpen, setDrawerOpen] = useState(false);

    const [{ map, select, entities, store }] = useState(initMap);

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
                    <div className="flex h-full w-full flex-col">
                        <button onClick={() => addFeature(entities)}>hi</button>
                        <PageDrawer
                            store={store}
                            open={drawerOpen}
                            onOpenChange={setDrawerOpen}
                            onClose={() => setDrawerOpen(false)}
                        />
                        {/* {selectedEntities} */}
                        <OLMap map={map} select={select} onOpenDrawer={() => setDrawerOpen(true)} />
                    </div>
                </SidebarInset>
                <PageSidebar onIdk={undefined} />
            </SidebarProvider>
        </>
    );
}
