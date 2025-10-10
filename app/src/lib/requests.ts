import { queryOptions } from "@tanstack/react-query";

export const entitiesQuery = queryOptions({
    queryKey: ["entities"],
    queryFn: async () => {
        return [
            { type: "truck", id: 1, name: "Entity 1", location: [34.8, 31.2] },
            { type: "truck", id: 2, name: "Entity 2", location: [34.9, 31.3] },
            { type: "truck", id: 3, name: "Entity 3", location: [35.0, 31.4] },
            { type: "truck", id: 4, name: "Entity 4", location: [34.85, 31.25] },
            { type: "truck", id: 5, name: "Entity 5", location: [34.95, 31.35] },
            { type: "truck", id: 6, name: "Entity 6", location: [34.88, 31.28] },
            // { type: "truck", id: 7, name: "Entity 1", location: [34.8, 31.2] },
            // { type: "truck", id: 8, name: "Entity 2", location: [34.9, 31.3] },
            // { type: "truck", id: 9, name: "Entity 3", location: [35.0, 31.4] },
            // { type: "truck", id: 10, name: "Entity 4", location: [34.85, 31.25] },
            // { type: "truck", id: 11, name: "Entity 5", location: [34.95, 31.35] },
            // { type: "truck", id: 12, name: "Entity 6", location: [34.88, 31.28] },
        ];
    },
});
