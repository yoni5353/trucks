import { SidebarMenuButton } from "@/components/ui/sidebar";
import { togglePolygonDrawing } from "@/lib/map";
import { MapPinned } from "lucide-react";
import type { Draw } from "ol/interaction";
import { useState } from "react";
import type { Map } from "ol";

export function GeometrySelection({ draw, map }: { draw: Draw; map: Map }) {
    const [isDrawing, setIsDrawing] = useState(false);

    function toggleDrawing() {
        setIsDrawing(!isDrawing);
        togglePolygonDrawing(map, draw, !isDrawing);
    }

    return (
        <SidebarMenuButton className="mx-auto" variant="outline" onClick={toggleDrawing}>
            <MapPinned />
            <span>בחר אזור</span>
        </SidebarMenuButton>
    );
}
