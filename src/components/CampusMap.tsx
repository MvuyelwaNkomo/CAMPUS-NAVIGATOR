// client/src/components/CampusMap.tsx
// Student-facing read-only Leaflet map
// Pins are loaded from the API (set by admins via AdminMapPinManager)

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Location, MapCoordinates } from '@/types/location';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's broken default icon paths when bundled with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Category-coloured teardrop markers
const categoryColors: Record<string, string> = {
  academic:    '#2563eb',
  residential: '#7c3aed',
  dining:      '#ea580c',
  recreation:  '#16a34a',
  services:    '#db2777',
};

function createIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 28px; height: 28px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
    "></div>`,
    iconSize:    [28, 28],
    iconAnchor:  [14, 28],
    popupAnchor: [0, -30],
  });
}

// Mulungushi University, Kabwe — correct coordinates
const MU_CENTER: MapCoordinates = {
  lat: -14.297214710380569,
  lng: 28.56097268039799,
};

interface CampusMapProps {
  onLocationSelect?: (location: Location, coordinates: MapCoordinates) => void;
  isEditing?: boolean;
}

export default function CampusMap({ isEditing = false }: CampusMapProps) {
  const [pinnedLocations, setPinnedLocations] = useState<Location[]>([]);
  const [selectedPin,     setSelectedPin]     = useState<Location | null>(null);
  const [showDialog,      setShowDialog]      = useState(false);

  // Load pinned locations from API on mount
  useEffect(() => {
    async function loadPins() {
      try {
        const token = (window as any).__campusNavToken;
        const res   = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/locations`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) return;
        const data = await res.json();
        // Only show locations that have been pinned (have coordinates)
        const pinned = data.locations.filter(
          (l: any) => l.latitude !== null && l.longitude !== null
        );
        setPinnedLocations(pinned);
      } catch {
        // Fail silently — map still renders, just without markers
      }
    }
    loadPins();
  }, []);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="w-5 h-5 text-blue-600" />
          Campus Map
          {isEditing && (
            <span className="ml-2 text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-normal">
              Admin: use Map Pin Manager in admin panel to pin locations
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative h-[400px] md:h-[500px] w-full">
          <MapContainer
            center={[MU_CENTER.lat, MU_CENTER.lng]}
            zoom={17}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {pinnedLocations.map((loc: any) => (
              <Marker
                key={loc.id}
                position={[loc.latitude, loc.longitude]}
                icon={createIcon(categoryColors[loc.category] || '#6b7280')}
                eventHandlers={{
                  click: () => {
                    setSelectedPin(loc);
                    setShowDialog(true);
                  }
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>{loc.name}</strong><br />
                    <span className="text-gray-500 capitalize">{loc.category}</span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {pinnedLocations.length === 0 && (
            <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 text-sm text-gray-500 dark:text-gray-400 max-w-[220px]">
              No locations pinned yet. An admin can add pins via the Admin Panel.
            </div>
          )}
        </div>
      </CardContent>

      {/* Location detail popup */}
      {showDialog && selectedPin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" onClick={() => setShowDialog(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
            <img
              src={(selectedPin as any).image_url || (selectedPin as any).image}
              alt={selectedPin.name}
              className="w-full h-36 object-cover rounded-xl mb-4"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{selectedPin.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize mb-3">{selectedPin.category}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{selectedPin.description}</p>

            {(selectedPin as any).latitude && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${(selectedPin as any).latitude},${(selectedPin as any).longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4"
              >
                <Navigation className="w-4 h-4" />
                Get Directions in Google Maps
              </a>
            )}

            <button
              onClick={() => setShowDialog(false)}
              className="w-full py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
