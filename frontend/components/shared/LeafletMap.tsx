"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import { Badge } from "../ui/Badge";
import { CheckCircle, AlertTriangle, AlertCircle, Clock } from "lucide-react";

// Override Leaflet's default icon configuration to fix broken asset paths
const createPulsingIcon = (color: string) => {
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center w-6 h-6">
        <span class="absolute inline-flex w-full h-full rounded-full opacity-60 animate-ping" style="background-color: ${color};"></span>
        <span class="relative inline-flex rounded-full h-3.5 w-3.5 border border-white" style="background-color: ${color};"></span>
      </div>
    `,
    className: "custom-div-icon",
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  village: string;
  title: string;
  category: string;
  priorityScore: number;
  status: string;
}

interface LeafletMapProps {
  markers?: MapMarker[];
  center?: [number, number];
  zoom?: number;
}

const defaultMarkers: MapMarker[] = [
  {
    id: "1",
    lat: 18.1568,
    lng: 74.5768,
    village: "Baramati Center",
    title: "Primary Health Center Sanitation",
    category: "community",
    priorityScore: 8.8,
    status: "pending"
  },
  {
    id: "2",
    lat: 18.2831,
    lng: 74.3857,
    village: "Supe",
    title: "Main Road Asphalt Road Repair",
    category: "infrastructure",
    priorityScore: 7.5,
    status: "action_taken"
  },
  {
    id: "3",
    lat: 18.1065,
    lng: 74.5204,
    village: "Malegaon",
    title: "Potable Water Channel Blockage",
    category: "infrastructure",
    priorityScore: 9.2,
    status: "pending"
  },
  {
    id: "4",
    lat: 18.0267,
    lng: 74.2057,
    village: "Nira",
    title: "High School Computer Lab Funding",
    category: "policy",
    priorityScore: 5.4,
    status: "completed"
  },
  {
    id: "5",
    lat: 18.1638,
    lng: 74.3411,
    village: "Someshwar",
    title: "Streetlight Installation near Market",
    category: "infrastructure",
    priorityScore: 6.2,
    status: "pending"
  }
];

export default function LeafletMap({
  markers = defaultMarkers,
  center = [18.1568, 74.5000],
  zoom = 11
}: LeafletMapProps) {
  
  useEffect(() => {
    // Standard Leaflet initialization code, if any
  }, []);

  const getUrgencyColor = (score: number) => {
    if (score >= 8) return "#ef4444"; // red
    if (score >= 5) return "#f59e0b"; // yellow
    return "#3b82f6"; // blue
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-3 w-3 text-emerald-400 mr-1" />;
      case "action_taken":
        return <Clock className="h-3 w-3 text-amber-400 mr-1" />;
      default:
        return <AlertCircle className="h-3 w-3 text-rose-400 mr-1" />;
    }
  };

  return (
    <div className="w-full h-full relative" style={{ minHeight: "350px" }}>
      <MapContainer
        key={`${center[0]}-${center[1]}`}
        center={center}
        zoom={zoom}
        style={{ width: "100%", height: "100%", minHeight: "350px" }}
        zoomControl={true}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {markers.map((marker) => {
          const urgencyColor = getUrgencyColor(marker.priorityScore);
          const customIcon = createPulsingIcon(urgencyColor);

          return (
            <div key={marker.id}>
              {/* Pulse Marker */}
              <Marker position={[marker.lat, marker.lng]} icon={customIcon}>
                <Popup>
                  <div className="p-1 space-y-2 text-slate-100 max-w-[220px]">
                    <div className="flex items-center justify-between border-b border-white/5 pb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{marker.village}</span>
                      <span className="flex items-center text-[10px] font-semibold">
                        {getStatusIcon(marker.status)}
                        {marker.status.replace("_", " ")}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white leading-snug">{marker.title}</h4>
                    
                    <div className="flex items-center justify-between pt-1 text-[10px] font-semibold text-slate-300">
                      <span className="bg-slate-800 px-1.5 py-0.5 rounded uppercase tracking-wider">{marker.category}</span>
                      <span style={{ color: urgencyColor }}>Urgency: {marker.priorityScore}/10</span>
                    </div>
                  </div>
                </Popup>
              </Marker>

              {/* Urgency Heat Circle */}
              <Circle
                center={[marker.lat, marker.lng]}
                radius={800}
                pathOptions={{
                  fillColor: urgencyColor,
                  fillOpacity: 0.1,
                  color: urgencyColor,
                  weight: 1,
                  opacity: 0.3
                }}
              />
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
}
