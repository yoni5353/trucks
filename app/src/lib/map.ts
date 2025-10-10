import Map from "ol/Map";
import View from "ol/View";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM, Vector as VectorSource } from "ol/source";
import { fromLonLat } from "ol/proj";
import { Point } from "ol/geom";
import { Feature } from "ol";
import { Style, Circle as CircleStyle, Fill, Stroke } from "ol/style";

export function initMap() {
    const entities = new VectorSource();
    const entitiesLayer = new VectorLayer({ source: entities });

    const map = new Map({
        target: undefined,
        layers: [
            new TileLayer({
                source: new OSM(),
            }),
            entitiesLayer,
        ],
        view: new View({
            center: fromLonLat([0, 0]),
            zoom: 2,
        }),
    });

    return { map, entities, entitiesLayer };
}

export function addEntity(source: VectorSource) {
    const feature = new Feature({
        geometry: new Point(fromLonLat([34.8 + Math.random() * 0.1, 31.2 + Math.random() * 0.1])),
    });

    feature.setStyle(
        new Style({
            image: new CircleStyle({
                radius: 8,
                fill: new Fill({ color: "#3b82f6" }),
                stroke: new Stroke({ color: "white", width: 2 }),
            }),
        }),
    );

    source.addFeature(feature);
}
