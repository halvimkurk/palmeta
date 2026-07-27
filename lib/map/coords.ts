/**
 * Map image + normalized coordinate helpers.
 *
 * Markers use nx/ny in 0–1 over `public/map/world.webp` (Palpagos overview).
 * (0,0) = top-left of the image; y grows downward.
 */

export const MAP_IMAGE_SRC = "/map/world.webp";

/** Pixel size of world.webp */
export const MAP_WIDTH = 1700;
export const MAP_HEIGHT = 1166;

/** Leaflet CRS.Simple bounds: [[south, west], [north, east]] with y-down image. */
export function mapImageBounds(): [[number, number], [number, number]] {
  return [
    [MAP_HEIGHT, 0],
    [0, MAP_WIDTH],
  ];
}

/** Convert normalized map coords to Leaflet LatLngExpression [lat, lng] = [y, x]. */
export function normalizedToLatLng(nx: number, ny: number): [number, number] {
  return [ny * MAP_HEIGHT, nx * MAP_WIDTH];
}

export function latLngToNormalized(lat: number, lng: number): { nx: number; ny: number } {
  return {
    nx: Math.min(1, Math.max(0, lng / MAP_WIDTH)),
    ny: Math.min(1, Math.max(0, lat / MAP_HEIGHT)),
  };
}
