import { Info, MapPin, TrendingUp } from "lucide-react";
import type { MapStore } from "@/lib/map";
import { useStore } from "zustand";

export function PageDrawer({ store }: { store: MapStore }) {
    const location = {
        name: "Sample Location",
        description: "This is a sample description for the location.",
        value: 123456,
        coordinates: [37.7749, -122.4194], // Example coordinates (latitude, longitude)
    };

    const selectedFeatures = useStore(store, (s) => s.selectedEntities);

    return (
        <div className="text-prim flex-1 overflow-y-auto rounded-t-xl bg-card p-4">
            <div className="mx-auto max-w-3xl">
                <div className="mb-6 flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/20">
                        <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                        <p className="text-muted-foreground">{location.description}</p>
                        {JSON.stringify(selectedFeatures)}
                    </div>
                </div>
                <div className="mb-6 grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-secondary/50 p-4">
                        <div className="mb-2 flex items-center gap-2">
                            <Info className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-muted-foreground">
                                Population
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{location.value}</p>
                    </div>

                    <div className="rounded-lg bg-secondary/50 p-4">
                        <div className="mb-2 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-muted-foreground">
                                Coordinates
                            </span>
                        </div>
                        <p className="font-mono text-sm text-foreground">
                            {location.coordinates[1].toFixed(4)},{" "}
                            {location.coordinates[0].toFixed(4)}
                        </p>
                    </div>
                </div>
                <div className="space-y-3">
                    <h3 className="font-semibold text-foreground">Details</h3>
                    <div className="rounded-lg bg-secondary/30 p-4">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            This location has been marked on the map. Click on other markers to view
                            their details. The interactive map allows you to explore different
                            locations around the world.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
