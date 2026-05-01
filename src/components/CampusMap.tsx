import { useState, useCallback } from 'react';
import { MapPin, X, Navigation, Plus, Minus, Crosshair } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Location, MapCoordinates } from '@/types/location';
import { locations } from '@/data/locations';

interface CampusMapProps {
  onLocationSelect?: (location: Location, coordinates: MapCoordinates) => void;
  isEditing?: boolean;
}

// Default campus center coordinates - you can update this to your university's location
const DEFAULT_CENTER = {
  lat: -14.296185, //Mulungushi University Default center
  lng: 28.553279,
};

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export default function CampusMap({ onLocationSelect, isEditing = false }: CampusMapProps) {
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(16);
  const [selectedPin, setSelectedPin] = useState<Location | null>(null);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [clickedCoordinates, setClickedCoordinates] = useState<MapCoordinates | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // Get locations that have coordinates
  const pinnedLocations = locations.filter(loc => loc.coordinates);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 1, 21));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 1, 10));
  const handleRecenter = () => setMapCenter(DEFAULT_CENTER);

  const handleMapClick = useCallback((e: React.MouseEvent<HTMLIFrameElement>) => {
    if (isEditing) {
      // In editing mode, we show a dialog to select a location to pin
      setShowLocationPicker(true);
    }
  }, [isEditing]);

  const handlePinLocation = (location: Location) => {
    if (clickedCoordinates && onLocationSelect) {
      onLocationSelect(location, clickedCoordinates);
    }
    setShowLocationPicker(false);
    setClickedCoordinates(null);
  };

  // Generate Google Maps embed URL
  const mapUrl = `https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_API_KEY}&center=${mapCenter.lat},${mapCenter.lng}&zoom=${zoom}&maptype=satellite`;

  // Fallback to OpenStreetMap if no API key
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${mapCenter.lng - 0.01},${mapCenter.lat - 0.01},${mapCenter.lng + 0.01},${mapCenter.lat + 0.01}&layer=mapnik&marker=${mapCenter.lat},${mapCenter.lng}`;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="w-5 h-5 text-blue-600" />
            Campus Map
          </CardTitle>
          {isEditing && (
            <Badge className="bg-amber-500 text-white">
              Editing Mode - Click map to pin locations
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative">
          {/* Map Container */}
          <div className="relative h-[400px] md:h-[500px] w-full bg-gray-100 dark:bg-gray-800">
            <iframe
              src={GOOGLE_MAPS_API_KEY ? mapUrl : osmUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Campus Map"
              onClick={handleMapClick}
            />
            
            {/* Map Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <Button
                size="icon"
                variant="secondary"
                className="bg-white dark:bg-gray-800 shadow-lg hover:bg-gray-50"
                onClick={handleZoomIn}
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="bg-white dark:bg-gray-800 shadow-lg hover:bg-gray-50"
                onClick={handleZoomOut}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="bg-white dark:bg-gray-800 shadow-lg hover:bg-gray-50"
                onClick={handleRecenter}
              >
                <Crosshair className="w-4 h-4" />
              </Button>
            </div>

            {/* Pinned Locations Legend */}
            {pinnedLocations.length > 0 && (
              <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 max-w-[200px]">
                <h4 className="text-sm font-semibold mb-2 text-gray-800 dark:text-gray-100">
                  Pinned Locations
                </h4>
                <div className="space-y-1 max-h-[150px] overflow-y-auto">
                  {pinnedLocations.map(loc => (
                    <button
                      key={loc.id}
                      className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 w-full text-left"
                      onClick={() => {
                        if (loc.coordinates) {
                          setMapCenter(loc.coordinates);
                          setSelectedPin(loc);
                          setShowPinDialog(true);
                        }
                      }}
                    >
                      <MapPin className="w-3 h-3 text-red-500" />
                      <span className="truncate">{loc.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions for editing mode */}
            {isEditing && (
              <div className="absolute top-4 left-4 bg-blue-500 text-white rounded-lg shadow-lg p-3 max-w-[250px]">
                <p className="text-sm">
                  <strong>How to pin locations:</strong>
                </p>
                <ol className="text-xs mt-1 space-y-1 list-decimal list-inside">
                  <li>Navigate to the location on the map</li>
                  <li>Click the "Pin Location" button below</li>
                  <li>Select the location from the list</li>
                </ol>
              </div>
            )}
          </div>

          {/* Pin Location Button (Editing Mode) */}
          {isEditing && (
            <div className="p-4 border-t dark:border-gray-700">
              <Button
                className="w-full"
                onClick={() => {
                  setClickedCoordinates(mapCenter);
                  setShowLocationPicker(true);
                }}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Pin Location at Current Center
              </Button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Current coordinates: {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
              </p>
            </div>
          )}
        </div>
      </CardContent>

      {/* Location Picker Dialog */}
      <Dialog open={showLocationPicker} onOpenChange={setShowLocationPicker}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Select Location to Pin
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mt-4">
            {clickedCoordinates && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Pinning at: {clickedCoordinates.lat.toFixed(4)}, {clickedCoordinates.lng.toFixed(4)}
              </p>
            )}
            {locations.map(loc => (
              <button
                key={loc.id}
                className="w-full p-3 text-left rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => handlePinLocation(loc)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{loc.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{loc.category}</p>
                  </div>
                  {loc.coordinates && (
                    <Badge variant="outline" className="text-xs">
                      Already pinned
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Selected Pin Dialog */}
      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{selectedPin?.name}</DialogTitle>
          </DialogHeader>
          {selectedPin && (
            <div className="space-y-3">
              <img
                src={selectedPin.image}
                alt={selectedPin.name}
                className="w-full h-32 object-cover rounded-lg"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedPin.description}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <Navigation className="w-4 h-4 text-blue-600" />
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPin.coordinates?.lat},${selectedPin.coordinates?.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Get Directions
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
