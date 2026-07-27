import { z } from "zod";

export const MAP_LAYER_IDS = [
  "fast-travel",
  "tower",
  "alpha",
  "pal-spawn",
  "effigy",
  "note",
] as const;

export type MapLayerId = (typeof MAP_LAYER_IDS)[number];

export const MAP_MODES = ["hunt", "pal", "collect", "travel"] as const;
export type MapMode = (typeof MAP_MODES)[number];

export const MODE_LAYERS: Record<MapMode, MapLayerId[]> = {
  hunt: ["alpha", "tower"],
  pal: ["pal-spawn", "alpha"],
  collect: ["effigy", "note"],
  travel: ["fast-travel", "tower"],
};

export const LAYER_LABELS: Record<MapLayerId, string> = {
  "fast-travel": "Fast travel",
  tower: "Syndicate towers",
  alpha: "Alpha pals",
  "pal-spawn": "Pal spawns",
  effigy: "Pal effigies",
  note: "Notes",
};

export const MODE_LABELS: Record<MapMode, string> = {
  hunt: "Hunt",
  pal: "Find Pal",
  collect: "Collect",
  travel: "Travel",
};

export const MODE_HINTS: Record<MapMode, string> = {
  hunt: "Alphas and towers",
  pal: "Wild spawns + alphas",
  collect: "Effigies and notes",
  travel: "Statues and towers",
};

const pointSchema = z.object({
  /** Normalized X 0–1 (left → right on the map image). */
  nx: z.number().min(0).max(1),
  /** Normalized Y 0–1 (top → bottom on the map image). */
  ny: z.number().min(0).max(1),
});

export type MapPoint = z.infer<typeof pointSchema>;

export const mapMarkerSchema = z.object({
  id: z.string().min(1),
  layer: z.enum(MAP_LAYER_IDS),
  name: z.string().min(1),
  nx: z.number().min(0).max(1),
  ny: z.number().min(0).max(1),
  /** Optional Paldeck slug for alphas / spawns. */
  palSlug: z.string().optional(),
  region: z.string().optional(),
  note: z.string().optional(),
});

export type MapMarker = z.infer<typeof mapMarkerSchema>;

export const mapMarkerFileSchema = z.object({
  layer: z.enum(MAP_LAYER_IDS),
  markers: z.array(mapMarkerSchema),
});

export type MapMarkerFile = z.infer<typeof mapMarkerFileSchema>;
