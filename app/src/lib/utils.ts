import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { XterEntity } from "./types";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function sameValues(a: string[], b: string[]) {
    return a.length === b.length && a.every((value) => b.includes(value));
}

export const getFeatureId = (entity: XterEntity) => `${entity.type}-${entity.id}`;