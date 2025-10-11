import { Map } from "ol";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";
import { addFeature } from "@/lib/map";
import type VectorSource from "ol/source/Vector";
import type { Cluster } from "ol/source";
import { useState } from "react";
import { BotIcon, Truck, TruckElectric, TruckElectricIcon } from "lucide-react";

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
        <Sidebar side="right" collapsible="icon" dir="rtl">
            <SidebarContent>
                <SidebarHeader>
                    <SidebarMenuButton
                        size="lg"
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                            <TruckElectricIcon className="size-4" />
                        </div>
                        <div className="grid flex-1 text-right text-sm leading-tight">
                            <span className="truncate font-medium">???</span>
                            <span className="truncate text-xs">??????</span>
                        </div>
                    </SidebarMenuButton>
                </SidebarHeader>
                <SidebarGroup>
                    <SidebarGroupLabel>דיבוג</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton onClick={() => addFeature(entities)}>
                                    <BotIcon />
                                    <div>add feature</div>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem className="group-data-[collapsible=icon]:hidden">
                                <SidebarMenuButton
                                    onClick={() => {
                                        entitiesCluster.setDistance(50);
                                        rerender();
                                    }}
                                >
                                    <BotIcon />
                                    <div>
                                        change cluster distance - {entitiesCluster.getDistance()}
                                    </div>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    );
}
