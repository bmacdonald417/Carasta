"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { AuctionMapPreview } from "./AuctionsMapView";

type AuctionForMap = {
  id: string;
  title: string;
  year: number;
  make: string;
  model: string;
  status: string;
  reservePriceCents: number | null;
  latitude: number;
  longitude: number;
  images: { url: string }[];
  seller: { handle: string } | null;
  highBidCents: number;
  bidCount: number;
};

type Props = {
  auctions: AuctionForMap[];
  requireAuth: boolean;
};

const US_CENTER: [number, number] = [39.8283, -98.5795];
const DEFAULT_ZOOM = 4;

function FitBounds({ auctions }: { auctions: AuctionForMap[] }) {
  const map = useMap();
  useEffect(() => {
    if (auctions.length === 0) return;
    if (auctions.length === 1) {
      map.setView([auctions[0].latitude, auctions[0].longitude], 10);
    } else {
      const bounds = L.latLngBounds(
        auctions.map((a) => [a.latitude, a.longitude] as [number, number])
      );
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }
  }, [map, auctions]);
  return null;
}

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export function AuctionsMapInner({ auctions, requireAuth }: Props) {
  return (
    <MapContainer
      center={US_CENTER}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom
      className="h-full w-full"
      style={{ background: "#1a1a1a" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <FitBounds auctions={auctions} />
      {auctions.map((a) => (
        <Marker key={a.id} position={[a.latitude, a.longitude]}>
          <Popup maxWidth={280}>
            <AuctionMapPreview
              auction={a}
              highBidCents={a.highBidCents}
              bidCount={a.bidCount}
              requireAuth={requireAuth}
            />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
