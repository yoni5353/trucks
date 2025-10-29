import { Button } from "@/components/ui/button";
import { Crosshair, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { truckDetailsQuery } from "@/lib/requests";
import { TruckDetails } from "@/lib/types";

const TRANSLATIONS: Record<keyof TruckDetails | string, string> = {
    entity_id: "מזהה ישות",
    op_id: "מזהה מבצע",
    is_drive: "בתנועה",
    description: "תיאור",
    number: "מספר",
    id_ei: "מזהה EI",
    id_si: "מזהה SI",
    mac: "כתובת MAC",
    app_id: "מזהה אפליקציה",
    app_source: "מקור אפליקציה",
    first_seen: "נראה לראשונה",
    last_seen: "נראה לאחרונה",
    first_id: "מזהה ראשוני",
    final_decription: "תיאור סופי",
};

const LAYOUT_CONFIG: {
    title: string;
    fields: (keyof TruckDetails)[];
}[] = [
        {
            title: "מזהים",
            fields: ["op_id", "number", "id_ei", "id_si", "mac"],
        },
        {
            title: "זמני נראות",
            fields: ["first_seen", "last_seen"],
        },
        {
            title: "שונות",
            fields: ["is_drive", "final_decription", "description", "app_id", "app_source", "first_id"],
        },
    ];

const timeFields = LAYOUT_CONFIG.find(g => g.title === "זמני נראות")?.fields || [];

const formatValue = (key: keyof TruckDetails, value: any) => {
    if (typeof value === "boolean" || (typeof value === "string" && (value.toLowerCase() === 'true' || value.toLowerCase() === 'false'))) {
        return (value === true || value.toLowerCase() === 'true') ? "כן" : "לא";
    }
    if (timeFields.includes(key)) {
        return new Date(value).toLocaleString("he-IL", { dateStyle: "short", timeStyle: "medium" });
    }
    return value;
};

const DetailItem = ({ label, value }: { label: string, value: string }) => (
    <div className="flex gap-2 justify-between items-center">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono" dir="ltr">{value}</span>
    </div>
);

export function EntityDetails({
    focusedEntityId,
    onFocus,
}: {
    focusedEntityId: string;
    onFocus?: () => void;
}) {
    const { data: details } = useQuery(truckDetailsQuery('1')); //focusedEntityId

    // if (selectedFeatures.length === 0) {
    //     return <p className="text-sm text-center text-muted-foreground">בחר ישות</p>;
    // }

    if (!details) {
        return (
            <div className="p-4 space-y-4">
                <div className="flex gap-4 items-start">
                    <div className="flex flex-shrink-0 justify-center items-center w-12 h-12 rounded-lg bg-primary/20">
                        <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                        <p className="text-muted-foreground">מציג פרטים על:</p>
                        <p className="font-bold">{focusedEntityId}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onFocus}>
                        <Crosshair className="w-5 h-5" />
                    </Button>
                </div>
                <div className="p-4 text-sm text-center rounded-lg bg-secondary/30 text-muted-foreground">
                    אין נתונים זמינים עבור ישות זו.
                </div>
            </div>
        );
    }

    const [identifiersGroup, ...otherGroups] = LAYOUT_CONFIG;

    return (
        <div className="p-4">
            <div className="flex gap-4 items-start mb-6">
                <div className="flex flex-shrink-0 justify-center items-center w-12 h-12 rounded-lg bg-primary/20">
                    <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                    <p className="text-muted-foreground">מציג פרטים על:</p>
                    <p className="font-bold">{details.entity_id}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onFocus}>
                    <Crosshair className="w-5 h-5" />
                </Button>
            </div>

            <div className="space-y-4 text-sm">
                <div className="p-4 rounded-lg bg-secondary/50">
                    <div className="mb-2 font-medium text-muted-foreground">{identifiersGroup.title}</div>
                    <div className="grid grid-cols-2 gap-2">
                        {identifiersGroup.fields.map(key =>
                            details[key] ? <DetailItem key={key} label={TRANSLATIONS[key]} value={formatValue(key, details[key])} /> : null
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {otherGroups.map(group => (
                        <div key={group.title} className="p-4 rounded-lg bg-secondary/50">
                            <div className="mb-2 font-medium text-muted-foreground">{group.title}</div>
                            <div className="flex flex-col gap-2">
                                {group.fields.map(key =>
                                    details[key] ? <DetailItem key={key} label={TRANSLATIONS[key]} value={formatValue(key, details[key])} /> : null
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
