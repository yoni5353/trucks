import type { EntityEvent } from "@/lib/types";

export const RETRIEVAL_COLORS: Record<EntityEvent["retrievalType"], { background: string; border: string; text: string }> = {
    A: {
        background: "hsl(var(--muted))",
        border: "hsl(var(--muted-foreground))",
        text: "hsl(var(--muted-foreground))",
    },
    B: {
        background: "hsl(var(--chart-5))",
        border: "hsl(var(--chart-5))",
        text: "hsl(var(--primary-foreground))",
    },
    C: {
        background: "hsl(var(--destructive))",
        border: "hsl(var(--destructive))",
        text: "hsl(var(--destructive-foreground))",
    },
};