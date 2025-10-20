import Map from "ol/Map";
import View from "ol/View";
import { DragBox, Select } from "ol/interaction";
import { Vector as VectorLayer } from "ol/layer";
import { Cluster, Vector as VectorSource } from "ol/source";
import { fromLonLat } from "ol/proj";
import { Point } from "ol/geom";
import { Feature } from "ol";
import { platformModifierKeyOnly, shiftKeyOnly } from "ol/events/condition";
import { createStore } from "zustand";
import { clusterStyle, entityStyle, selectedEntityStyle } from "./map-styles";
import { getTileLayer } from "./rasters";

type FeatureId = string | number;
const initStore = () =>
    createStore<{
        selectedEntities: FeatureId[];
        setSelectedEntities: (selectedEntities: FeatureId[]) => void;
    }>((set) => ({
        selectedEntities: [],
        setSelectedEntities: (selectedEntities: FeatureId[]) => set({ selectedEntities }),
    }));
export type MapStore = ReturnType<typeof initStore>;

export function initMap() {
    const entities = new VectorSource();

    const entitiesCluster = new Cluster({
        distance: 10,
        minDistance: 5,
        source: entities,
    });
    const clusters = new VectorLayer({
        source: entitiesCluster,
        style: clusterStyle,
    });

    const store: MapStore = initStore();

    const map = new Map({
        target: undefined,
        layers: [getTileLayer(), clusters],
        view: new View({
            center: fromLonLat([35, 31]),
            zoom: 7.5,
        }),
        controls: [],
    });

    const { select } = initSelectInteractions(map, store, entities);

    return { map, select, entities, entitiesCluster, store };
}

/**
 * Select emits the "select" only on single selections. It is possible to listen to dragbox
 * events by listening to the features Collection with the "add" and "remove" events.
 */
function initSelectInteractions(map: Map, store: MapStore, source: VectorSource) {
    const select = new Select({
        toggleCondition: platformModifierKeyOnly,
        style: selectedEntityStyle,
    });
    map.addInteraction(select);
    const selectedFeatures = select.getFeatures();
    const dragBox = new DragBox({ condition: shiftKeyOnly });
    dragBox.on("boxend", () => {
        const extent = dragBox.getGeometry().getExtent();
        source.forEachFeatureIntersectingExtent(extent, (feature) => {
            if (feature.getId()) selectedFeatures.push(feature);
        });
    });
    map.addInteraction(dragBox);

    // Currently not batched:
    selectedFeatures.on("change:length", (e) => {
        const featuresAndClusters = selectedFeatures.getArray();
        const features = featuresAndClusters
            .flatMap((c) => c.get("features") ?? [])
            .concat(featuresAndClusters.filter((f) => f.getId()));
        store.getState().setSelectedEntities(features.map((f) => f?.getId()));
    });

    return { select, dragBox };
}

export function addRandomEntity(source: VectorSource) {
    const feature = new Feature({
        geometry: new Point(fromLonLat([34.8 + Math.random() * 0.1, 31.2 + Math.random() * 0.1])),
    });

    source.addFeature(feature);
    feature.setStyle(entityStyle);
    feature.setId(`entity-${Math.floor(Math.random() * 10000)}`);
}

export function addEntities(
    source: VectorSource,
    entities: Array<{ type: string; id: string | number; location: number[] }>,
) {
    const features = entities.map((entity) => {
        const feature = new Feature({
            geometry: new Point(fromLonLat([entity.location[0], entity.location[1]])),
        });
        feature.setId(`${entity.type}-${entity.id}`);
        feature.setStyle(entityStyle);
        return feature;
    });
    source.addFeatures(features);
}

export function selectEntities(select: Select, source: VectorSource, entitiesIds: string[]) {
    const features = source.getFeatures();
    select.getFeatures().clear();
    entitiesIds.forEach((id) => {
        const feature = features.find((f) => f.getId() === id);
        if (feature) {
            select.getFeatures().push(feature);
        }
    });
}

export function flyToEntity(map: Map, entities: VectorSource, entityId: string) {
    const geometry = entities.getFeatureById(entityId)?.getGeometry();
    if (!geometry) return;
    map?.getView().fit(geometry, {
        duration: 1000,
        maxZoom: 14,
    });
}
