import { Button } from "@/components/ui/button";
import { Crosshair, Info, MapPin, TrendingUp } from "lucide-react";

export function EntityDetails({
    selectedFeatures,
    onFocus,
}: {
    selectedFeatures: any[];
    onFocus?: () => void;
}) {
    const location = {
        name: "Sample Location",
        description: "This is a sample description for the location.",
        value: 123456,
        coordinates: [37.7749, -122.4194], // Example coordinates (latitude, longitude)
    };

    // if (selectedFeatures.length === 0) {
    //     return <p className="text-center text-sm text-muted-foreground">בחר ישות</p>;
    // }

    return (
        <>
            <div className="mb-6 flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/20">
                    <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                    <p className="text-muted-foreground">מראה פרטים על:</p>
                    {JSON.stringify(selectedFeatures)}
                    <Button variant="ghost" onClick={onFocus} className="ml-auto">
                        <Crosshair />
                    </Button>
                </div>
            </div>
            <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-secondary/50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                        <Info className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-muted-foreground">מספר גדול</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{location.value}</p>
                </div>

                <div className="rounded-lg bg-secondary/50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-muted-foreground">מיקום</span>
                    </div>
                    <p className="text-right font-mono text-sm text-foreground" dir="ltr">
                        {location.coordinates[1].toFixed(4)}, {location.coordinates[0].toFixed(4)}
                    </p>
                </div>
            </div>
            <div className="space-y-3">
                <h3 className="font-semibold text-foreground">פירוט</h3>
                <div className="rounded-lg bg-secondary/30 p-4">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        העיר י׳ שוכנת במרומי הרי הי׳. ככה הייתי רוצָה לפתוח את הסיפור שלי; בריחוק
                        מיושב, בנשימה עמוקה, בצילום פנורמי שמתמקד לאט מאוד ברחוב אחד, ולאט מאוד בבית
                        אחד, ״זה הבית שבו נולדתי״. אבל צחוק תעשי מעצמך כשי׳ שלך היא ירושלים, וכל
                        אידיוט הרי יודע על ירושלים. ועל ירושלים אי אפשר לדבר כבר בכלל. כלומר אי אפשר
                        בלי ״סמטה מתפתלת״ ו״מבואות של אבן״, ״שיחי צלף״ ו״ערבייה בשוק״. ולי אין מילה
                        לומר על שיחי צלף ומבואות של אבן ואין לי שמץ רצון לתבל בעגה עסיסית של ימאים
                        ירושלמים. אלה העסיסיים שיושבים בנמל באגריפס ומגלגלים מעשיות ושפם.
                    </p>
                </div>
            </div>
        </>
    );
}
