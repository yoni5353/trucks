import type Map from "ol/Map";
import { flyToEntity, type MapStore } from "@/lib/map";
import { useStore } from "zustand";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import { EntityDetails } from "./entity-details";
import { Skeleton } from "@/components/ui/skeleton";
import { MasterTimeline } from "@/pages/main/drawer/master-timeline";
import type { Select } from "ol/interaction";
import type VectorSource from "ol/source/Vector";
import { Activity } from "react";

export function PageDrawer({
    map,
    store,
    entities,
    select,
    viewedEntityId,
}: {
    map: Map;
    store: MapStore;
    entities: VectorSource;
    select: Select;
    viewedEntityId: string | undefined;
}) {
    const selectedFeatures = useStore(store, (s) => s.selectedEntities);

    const focusEntity = () => {
        if (viewedEntityId) {
            flyToEntity(map, entities, viewedEntityId);
        }
    };

    return (
        <>
            <Activity mode={viewedEntityId ? "hidden" : "visible"}>
                <div className="mr-24 flex h-full items-center justify-center p-4 py-6">
                    <MasterTimeline mapStore={store} entities={entities} select={select} />
                </div>
            </Activity>
            <Activity mode={viewedEntityId ? "visible" : "hidden"}>
                <Tabs
                    className="mx-auto flex h-full max-w-4xl flex-col items-center justify-start p-4"
                    defaultValue="details"
                    dir="rtl"
                >
                    <TabsList className="h-min w-min bg-secondary/50">
                        <TabsTrigger value="details">פרטים</TabsTrigger>
                        <TabsTrigger value="other-details">פירוט</TabsTrigger>
                    </TabsList>
                    <TabsContent value="details" className="p-2">
                        <EntityDetails selectedFeatures={selectedFeatures} onFocus={focusEntity} />
                    </TabsContent>
                    <TabsContent value="other-details" className="p-2">
                        <div className="flex gap-4">
                            <Skeleton className="mt-4 h-12 w-28" />
                            <Skeleton className="mt-4 h-12 w-64" />
                        </div>
                        <Skeleton className="mt-4 h-12 w-96" />
                    </TabsContent>
                </Tabs>
            </Activity>
        </>
    );
}
