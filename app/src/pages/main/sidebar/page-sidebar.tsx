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
import { BotIcon, SearchIcon, TruckElectricIcon, Moon, Sun } from "lucide-react";
import { GroupSearch } from "./group-search";
import { DateRangePicker } from "./date-range-picker";
import { PanelRight } from "lucide-static";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import type { Draw } from "ol/interaction";
import { GeometrySelection } from "./geometry-selection";
import type { Map } from "ol";

export function PageSidebar({
    map,
    entities,
    entitiesCluster,
    draw,
}: {
    map: Map;
    entities: VectorSource;
    entitiesCluster: Cluster;
    draw: Draw;
}) {
    const [, _setCounter] = useState(0);
    const rerender = () => _setCounter((c) => c + 1);

    const { theme, setTheme } = useTheme();

    return (
        <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground p-2">
            <div className="flex items-center justify-between gap-1 p-2">
                <div className="flex items-center gap-2">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <TruckElectricIcon className="size-4" />
                    </div>
                    <div className="grid flex-1 text-right text-sm leading-tight">
                        <span className="truncate font-medium">
                            {import.meta.env.VITE_APP_NAME}
                        </span>
                    </div>
                </div>
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
            </div>
            <div className="flex flex-col gap-4 mt-4">
                <div className="px-2">
                    <GroupSearch inputClassName="group-search-input" />
                </div>
                <div className="px-2">
                    <GeometrySelection map={map} draw={draw} />
                </div>
                <div className="px-2">
                    <DateRangePicker />
                </div>
            </div>

            {import.meta.env.DEV && (
                <div className="mt-auto flex flex-col gap-2 p-2">
                    <Button
                        variant="outline"
                        onClick={() => addRandomEntity(entities)}
                    >
                        <BotIcon className="mr-2 size-4" />
                        Add Entity
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            entitiesCluster.setDistance(
                                entitiesCluster.getDistance() === 50 ? 10 : 50,
                            );
                            rerender();
                        }}
                    >
                        <BotIcon className="mr-2 size-4" />
                        Cluster: {entitiesCluster.getDistance()}
                    </Button>
                </div>
            )}
        </div>
    );
}
