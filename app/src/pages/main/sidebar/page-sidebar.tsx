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
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar";
import { addRandomEntity } from "@/lib/map";
import type VectorSource from "ol/source/Vector";
import type { Cluster } from "ol/source";
import { useState } from "react";
import { BotIcon, MapPinned, SearchIcon, TruckElectricIcon, Moon, Sun } from "lucide-react";
import { GroupSearch } from "./group-search";
import { DateRangePicker } from "./date-range-picker";
import { PanelRight } from "lucide-static";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

export function PageSidebar({
    entities,
    entitiesCluster,
}: {
    entities: VectorSource;
    entitiesCluster: Cluster;
}) {
    const [, _setCounter] = useState(0);
    const rerender = () => _setCounter((c) => c + 1);

    const { toggleSidebar } = useSidebar();
    const { theme, setTheme } = useTheme();

    return (
        <Sidebar side="right" collapsible="icon" dir="rtl">
            <SidebarContent>
                <SidebarHeader>
                    <div className="flex items-center justify-between gap-1">
                        <SidebarMenuItem className="w-full">
                            <SidebarMenuButton
                                size="lg"
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <TruckElectricIcon className="size-4" />
                                </div>
                                <div className="grid flex-1 text-right text-sm leading-tight">
                                    <span className="truncate font-medium">
                                        {import.meta.env.VITE_APP_NAME}
                                    </span>
                                    <span className="truncate text-xs">
                                        {import.meta.env.VITE_APP_DESCRIPTION}
                                    </span>
                                </div>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <Button
                            className="h-8 w-8"
                            variant="ghost"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        >
                            {theme === "dark" ? (
                                <Sun className="size-4" />
                            ) : (
                                <Moon className="size-4" />
                            )}
                        </Button>
                        <SidebarTrigger className="group-data-[collapsible=icon]:visbile h-8 w-10 transition-transform group-data-[collapsible=icon]:absolute group-data-[collapsible=icon]:right-14">
                            <PanelRight />
                        </SidebarTrigger>
                    </div>
                </SidebarHeader>
                <SidebarGroup>
                    <SidebarGroupLabel>ישויות</SidebarGroupLabel>
                    <SidebarGroupContent className="relative flex flex-col gap-2">
                        <SidebarMenuItem className="group-data-[collapsible=icon]:hidden">
                            <GroupSearch inputClassName="group-search-input" />
                        </SidebarMenuItem>
                        <SidebarMenuItem className="hidden group-data-[collapsible=icon]:block">
                            <SidebarMenuButton
                                variant="outline"
                                onClick={() => {
                                    toggleSidebar();
                                    setTimeout(() => {
                                        document
                                            ?.getElementsByClassName("group-search-input")
                                            .item(0)
                                            ?.focus();
                                    }, 100);
                                }}
                            >
                                <SearchIcon />
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton className="mx-auto" variant="outline">
                                <MapPinned />
                                <span>בחר אזור</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>מיקוד</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <DateRangePicker />
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>דיבוג</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton onClick={() => addRandomEntity(entities)}>
                                    <BotIcon />
                                    <div>add entity</div>
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
