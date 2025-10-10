// import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Info, MapPin, TrendingUp } from "lucide-react";
import { useEffect, type ComponentProps } from "react";
import Map from "ol/Map";
import type { Select } from "ol/interaction";
import type { MapStore } from "@/lib/map";
import { useStore } from "zustand";
// import { Drawer } from "vaul";

export function PageDrawer({
    store,
    ...props
}: { store: MapStore } & ComponentProps<typeof Drawer>) {
    const location = {
        name: "Sample Location",
        description: "This is a sample description for the location.",
        value: 123456,
        coordinates: [37.7749, -122.4194], // Example coordinates (latitude, longitude)
    };

    const selectedFeatures = useStore(store, (s) => s.selectedEntities);

    // return (
    //     <Drawer.Root
    //         open={props.open}
    //         onOpenChange={props.onOpenChange}
    //         modal={false}
    //         // snapPoints={snapPoints}
    //         // activeSnapPoint={snap}
    //         // setActiveSnapPoint={setSnap}
    //     >
    //         <Drawer.Portal>
    //             <Drawer.Overlay className="fixed inset-0 bg-black/40" />
    //             <Drawer.Content className="bg-card border-border fixed bottom-0 left-0 right-0 mt-24 flex h-[400px] flex-col rounded-t-xl border-t">
    //                 <div className="bg-card flex-1 overflow-y-auto rounded-t-xl p-4">
    //                     <div className="bg-muted mx-auto mb-6 h-1.5 w-12 flex-shrink-0 rounded-full" />

    //                     <div className="mx-auto max-w-3xl">
    //                         <div className="mb-6 flex items-start gap-4">
    //                             <div className="bg-primary/20 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg">
    //                                 <MapPin className="text-primary h-6 w-6" />
    //                             </div>
    //                             <div className="flex-1">
    //                                 <Drawer.Title className="text-foreground mb-1 text-2xl font-bold">
    //                                     {location.name}
    //                                 </Drawer.Title>
    //                                 <p className="text-muted-foreground">{location.description}</p>
    //                             </div>
    //                         </div>

    //                         <div className="mb-6 grid grid-cols-2 gap-4">
    //                             <div className="bg-secondary/50 rounded-lg p-4">
    //                                 <div className="mb-2 flex items-center gap-2">
    //                                     <Info className="text-primary h-4 w-4" />
    //                                     <span className="text-muted-foreground text-sm font-medium">
    //                                         Population
    //                                     </span>
    //                                 </div>
    //                                 <p className="text-foreground text-2xl font-bold">
    //                                     {location.value}
    //                                 </p>
    //                             </div>

    //                             <div className="bg-secondary/50 rounded-lg p-4">
    //                                 <div className="mb-2 flex items-center gap-2">
    //                                     <TrendingUp className="text-primary h-4 w-4" />
    //                                     <span className="text-muted-foreground text-sm font-medium">
    //                                         Coordinates
    //                                     </span>
    //                                 </div>
    //                                 <p className="text-foreground font-mono text-sm">
    //                                     {location.coordinates[1].toFixed(4)},{" "}
    //                                     {location.coordinates[0].toFixed(4)}
    //                                 </p>
    //                             </div>
    //                         </div>

    //                         <div className="space-y-3">
    //                             <h3 className="text-foreground font-semibold">Details</h3>
    //                             <div className="bg-secondary/30 rounded-lg p-4">
    //                                 <p className="text-muted-foreground text-sm leading-relaxed">
    //                                     This location has been marked on the map. Click on other
    //                                     markers to view their details. The interactive map allows
    //                                     you to explore different locations around the world.
    //                                 </p>
    //                             </div>
    //                         </div>
    //                     </div>
    //                 </div>
    //             </Drawer.Content>
    //         </Drawer.Portal>
    //     </Drawer.Root>
    // );

    return (
        // <Drawer modal={false} {...props}>
        // <DrawerContent>
        <div className="bg-card flex-1 overflow-y-auto rounded-t-xl p-4">
            {JSON.stringify(selectedFeatures)}
            <div className="bg-muted mx-auto mb-6 h-1.5 w-12 flex-shrink-0 rounded-full" />

            <div className="mx-auto max-w-3xl">
                <div className="mb-6 flex items-start gap-4">
                    <div className="bg-primary/20 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg">
                        <MapPin className="text-primary h-6 w-6" />
                    </div>
                    <div className="flex-1">
                        {/* <DrawerTitle className="text-foreground mb-1 text-2xl font-bold">
                            {location.name}
                        </DrawerTitle> */}
                        <p className="text-muted-foreground">{location.description}</p>
                    </div>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-4">
                    <div className="bg-secondary/50 rounded-lg p-4">
                        <div className="mb-2 flex items-center gap-2">
                            <Info className="text-primary h-4 w-4" />
                            <span className="text-muted-foreground text-sm font-medium">
                                Population
                            </span>
                        </div>
                        <p className="text-foreground text-2xl font-bold">{location.value}</p>
                    </div>

                    <div className="bg-secondary/50 rounded-lg p-4">
                        <div className="mb-2 flex items-center gap-2">
                            <TrendingUp className="text-primary h-4 w-4" />
                            <span className="text-muted-foreground text-sm font-medium">
                                Coordinates
                            </span>
                        </div>
                        <p className="text-foreground font-mono text-sm">
                            {location.coordinates[1].toFixed(4)},{" "}
                            {location.coordinates[0].toFixed(4)}
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-foreground font-semibold">Details</h3>
                    <div className="bg-secondary/30 rounded-lg p-4">
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            This location has been marked on the map. Click on other markers to view
                            their details. The interactive map allows you to explore different
                            locations around the world.
                        </p>
                    </div>
                </div>
            </div>
        </div>
        //     </DrawerContent>
        // </Drawer>
    );
}
