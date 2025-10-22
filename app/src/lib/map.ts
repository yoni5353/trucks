import Map from "ol/Map";
import View from "ol/View";
import { DragBox, Select } from "ol/interaction";
import { Layer, Vector as VectorLayer } from "ol/layer";
import { Cluster, Vector as VectorSource } from "ol/source";
import { fromLonLat } from "ol/proj";
import { LineString, Point } from "ol/geom";
import { Feature } from "ol";
import { platformModifierKeyOnly, shiftKeyOnly } from "ol/events/condition";
import { createStore } from "zustand";
import {
    clusterStyle,
    entityStyle,
    selectedEntityStyle,
    historyArrowStyle,
    unfocusedEntityStyle,
} from "./map-styles";
import { getTileLayers } from "./rasters";

// Feature Ids Breakdown:
// - Entities: Regular entities on the map
//     FeatureId = {EntityType}-{EntityId}
//     Clusteres don't have id.
// - Histories: Histories of entities locations
//     FeatureId of points = {EntityFeatureId}-{Time}
//     FeatureId of lines = {EntityFeatureId}-{Time1}-{Time2}

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

    const histories = new VectorSource();
    const historiesLayer = new VectorLayer({ source: histories });

    const store: MapStore = initStore();

    const map = new Map({
        target: undefined,
        layers: [clusters, historiesLayer],
        view: new View({
            center: fromLonLat([35, 31]),
            zoom: 7.5,
        }),
        controls: [],
    });
    getTileLayers().then((layers) => {
        layers.reverse().forEach((layer) => map.getLayers().insertAt(0, layer));
    });

    const { select } = initSelectInteractions(map, store, entities, {
        excludeLayers: [historiesLayer],
    });

    return { map, select, entities, entitiesCluster, histories, store };
}

/**
 * Select emits the "select" only on single selections. It is possible to listen to dragbox
 * events by listening to the features Collection with the "add" and "remove" events.
 */
function initSelectInteractions(
    map: Map,
    store: MapStore,
    source: VectorSource,
    { excludeLayers }: { excludeLayers?: Layer[] },
) {
    const select = new Select({
        toggleCondition: platformModifierKeyOnly,
        style: selectedEntityStyle,
        filter: (_feature, layer) => {
            return !excludeLayers?.includes(layer);
        },
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
        // TODO padding? to zoom in middle of map pane not disregarding the drawer and
    });
}

// ENTITY HISTORY

/* Registers all given histories for given entities, drawing previous points and arrows */
export function registerHistoryOfEntities(
    histories: VectorSource,
    data: { [featureId: string]: Array<{ coords: number[]; time: string }> },
) {
    histories.clear();
    const features: Feature[] = [];
    Object.entries(data).forEach(([featureId, points]) => {
        points.sort((a, b) => a.time.localeCompare(b.time));
        const strength = 0.5;
        const strengthStep = (1 - strength) / (points.length - 1);

        // Add previous points
        points.forEach((point, index) => {
            const opacity = strength + index * strengthStep;
            const feature = new Feature({
                geometry: new Point(fromLonLat([point.coords[0], point.coords[1]])),
            });
            feature.setId(`${featureId}-${point.time}`);
            const style = entityStyle.clone();
            style.getImage()?.setOpacity(opacity);
            feature.setStyle(style);
            features.push(feature);
        });
        // Connect points with arrows
        for (let i = 0; i < points.length - 1; i++) {
            const start = points[i];
            const end = points[i + 1];
            const arrow = new Feature({
                geometry: new LineString([
                    fromLonLat([start.coords[0], start.coords[1]]),
                    fromLonLat([end.coords[0], end.coords[1]]),
                ]),
            });
            arrow.setId(`${featureId}-${start.time}-${end.time}`);
            arrow.setStyle(historyArrowStyle);
            features.push(arrow);
        }
    });
    histories.addFeatures(features);
}

export function clearAllHistory(histories: VectorSource) {
    histories.clear();
}

// ENTITY FOCUS

export function updateEntityOpacity(entities: VectorSource, focusedEntityId: string | undefined) {
    const features = entities.getFeatures();

    if (focusedEntityId) {
        features.forEach((feature) => {
            const isDimmed = feature.getId() !== focusedEntityId;
            feature.setStyle(isDimmed ? unfocusedEntityStyle : selectedEntityStyle);
        });
    } else {
        features.forEach((feature) => {
            feature.setStyle(entityStyle);
        });
    }
}
