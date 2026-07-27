"use client";

import dynamic from "next/dynamic";
import type { MapMarker } from "@/lib/map/types";

const MapClient = dynamic(
  () => import("@/components/map/MapClient").then((m) => m.MapClient),
  {
    ssr: false,
    loading: () => (
      <div className="map-loading" role="status">
        Loading map…
      </div>
    ),
  },
);

export function MapClientLoader({ markers }: { markers: MapMarker[] }) {
  return <MapClient markers={markers} />;
}
