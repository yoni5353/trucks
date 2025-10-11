import type { MapStore } from "@/lib/map";
import { useStore } from "zustand";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import { EntityDetails } from "./entity-details";
import { Skeleton } from "@/components/ui/skeleton";

export function PageDrawer({ store }: { store: MapStore }) {
    const selectedFeatures = useStore(store, (s) => s.selectedEntities);

    return (
        <Tabs
            className="mx-auto flex h-full max-w-4xl flex-col items-center justify-start p-4"
            defaultValue="details"
            dir="rtl"
        >
            <TabsList className="h-min w-min">
                <TabsTrigger value="details">פרטים</TabsTrigger>
                <TabsTrigger value="other-details">פירוט</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="p-2">
                <EntityDetails selectedFeatures={selectedFeatures} />
            </TabsContent>
            <TabsContent value="other-details" className="p-2">
                <div className="flex gap-4">
                    <Skeleton className="mt-4 h-12 w-28" />
                    <Skeleton className="mt-4 h-12 w-64" />
                </div>
                <Skeleton className="mt-4 h-12 w-96" />
            </TabsContent>
        </Tabs>
    );
}
