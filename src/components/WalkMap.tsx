import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import type { Walker } from "@/data/walkers";

export type LatLng = [number, number];

// Ruta simulada por Chamberí, Madrid (~20 puntos)
export const ROUTE: LatLng[] = [
  [40.4360, -3.7020],
  [40.4363, -3.7028],
  [40.4368, -3.7036],
  [40.4374, -3.7042],
  [40.4380, -3.7048],
  [40.4387, -3.7052],
  [40.4394, -3.7050],
  [40.4400, -3.7045],
  [40.4406, -3.7038],
  [40.4410, -3.7028],
  [40.4408, -3.7018],
  [40.4402, -3.7010],
  [40.4395, -3.7004],
  [40.4388, -3.7000],
  [40.4380, -3.6998],
  [40.4373, -3.7002],
  [40.4367, -3.7008],
  [40.4363, -3.7014],
  [40.4360, -3.7020],
];

const HOME: LatLng = ROUTE[0];

function FlyToProgress({ pos }: { pos: LatLng }) {
  const map = useMap();
  useEffect(() => {
    map.panTo(pos, { animate: true, duration: 0.6 });
  }, [pos, map]);
  return null;
}

type Props = {
  walker: Walker;
  progress: number; // 0..1
  showFullRoute?: boolean;
};

function makeWalkerIcon(photo: string) {
  return L.divIcon({
    className: "",
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    html: `<div style="width:44px;height:44px;border-radius:50%;border:3px solid #fff;box-shadow:0 4px 10px rgba(0,0,0,.25);background-image:url('${photo}');background-size:cover;background-position:center;"></div>`,
  });
}

const homeIcon = L.divIcon({
  className: "",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  html: `<div style="width:36px;height:36px;border-radius:50%;background:#2E7D5B;color:#fff;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid #fff;box-shadow:0 4px 10px rgba(0,0,0,.2);">🏠</div>`,
});

function interp(route: LatLng[], t: number): LatLng {
  if (t <= 0) return route[0];
  if (t >= 1) return route[route.length - 1];
  const segCount = route.length - 1;
  const f = t * segCount;
  const i = Math.floor(f);
  const r = f - i;
  const a = route[i];
  const b = route[i + 1];
  return [a[0] + (b[0] - a[0]) * r, a[1] + (b[1] - a[1]) * r];
}

export function WalkMap({ walker, progress, showFullRoute }: Props) {
  const pos = interp(ROUTE, progress);
  const polylineUpTo: LatLng[] = showFullRoute
    ? ROUTE
    : (() => {
        const segCount = ROUTE.length - 1;
        const f = Math.min(1, Math.max(0, progress)) * segCount;
        const i = Math.floor(f);
        return [...ROUTE.slice(0, i + 1), pos];
      })();

  return (
    <MapContainer
      center={HOME}
      zoom={16}
      scrollWheelZoom={false}
      zoomControl={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline positions={ROUTE} pathOptions={{ color: "#ECE3D2", weight: 6 }} />
      <Polyline positions={polylineUpTo} pathOptions={{ color: "#2E7D5B", weight: 6 }} />
      <Marker position={HOME} icon={homeIcon} />
      <Marker position={pos} icon={makeWalkerIcon(walker.foto)} />
      {!showFullRoute && <FlyToProgress pos={pos} />}
    </MapContainer>
  );
}
