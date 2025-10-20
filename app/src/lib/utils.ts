import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function sameValues(a: string[], b: string[]) {
    return a.length === b.length && a.every((value) => b.includes(value));
}
