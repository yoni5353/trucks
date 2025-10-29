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

            map.on('click', (e) => {
                // Check if the click is on a feature
                const features = map.getFeaturesAtPixel(e.pixel);
                // If not, clear the selection and hide the tooltip
                if (features.length === 0) {
                    select?.getFeatures().clear();
                    tooltipInstanceRef.current?.setPosition(undefined);
                    setTooltipEntityId(undefined);
                    onViewEntity(undefined);
                }
            });

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
            <div ref={mapRef} className="overflow-hidden w-full h-full" />
            <div ref={tooltipRef} className="absolute tooltip-thing text-primary">
                <div
                    className={cn(
                        `absolute transition-all duration-300 -translate-x-1/2`,
                        tooltipEntityId
                            ? "opacity-100 translate-y-0 pointer-events-auto"
                            : "opacity-0 translate-y-2 pointer-events-none",
                    )}
                >
                    <div className="flex gap-2 p-2 rounded-xl border shadow-2xl backdrop-blur-sm border-border bg-card">
                        <Button
                            size="sm"
                            variant="ghost"
                            className="p-0 w-9 h-9"
                            onClick={() => tooltipEntityId && onViewEntity(tooltipEntityId)}
                        >
                            <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="p-0 w-9 h-9">
                            <CopyIcon className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="p-0 w-9 h-9">
                            <Download className="w-4 h-4" />
                        </Button>
                    </div>
                    {/* Arrow pointing down */}
                    <div className="absolute left-1/2 top-full -mt-[5px] -translate-x-1/2">
                        <div className="w-3 h-3 border-r border-b rotate-45 border-border bg-card" />
                    </div>
                </div>
            </div>
        </>
    );
}
