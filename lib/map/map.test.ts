import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { normalizedToLatLng } from "@/lib/map/coords";
import { MAP_LAYER_IDS, mapMarkerFileSchema } from "@/lib/map/types";

describe("map marker datasets", () => {
  for (const layer of MAP_LAYER_IDS) {
    const file =
      layer === "tower"
        ? "towers.json"
        : layer === "pal-spawn"
          ? "pal-spawns.json"
          : layer === "effigy"
            ? "effigies.json"
            : layer === "note"
              ? "notes.json"
              : layer === "fast-travel"
                ? "fast-travel.json"
                : "alphas.json";

    it(`validates ${file}`, () => {
      const raw = JSON.parse(
        readFileSync(path.join(process.cwd(), "data", "map", file), "utf8"),
      ) as unknown;
      const parsed = mapMarkerFileSchema.parse(raw);
      expect(parsed.layer).toBe(layer);
      expect(parsed.markers.length).toBeGreaterThan(0);
      for (const m of parsed.markers) {
        expect(m.layer).toBe(layer);
        expect(m.nx).toBeGreaterThanOrEqual(0);
        expect(m.nx).toBeLessThanOrEqual(1);
      }
    });
  }
});

describe("map coords", () => {
  it("maps normalized center into image space", () => {
    const [lat, lng] = normalizedToLatLng(0.5, 0.5);
    expect(lng).toBe(850);
    expect(lat).toBe(583);
  });
});
