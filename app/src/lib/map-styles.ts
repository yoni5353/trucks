import type Feature from "ol/Feature";
import type { FeatureLike } from "ol/Feature";
import { Geometry, Point } from "ol/geom";
import { Style, Circle as CircleStyle, Fill, Stroke, Text, Icon } from "ol/style";
import type { StyleLike } from "ol/style/Style";

export const entityStyle = new Style({
    image: new CircleStyle({
        radius: 8,
        fill: new Fill({ color: "hsl(97 22% 40%)" }),
        stroke: new Stroke({ color: "silver", width: 2 }),
    }),
});

export const selectedEntityStyle = new Style({
    image: new CircleStyle({
        radius: 10,
        fill: new Fill({ color: "hsl(95 25% 45%)" }),
        stroke: new Stroke({ color: "silver", width: 2 }),
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

// ENTITY HISTORY

const lineStyle = new Style({
    stroke: new Stroke({
        color: "hsl(100 20% 35%)",
        width: 2,
    }),
});

const arrowHeadStyle = (x: number, y: number, rotation: number) =>
    new Style({
        geometry: new Point([x, y]),
        image: new Icon({
            src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"><polygon points="0,0 12,7 0,12" stroke="silver" fill="hsl(100 20% 35%)"/></svg>',
            anchor: [0.75, 0.5],
            rotateWithView: true,
            rotation,
        }),
    });

export function historyArrowStyle(feature: Feature<Geometry>, _resolution: unknown) {
    const styles = [lineStyle];

    const geom = feature.getGeometry();
    const coords = geom.getCoordinates();

    for (let i = 1; i < coords.length; i++) {
        const [x1, y1] = coords[i - 1];
        const [x2, y2] = coords[i];
        const dx = x2 - x1;
        const dy = y2 - y1;
        const rotation = Math.atan2(dy, dx);

        styles.push(arrowHeadStyle(x2, y2, -rotation));
    }

    return styles;
}
