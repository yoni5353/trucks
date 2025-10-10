import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PageSidebar } from "./page-sidebar";
import { Drawer } from "@/components/ui/drawer";
import { useState } from "react";
import { addEntity, initMap } from "@/lib/map";
import { OLMap } from "@/components/map/openlayers-map";

export default function Page() {
    const [{ map, entities }] = useState(initMap);

    return (
        <>
            <SidebarProvider className="flex h-screen flex-col">
                <SidebarInset>
                    <div className="flex h-full w-full flex-col">
                        {/* <Topbar /> */}
                        <button onClick={() => addEntity(entities)}>hi</button>
                        <OLMap map={map} />
                    </div>
                </SidebarInset>
                <PageSidebar onIdk={undefined} />
            </SidebarProvider>
            <Drawer open={false} />
        </>
    );
}
