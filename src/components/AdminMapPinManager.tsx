// client/src/components/AdminMapPinManager.tsx
// Admin-only map component for creating, updating, and deleting location pins

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, CheckCircle, XCircle } from 'lucide-react';
import { adminGetPins, adminCreatePin, adminUpdatePin, adminDeletePin } from '../api/admin';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon paths in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

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
    html: `<div style="width:28px;height:28px;background:${color};border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`,
    iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -30]
  });
}

function MapClickHandler({ isEditing, onMapClick }: { isEditing: boolean; onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click(e) { if (isEditing) onMapClick(e.latlng.lat, e.latlng.lng); } });
  return null;
}

export default function AdminMapPinManager() {
  const [pins,         setPins]         = useState<any[]>([]);
  const [isEditing,    setIsEditing]    = useState(false);
  const [pendingCoords,setPendingCoords]= useState<{ lat: number; lng: number } | null>(null);
  const [showPicker,   setShowPicker]   = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [message,      setMessage]      = useState('');

  const MULUNGUSHI = { lat: -14.4469, lng: 28.4527 };

  useEffect(() => { loadPins(); }, []);

  async function loadPins() {
    setLoading(true);
    try { setPins(await adminGetPins()); }
    finally { setLoading(false); }
  }

  function handleMapClick(lat: number, lng: number) {
    setPendingCoords({ lat, lng });
    setShowPicker(true);
  }

  async function handlePinSelect(location: any) {
    if (!pendingCoords) return;
    try {
      if (location.latitude !== null) {
        await adminUpdatePin(location.id, pendingCoords);
        setMessage(`Updated pin for ${location.name}`);
      } else {
        await adminCreatePin({ location_id: location.id, ...pendingCoords });
        setMessage(`Pinned ${location.name} successfully`);
      }
      setShowPicker(false);
      setPendingCoords(null);
      loadPins();
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(`Error: ${err.response?.data?.error || 'Unknown error'}`);
    }
  }

  async function handleDeletePin(locationId: string, name: string) {
    if (!confirm(`Remove pin for ${name}?`)) return;
    await adminDeletePin(locationId);
    loadPins();
    setMessage(`Removed pin for ${name}`);
    setTimeout(() => setMessage(''), 3000);
  }

  const pinned   = pins.filter(p => p.latitude !== null);
  const unpinned = pins.filter(p => p.latitude === null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Map Pin Manager</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isEditing
              ? 'bg-amber-500 text-white hover:bg-amber-600'
              : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-amber-400'
          }`}
        >
          <MapPin className="w-4 h-4" />
          {isEditing ? 'Exit Pin Mode' : 'Enable Pin Mode'}
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${message.startsWith('Error') ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'}`}>
          {message.startsWith('Error') ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {message}
        </div>
      )}

      {isEditing && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-sm text-blue-800 dark:text-blue-300">
          <strong>Pin mode active</strong> — Click anywhere on the map to drop a pin, then select which location it represents.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map */}
        <div className="lg:col-span-3">
          <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700" style={{ height: 520 }}>
            <MapContainer
              center={[MULUNGUSHI.lat, MULUNGUSHI.lng]}
              zoom={17}
              style={{ height: '100%', width: '100%' }}
              className={isEditing ? 'cursor-crosshair' : ''}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler isEditing={isEditing} onMapClick={handleMapClick} />
              {pinned.map(loc => (
                <Marker
                  key={loc.id}
                  position={[loc.latitude, loc.longitude]}
                  icon={createIcon(categoryColors[loc.category] || '#6b7280')}
                >
                  <Popup>
                    <div className="text-sm">
                      <strong>{loc.name}</strong>
                      <br />
                      <span className="text-gray-500 capitalize">{loc.category}</span>
                      <br />
                      <span className="text-xs text-gray-400">
                        {parseFloat(loc.latitude).toFixed(5)}, {parseFloat(loc.longitude).toFixed(5)}
                      </span>
                      <br />
                      <button
                        onClick={() => handleDeletePin(loc.id, loc.name)}
                        className="mt-2 text-red-500 hover:text-red-700 text-xs underline"
                      >
                        Remove pin
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Unpinned locations */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
              Unpinned ({unpinned.length})
            </h3>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {unpinned.length === 0
                ? <p className="text-xs text-gray-400">All locations are pinned! 🎉</p>
                : unpinned.map(loc => (
                  <div key={loc.id} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5 py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                    <span className="truncate">{loc.name}</span>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Pinned locations */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              Pinned ({pinned.length})
            </h3>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {pinned.map(loc => (
                <div key={loc.id} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                  <span className="truncate">{loc.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Location picker dialog */}
      {showPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                Which location is at this spot?
              </h3>
              {pendingCoords && (
                <p className="text-xs text-gray-400 mt-1">
                  Lat: {pendingCoords.lat.toFixed(6)}, Lng: {pendingCoords.lng.toFixed(6)}
                </p>
              )}
            </div>
            <div className="overflow-y-auto flex-1 p-3 space-y-1">
              {pins.map(loc => (
                <button
                  key={loc.id}
                  onClick={() => handlePinSelect(loc)}
                  className="w-full p-3 text-left rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{loc.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{loc.category}</p>
                    </div>
                    {loc.latitude !== null && (
                      <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
                        Move pin
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => { setShowPicker(false); setPendingCoords(null); }}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
