import type { FeatureLike } from "ol/Feature";
import { Style, Circle as CircleStyle, Fill, Stroke, Text } from "ol/style";
import type { StyleLike } from "ol/style/Style";

export const entityStyle = new Style({
    image: new CircleStyle({
        radius: 8,
        fill: new Fill({ color: "#3b82f6" }),
        stroke: new Stroke({ color: "white", width: 2 }),
    }),
});

export const selectedEntityStyle = new Style({
    image: new CircleStyle({
        radius: 10,
        fill: new Fill({ color: "#3b82f6" }),
        stroke: new Stroke({ color: "white", width: 2 }),
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
                    color: "rgba(255, 165, 0, 0.7)",
                }),
            }),
        }),
        new Style({
            image: new CircleStyle({
                radius: 14,
                fill: new Fill({
                    color: "rgba(255, 165, 0, 0.7)",
                }),
            }),
            text: new Text({
                text: size.toString(),
                fill: new Fill({ color: "#fff" }),
            }),
        }),
    ];
};
