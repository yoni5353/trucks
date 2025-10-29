import type Map from "ol/Map";
import { flyToEntity, type MapStore } from "@/lib/map";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import { EntityDetails } from "./entity-details";
import { Skeleton } from "@/components/ui/skeleton";
import { MasterTimeline } from "@/pages/main/drawer/master-timeline";
import type { Select } from "ol/interaction";
import type VectorSource from "ol/source/Vector";
import { Activity } from "react";
import { EntityTimeline } from "./entity-timeline";

export function PageDrawer({
    map,
    store,
    entities,
    select,
    focusedEntityId,
    onFocusEntity,
}: {
    map: Map;
    store: MapStore;
    entities: VectorSource;
    select: Select;
    focusedEntityId: string | undefined;
    onFocusEntity: (entityId: string) => void;
}) {
    const focusCurrentEntity = () => {
        if (focusedEntityId) {
            flyToEntity(map, entities, focusedEntityId);
        }
    };

    const [entityType, entityId] = focusedEntityId?.split("-", 2) ?? [];

    return (
        <>
            <Activity mode={focusedEntityId ? "hidden" : "visible"}>
                <div className="flex justify-center items-center p-4 py-6 mr-24 h-full">
                    <MasterTimeline
                        mapStore={store}
                        entities={entities}
                        select={select}
                        onFocusEntity={onFocusEntity}
                    />
                </div>
            </Activity>
            <Activity mode={focusedEntityId ? "visible" : "hidden"}>
                <Tabs
                    className="flex flex-col justify-start items-center p-4 mx-auto max-w-4xl h-full"
                    defaultValue="timeline"
                    dir="rtl"
                >
                    <TabsList className="w-min h-min bg-secondary/50">
                        <TabsTrigger value="timeline">ציר זמן</TabsTrigger>
                        <TabsTrigger value="other-details">פירוט</TabsTrigger>
                    </TabsList>
                    <TabsContent value="timeline" className="h-[296px] p-2">
                        <EntityTimeline enityId={entityId} entityType={entityType} />
                    </TabsContent>
                    <TabsContent value="other-details" className="p-2">
                        <EntityDetails
                            focusedEntityId={focusedEntityId}
                            onFocus={focusCurrentEntity}
                        />
                        <div className="flex gap-4">
                            <Skeleton className="mt-4 w-28 h-12" />
                            <Skeleton className="mt-4 w-64 h-12" />
                        </div>
                        <Skeleton className="mt-4 w-96 h-12" />
                    </TabsContent>
                </Tabs>
            </Activity>
        </>
    );
}
