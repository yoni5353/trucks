import { Map } from "ol";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { addFeature } from "@/lib/map";
import type VectorSource from "ol/source/Vector";
import type { Cluster } from "ol/source";
import { useState } from "react";

export function PageSidebar({
    map,
    entities,
    entitiesCluster,
}: {
    map: Map;
    entities: VectorSource;
    entitiesCluster: Cluster;
}) {
    const [, _setCounter] = useState(0);
    const rerender = () => _setCounter((c) => c + 1);

    return (
        <Sidebar side="right">
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>דיבוג</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild onClick={() => addFeature(entities)}>
                                    <div>addFeature</div>
                                </SidebarMenuButton>
                                <SidebarMenuButton
                                    asChild
                                    onClick={() => {
                                        entitiesCluster.setDistance(50);
                                        rerender();
                                    }}
                                >
                                    <div>
                                        change cluster distance - {entitiesCluster.getDistance()}
                                    </div>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
