import type { TimelineOptions } from "vis-timeline";

export const timelineOptions : TimelineOptions = {
    width: "100%",
    height: "100%",
    stack: false,
    zoomMin: 1000 * 60,
    zoomMax: 1000 * 60 * 60 * 24 * 7,
    start: new Date(Date.now() - 24 * 60 * 60 * 1000),
    end: new Date(),
    selectable: true,
    multiselect: true,
    moveable: false,
    orientation: {
        axis: "top",
    },
    snap: (date) => {
        const minute = 60 * 1000;
        return Math.round(date.valueOf() / minute) * minute;
    },
    // group drag-and-drop ordering
    groupEditable: { order: true },
    groupOrder: function (a, b) {
        return a.order - b.order;
    },
    groupOrderSwap: function (a, b) {
        const v = a.order;
        a.order = b.order;
        b.order = v;
    },
    // Important workaround-fix for initial loading, see https://github.com/visjs/vis-timeline/issues/1340
    rollingMode: { follow: false },
    // temp
    xss: { disabled: true },
};