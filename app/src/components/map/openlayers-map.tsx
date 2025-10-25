import { useEffect, useRef, useState } from "react";
import Map from "ol/Map";
import "ol/ol.css";
import Overlay from "ol/Overlay";
import type { Select } from "ol/interaction";
import { Button } from "../ui/button";
import { CopyIcon, Download, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

type EntityId = string;

export function OLMap({
    map,
    select,
    onViewEntity,
    onClickSingleEntity,
}: {
    map: Map;
    select?: Select;
    onViewEntity: (entityId: string | undefined) => void;
    onClickSingleEntity: (entityId: string) => void;
}) {
    const mapRef = useRef<HTMLDivElement | null>(null);

    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const tooltipInstanceRef = useRef<Overlay | null>(null);
    const [tooltipEntityId, setTooltipEntityId] = useState<EntityId>();

    useEffect(() => {
        if (mapRef.current) {
            map.setTarget(mapRef.current);

            // Init tooltip
            const tooltip = new Overlay({
                element: tooltipRef.current!,
                offset: [0, -80],
                positioning: "top-center",
                autoPan: {
                    animation: {
                        duration: 250,
                    },
                },
            });
            tooltipInstanceRef.current = tooltip;
            map.addOverlay(tooltip);
            select?.on("select", (e) => {
                const selectedFeatures = e.target.getFeatures();
                if (e.selected.length === 1 && selectedFeatures.getLength() === 1) {
                    const coordinates = e.selected[0].getGeometry()?.getCoordinates();
                    tooltip.setPosition(coordinates);
                    const featureId = e.selected[0].get("features")?.[0].getId();
                    // setTooltipEntityId(featureId); disable tooltip for now
                    onClickSingleEntity(featureId);
                } else {
                    tooltip.setPosition(undefined);
                    setTooltipEntityId(undefined);
                    onViewEntity(undefined);
                }
            });

            return () => {
                map.setTarget(undefined);
                map.removeOverlay(tooltip);
            };
        }
    }, [map, onClickSingleEntity, onViewEntity, select]);

    return (
        <>
            <div ref={mapRef} className="h-full w-full overflow-hidden" />
            <div ref={tooltipRef} className="tooltip-thing absolute text-primary">
                <div
                    className={cn(
                        `absolute -translate-x-1/2 transition-all duration-300`,
                        tooltipEntityId
                            ? "pointer-events-auto translate-y-0 opacity-100"
                            : "pointer-events-none translate-y-2 opacity-0",
                    )}
                >
                    <div className="flex gap-2 rounded-xl border border-border bg-card p-2 shadow-2xl backdrop-blur-sm">
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-9 w-9 p-0"
                            onClick={() => tooltipEntityId && onViewEntity(tooltipEntityId)}
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-9 w-9 p-0">
                            <CopyIcon className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-9 w-9 p-0">
                            <Download className="h-4 w-4" />
                        </Button>
                    </div>
                    {/* Arrow pointing down */}
                    <div className="absolute left-1/2 top-full -mt-[5px] -translate-x-1/2">
                        <div className="h-3 w-3 rotate-45 border-b border-r border-border bg-card" />
                    </div>
                </div>
            </div>
        </>
    );
}
