import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  mapMarkerFileSchema,
  type MapLayerId,
  type MapMarker,
} from "@/lib/map/types";

const LAYER_FILES: Record<MapLayerId, string> = {
  "fast-travel": "fast-travel.json",
  tower: "towers.json",
  alpha: "alphas.json",
  "pal-spawn": "pal-spawns.json",
  effigy: "effigies.json",
  note: "notes.json",
};

function readLayer(layer: MapLayerId): MapMarker[] {
  const file = path.join(process.cwd(), "data", "map", LAYER_FILES[layer]);
  const raw = JSON.parse(readFileSync(file, "utf8")) as unknown;
  const parsed = mapMarkerFileSchema.parse(raw);
  return parsed.markers.filter((m) => m.layer === layer);
}

let cache: MapMarker[] | null = null;

/** All curated map markers (validated). */
export function getMapMarkers(): MapMarker[] {
  if (cache) return cache;
  cache = (Object.keys(LAYER_FILES) as MapLayerId[]).flatMap(readLayer);
  return cache;
}

export function getMarkersByLayer(layer: MapLayerId): MapMarker[] {
  return getMapMarkers().filter((m) => m.layer === layer);
}

export function getMarkersForPal(slug: string): MapMarker[] {
  return getMapMarkers().filter((m) => m.palSlug === slug);
}

export function hasMapMarkersForPal(slug: string): boolean {
  return getMarkersForPal(slug).length > 0;
}
