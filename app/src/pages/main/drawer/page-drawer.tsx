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
        <div className="h-full bg-card text-card-foreground">
            {focusedEntityId ? (
                <Tabs
                    className="mx-auto flex h-full max-w-4xl flex-col items-center justify-start p-4"
                    defaultValue="timeline"
                    dir="rtl"
                >
                    <TabsList className="h-min w-min bg-secondary/50">
                        <TabsTrigger value="timeline">ציר זמן</TabsTrigger>
                        <TabsTrigger value="other-details">פירוט</TabsTrigger>
                    </TabsList>
                    <TabsContent value="timeline" className="h-[296px] p-2">
                        <EntityTimeline
                            enityId={entityId}
                            entityType={entityType}
                        />
                    </TabsContent>
                    <TabsContent value="other-details" className="p-2">
                        <EntityDetails
                            focusedEntityId={focusedEntityId}
                            onFocus={focusCurrentEntity}
                        />
                        <div className="flex gap-4">
                            <Skeleton className="mt-4 h-12 w-28" />
                            <Skeleton className="mt-4 h-12 w-64" />
                        </div>
                        <Skeleton className="mt-4 h-12 w-96" />
                    </TabsContent>
                </Tabs>
            ) : (
                <div className="mr-24 flex h-full items-center justify-center p-4 py-6">
                    <MasterTimeline
                        mapStore={store}
                        entities={entities}
                        select={select}
                        onFocusEntity={onFocusEntity}
                    />
                </div>
            )}
        </div>
    );
}
