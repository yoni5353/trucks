import Map from "ol/Map";
import View from "ol/View";
import { DragBox, Draw, Select } from "ol/interaction";
import { Layer, Vector as VectorLayer } from "ol/layer";
import { Cluster, Vector as VectorSource } from "ol/source";
import { fromLonLat } from "ol/proj";
import { Geometry, LineString, Point } from "ol/geom";
import { Feature } from "ol";
import { platformModifierKeyOnly, shiftKeyOnly } from "ol/events/condition";
import { createStore } from "zustand";
import {
    clusterStyle,
    entityStyle,
    selectedEntityStyle,
    historyArrowStyle,
    unfocusedEntityStyle,
    virtualEntityStyle,
    drawnPolygonStyle,
} from "./map-styles";
import { getTileLayers } from "./rasters";
import type { GeographicEvent } from "./types";

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
        drawnPolygon: Feature<Geometry> | undefined;
        setDrawnPolygon: (drawnPolygons: Feature<Geometry>) => void;
        selectedEntities: FeatureId[];
        setSelectedEntities: (selectedEntities: FeatureId[]) => void;
    }>((set) => ({
        drawnPolygon: undefined,
        setDrawnPolygon: (drawnPolygon: Feature<Geometry>) => set({ drawnPolygon }),
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
    const clustersLayer = new VectorLayer({
        source: entitiesCluster,
        style: clusterStyle,
    });

    const histories = new VectorSource();
    const historiesLayer = new VectorLayer({ source: histories });

    const store: MapStore = initStore();

    const drawings = new VectorSource();
    const drawingsLayer = new VectorLayer({ source: drawings, style: drawnPolygonStyle });

    const map = new Map({
        target: undefined,
        layers: [drawingsLayer, clustersLayer, historiesLayer],
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
        excludeLayers: [historiesLayer, drawingsLayer],
    });

    const draw = new Draw({
        source: drawings,
        type: "Polygon",
    });
    draw.on("drawend", (event) => {
        drawings.clear();
        store.getState().setDrawnPolygon(event.feature);
        togglePolygonDrawing(map, draw, false);
    });

    return { map, select, entities, entitiesCluster, histories, store, draw };
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
    data: { [featureId: string]: Array<GeographicEvent> },
    relativeTime?: Date,
) {
    histories.clear();
    const features: Feature[] = [];
    Object.entries(data).forEach(([featureId, events]) => {
        events.sort((a, b) => a.start.localeCompare(b.start));

        // Get previous event and next event to happen. Previous event will be highlighted.
        relativeTime ??= new Date();
        const nextEvent = events.find((event) => new Date(event.start) >= relativeTime!);
        const nextEventIndex = nextEvent ? events.indexOf(nextEvent) : undefined;
        const previousEvent = events[(nextEventIndex ?? events.length) - 1] ?? events[0];
        const previousEventIndex = events.indexOf(previousEvent);
        const previousEventTime = new Date(previousEvent.start);

        // Opacity is calculated by amount of nodes to closest event
        const minStrength = 0.5;
        const maxNodeDistance = Math.max(
            previousEventIndex,
            events.length - previousEventIndex - 1,
        );
        const strengthStep = (1 - minStrength) / maxNodeDistance;

        // Get centers of each location
        const centers = events.map((point) => {
            if (!("coords" in point)) throw new Error("Invalid point");
            return fromLonLat([point.coords[0], point.coords[1]]);
        });

        // Add previous points
        events.forEach((point, index) => {
            const center = centers[index];
            const opacity = 1 - Math.abs(index - previousEventIndex) * strengthStep;

            const feature = new Feature({
                geometry: new Point(center),
            });
            feature.setId(`${featureId}-${point.start}`);
            const style = (index == previousEventIndex ? selectedEntityStyle : entityStyle).clone();
            style.getImage()?.setOpacity(opacity);
            feature.setStyle(style);
            features.push(feature);
        });
        // Connect points with arrows
        for (let i = 0; i < events.length - 1; i++) {
            const start = events[i];
            const end = events[i + 1];
            const arrow = new Feature({
                geometry: new LineString([centers[i], centers[i + 1]]),
            });
            arrow.setId(`${featureId}-${start.start}-${end.start}`);
            arrow.setStyle(historyArrowStyle);
            features.push(arrow);
        }

        // If in between events add virtual event according to given time (linear interpolation)
        if (nextEvent && nextEventIndex && nextEventIndex > 0) {
            const nextEventTime = new Date(nextEvent.start);
            const m =
                (relativeTime.getTime() - previousEventTime.getTime()) /
                (nextEventTime.getTime() - previousEventTime.getTime());
            const x =
                centers[previousEventIndex][0] +
                m * (centers[nextEventIndex][0] - centers[previousEventIndex][0]);
            const y =
                centers[previousEventIndex][1] +
                m * (centers[nextEventIndex][1] - centers[previousEventIndex][1]);
            const virtualEvent = new Feature({
                geometry: new Point([x, y]),
            });
            virtualEvent.setId(`${featureId}-virtual`);
            virtualEvent.setStyle(virtualEntityStyle);
            features.push(virtualEvent);
        }
    });
    histories.addFeatures(features);
}

export function clearAllHistory(histories: VectorSource) {
    histories.clear();
}

// ENTITY FOCUS

export function dimUnselectedEntities(entities: VectorSource, focusedEntityId: string | undefined) {
    const features = entities.getFeatures();
    if (focusedEntityId) {
        features.forEach((feature) => {
            feature.set("dimmed", feature.getId() !== focusedEntityId, true);
        });
    } else {
        features.forEach((feature) => {
            feature.set("dimmed", false, true);
        });
    }
    entities.changed();
}

// DRAWINGS

export function togglePolygonDrawing(map: Map, draw: Draw, toggle: boolean) {
    if (toggle) {
        map.addInteraction(draw);
    } else {
        map.removeInteraction(draw);
    }
}
