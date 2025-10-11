import type { FeatureLike } from "ol/Feature";
import { Style, Circle as CircleStyle, Fill, Stroke, Text } from "ol/style";
import type { StyleLike } from "ol/style/Style";

export const entityStyle = new Style({
    image: new CircleStyle({
        radius: 8,
        fill: new Fill({ color: "hsl(95 25% 45%)" }),
        stroke: new Stroke({ color: "lightgray", width: 2 }),
    }),
});

export const selectedEntityStyle = new Style({
    image: new CircleStyle({
        radius: 10,
        fill: new Fill({ color: "hsl(95 25% 45%)" }),
        stroke: new Stroke({ color: "lightgray", width: 2 }),
    }),
});

export const clusterStyle: StyleLike = (feature: FeatureLike) => {
    const size = feature.get("features").length;
    if (size === 1) return feature.get("features")[0].getStyle();
    return [
        new Style({
            image: new CircleStyle({
                radius: 10,
                fill: new Fill({
                    color: "hsl(97 22% 40% / 0.7)",
                }),
            }),
        }),
        new Style({
            image: new CircleStyle({
                radius: 14,
                fill: new Fill({
                    color: "hsl(100 20% 35% / 0.7)",
                }),
            }),
            text: new Text({
                text: size.toString(),
                fill: new Fill({ color: "#fff" }),
            }),
        }),
    ];
};
