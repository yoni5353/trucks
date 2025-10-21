import type Map from "ol/Map";
import { Button } from "@/components/ui/button";
import { flyToEntity } from "@/lib/map";
import { BotIcon, MousePointerClickIcon, XCircleIcon } from "lucide-react";
import type VectorSource from "ol/source/Vector";
import { EntityDetails } from "../drawer/entity-details";

export function Pane({
    focusedFeatureId,
    onDismiss,
    map,
    entities,
}: {
    focusedFeatureId: string | undefined;
    onDismiss?: () => void;
    map: Map;
    entities: VectorSource;
}) {
    const focusCurrentEntity = () => {
        if (focusedFeatureId) {
            flyToEntity(map, entities, focusedFeatureId);
        }
    };

    return (
        <div className="mr-72 flex h-full flex-col p-2" dir="rtl">
            <div className="flex items-center justify-between">
                {focusedFeatureId ? (
                    <h2 className="flex gap-1">
                        <BotIcon />
                        <span className="font-bold">{focusedFeatureId}</span>
                    </h2>
                ) : (
                    <h2 className="flex gap-2">
                        בחר ישות על המפה או ציר הזמן <MousePointerClickIcon />
                    </h2>
                )}
                <Button onClick={onDismiss} variant="ghost">
                    <XCircleIcon />
                </Button>
            </div>
            {focusedFeatureId && (
                <div className="p-4">
                    <EntityDetails
                        focusedEntityId={focusedFeatureId}
                        onFocus={focusCurrentEntity}
                    />
                </div>
            )}
        </div>
    );
}
