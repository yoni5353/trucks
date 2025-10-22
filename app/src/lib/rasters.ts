import TileLayer from "ol/layer/Tile";
import { OSM, XYZ } from "ol/source";

export async function getTileLayers() {
    return [
        new TileLayer({
            source: new XYZ({
                url: "https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
                attributions: '&copy; <a href="https://carto.com/">CARTO</a>',
            }),
        }),
    ];
    return [
        new TileLayer({
            source: new OSM(),
        }),
    ];
}
