import { useEffect, useRef } from "react";
import Map from "ol/Map";
import "ol/ol.css";
import Overlay from "ol/Overlay";

export function OLMap({ map }: { map: Map }) {
    const mapRef = useRef<HTMLDivElement | null>(null);
    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const tooltipInstanceRef = useRef<Overlay | null>(null);

    useEffect(() => {
        if (mapRef.current) {
            map.setTarget(mapRef.current);

            // Init tooltip
            const tooltip = new Overlay({
                element: tooltipRef.current!,
                offset: [10, 0],
                positioning: "bottom-left",
                autoPan: {
                    animation: {
                        duration: 250,
                    },
                },
            });
            tooltipInstanceRef.current = tooltip;
            map.addOverlay(tooltip);
            map.on("dblclick", (evt) => {
                tooltip.setPosition(evt.coordinate);
            });
            map.on("singleclick", () => {
                tooltip.setPosition(undefined);
            });

            return () => {
                map.setTarget(undefined);
                map.removeOverlay(tooltip);
            };
        }
    }, [map]);

    return (
        <>
            <div
                ref={mapRef}
                className="h-full w-full overflow-hidden rounded-lg border border-gray-300"
            />
            <div ref={tooltipRef} className="tooltip-thing absolute">
                <div className="anmiate-pluse h-10 w-10 bg-red-800"></div>
            </div>
        </>
    );
}
