import { Button } from "@/components/ui/button";
import { Crosshair, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { truckDetailsQuery } from "@/lib/requests";

export function EntityDetails({
    focusedEntityId,
    onFocus,
}: {
    focusedEntityId: string;
    onFocus?: () => void;
}) {
    const { data: details } = useQuery(truckDetailsQuery('1')); //focusedEntityId

    // if (selectedFeatures.length === 0) {
    //     return <p className="text-center text-sm text-muted-foreground">בחר ישות</p>;
    // }

    if (!details) {
        return (
            <div className="space-y-4">
                <div className="mb-6 flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/20">
                        <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                        <p className="text-muted-foreground">מראה פרטים על:</p>
                        {focusedEntityId}
                        <Button variant="ghost" onClick={onFocus} className="ml-auto">
                            <Crosshair />
                        </Button>
                    </div>
                </div>
                <div className="rounded-lg bg-secondary/30 p-4 text-sm text-muted-foreground">אין נתונים לישות זו.</div>
            </div>
        );
    }

    return (
        <>
            <div className="mb-6 flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/20">
                    <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                    <p className="text-muted-foreground">מראה פרטים על:</p>
                    {focusedEntityId}
                    <Button variant="ghost" onClick={onFocus} className="ml-auto">
                        <Crosshair />
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* IDs and identifiers box */}
                    <div className="rounded-lg bg-secondary/50 p-4">
                        <div className="mb-2 text-sm font-medium text-muted-foreground">מזהים</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center justify-between gap-2"><span className="text-muted-foreground">entity_id</span><span className="font-mono" dir="ltr">{details.entity_id}</span></div>
                            <div className="flex items-center justify-between gap-2"><span className="text-muted-foreground">op_id</span><span className="font-mono" dir="ltr">{details.op_id}</span></div>
                            <div className="flex items-center justify-between gap-2"><span className="text-muted-foreground">number</span><span className="font-mono" dir="ltr">{details.number}</span></div>
                            <div className="flex items-center justify-between gap-2"><span className="text-muted-foreground">id_ei</span><span className="font-mono" dir="ltr">{details.id_ei}</span></div>
                            <div className="flex items-center justify-between gap-2"><span className="text-muted-foreground">id_si</span><span className="font-mono" dir="ltr">{details.id_si}</span></div>
                            <div className="flex items-center justify-between gap-2"><span className="text-muted-foreground">mac</span><span className="font-mono" dir="ltr">{details.mac}</span></div>
                        </div>
                    </div>

                    {/* Right column: times + final description stacked */}
                    <div className="flex flex-col gap-4">
                        {/* is_drive box */}
                        <div className="rounded-lg bg-secondary/50 p-4">
                            <div className="mb-2 text-sm font-medium text-muted-foreground">is_drive</div>
                            <div className="text-sm font-mono text-foreground" dir="ltr">{details.is_drive}</div>
                        </div>

                        {/* Final description box */}
                        <div className="rounded-lg bg-secondary/50 p-4">
                            <div className="mb-2 text-sm font-medium text-muted-foreground">final_decription</div>
                            <div className="text-sm text-foreground">{details.final_decription}</div>
                        </div>
                    </div>
                </div>

                {/* Times box moved to standalone position (replaces previous is_drive) */}
                <div className="rounded-lg bg-secondary/50 p-4">
                    <div className="mb-2 text-sm font-medium text-muted-foreground">זמני נראות</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center justify-between gap-2"><span className="text-muted-foreground">first_seen</span><span className="font-mono" dir="ltr">{details.first_seen}</span></div>
                        <div className="flex items-center justify-between gap-2"><span className="text-muted-foreground">last_seen</span><span className="font-mono" dir="ltr">{details.last_seen}</span></div>
                    </div>
                </div>
            </div>
        </>
    );
}
