import { Router, type IRouter } from "express";
import {
  BuildRouteBody,
  BuildRouteResponse,
  GetCampusSummaryResponse,
  ListBuildingsResponse,
  ListPlaceStatusesResponse,
  SearchPlacesQueryParams,
  SearchPlacesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const buildings = [
  {
    id: "c1",
    code: "C1",
    name: "Main Science Hall",
    floors: 3,
    accent: "#d7f36b",
    position: { x: 30, y: 28 },
  },
  {
    id: "c2",
    code: "C2",
    name: "Library & Learning",
    floors: 2,
    accent: "#b3d8ff",
    position: { x: 65, y: 38 },
  },
  {
    id: "hub",
    code: "HUB",
    name: "Student Commons",
    floors: 1,
    accent: "#f9c7a7",
    position: { x: 48, y: 68 },
  },
];

const places = [
  {
    id: "room-c1-1-322",
    name: "C1.1.322",
    type: "Lecture room",
    buildingId: "c1",
    floor: 1,
    nodeId: "room-c1-1-322",
    accessible: true,
    x: 39,
    y: 24,
    capacity: 48,
    details: "Big Data lecture room · 48 seats",
  },
  {
    id: "room-c1-0-118",
    name: "C1.0.118",
    type: "Lab",
    buildingId: "c1",
    floor: 0,
    nodeId: "room-c1-0-118",
    accessible: false,
    x: 24,
    y: 37,
    capacity: 24,
    details: "Computer vision lab · access by card",
  },
  {
    id: "library-c2",
    name: "Central Library",
    type: "Library",
    buildingId: "c2",
    floor: 0,
    nodeId: "library-c2",
    accessible: true,
    x: 67,
    y: 34,
    capacity: 180,
    details: "Quiet study zones · open until 22:00",
  },
  {
    id: "coworking-hub",
    name: "North Co-working",
    type: "Co-working",
    buildingId: "hub",
    floor: 0,
    nodeId: "coworking-hub",
    accessible: true,
    x: 45,
    y: 64,
    capacity: 45,
    details: "Focus desks and meeting pods",
  },
  {
    id: "canteen-hub",
    name: "Atrium Canteen",
    type: "Food & drink",
    buildingId: "hub",
    floor: 0,
    nodeId: "canteen-hub",
    accessible: true,
    x: 53,
    y: 72,
    capacity: 120,
    details: "Lunch service · hot meals and coffee",
  },
  {
    id: "deanery-c2",
    name: "Student Services",
    type: "Administration",
    buildingId: "c2",
    floor: 1,
    nodeId: "deanery-c2",
    accessible: true,
    x: 73,
    y: 45,
    capacity: 12,
    details: "Registrar and student support",
  },
];

const statuses = [
  {
    placeId: "library-c2",
    current: 132,
    capacity: 180,
    status: "moderate" as const,
    updatedAt: "2 min ago",
  },
  {
    placeId: "coworking-hub",
    current: 42,
    capacity: 45,
    status: "busy" as const,
    updatedAt: "1 min ago",
  },
  {
    placeId: "canteen-hub",
    current: 64,
    capacity: 120,
    status: "available" as const,
    updatedAt: "3 min ago",
  },
  {
    placeId: "room-c1-1-322",
    current: 32,
    capacity: 48,
    status: "moderate" as const,
    updatedAt: "4 min ago",
  },
];

const routeTemplates: Record<string, { distance: number; minutes: number; floors: number[] }> = {
  "room-c1-1-322": { distance: 184, minutes: 4, floors: [0, 1] },
  "library-c2": { distance: 252, minutes: 6, floors: [0] },
  "coworking-hub": { distance: 120, minutes: 3, floors: [0] },
  "canteen-hub": { distance: 142, minutes: 3, floors: [0] },
  "deanery-c2": { distance: 290, minutes: 7, floors: [0, 1] },
};

router.get("/campus/summary", (_req, res) => {
  res.json(
    GetCampusSummaryResponse.parse({
      buildings: 3,
      rooms: 42,
      activeEvents: 8,
      liveZones: 12,
    }),
  );
});

router.get("/campus/buildings", (_req, res) => {
  res.json(ListBuildingsResponse.parse(buildings));
});

router.get("/campus/places", (req, res) => {
  const query = SearchPlacesQueryParams.parse(req.query);
  const normalized = query.q?.toLowerCase().trim();

  const result = places.filter((place) => {
    const matchesQuery =
      !normalized ||
      [place.name, place.type, place.details]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalized));
    const matchesBuilding =
      !query.buildingId || place.buildingId === query.buildingId;
    const matchesFloor =
      query.floor === undefined || place.floor === query.floor;

    return matchesQuery && matchesBuilding && matchesFloor;
  });

  res.json(SearchPlacesResponse.parse(result));
});

router.get("/campus/statuses", (_req, res) => {
  res.json(ListPlaceStatusesResponse.parse(statuses));
});

router.post("/routes", (req, res) => {
  const input = BuildRouteBody.parse(req.body);
  const destination = places.find(
    (place) => place.nodeId === input.destinationNodeId,
  );

  if (!destination) {
    res.status(404).json({ error: "Destination was not found" });
    return;
  }

  const template = routeTemplates[destination.nodeId] ?? {
    distance: 210,
    minutes: 5,
    floors: [0],
  };

  const accessible = input.accessibleOnly;
  const response = {
    distanceMeters: template.distance + (accessible ? 18 : 0),
    durationMinutes: template.minutes + (accessible ? 1 : 0),
    floors: template.floors,
    accessible,
    steps: [
      {
        label: "Start at the south gate",
        detail: "Follow the central promenade for 36 m",
        kind: "start",
      },
      ...(accessible
        ? [
            {
              label: "Take the accessible lift",
              detail: "Lift connection keeps the route step-free",
              kind: "elevator",
            },
          ]
        : [
            {
              label: "Cross the main quad",
              detail: "Stay on the marked pedestrian path",
              kind: "walk",
            },
          ]),
      {
        label: `Arrive at ${destination.name}`,
        detail: destination.details ?? "Destination",
        kind: "destination",
      },
    ],
  };

  res.json(BuildRouteResponse.parse(response));
});

export default router;