// client/src/components/home.tsx
// Updated to fetch from API and support Show on Map from LocationDialog

import { useState, useEffect, useCallback } from 'react';
import Header from './Header';
import SearchBar from './SearchBar';
import LocationCard from './LocationCard';
import LocationDialog from './LocationDialog';
import HostelRegionSelector from './HostelRegionSelector';
import CampusMap from './CampusMap';
import { fetchLocations } from '@/api/locations';
import { Location, LocationCategory, HostelRegion, MapCoordinates } from '@/types/location';

function Home() {
  const [locations,            setLocations]            = useState<Location[]>([]);
  const [loading,              setLoading]              = useState(true);
  const [error,                setError]                = useState('');
  const [searchQuery,          setSearchQuery]          = useState('');
  const [selectedCategory,     setSelectedCategory]     = useState<LocationCategory | 'all'>('all');
  const [selectedLocation,     setSelectedLocation]     = useState<Location | null>(null);
  const [dialogOpen,           setDialogOpen]           = useState(false);
  const [selectedHostelRegion, setSelectedHostelRegion] = useState<HostelRegion | null>(null);
  const [showMap,              setShowMap]              = useState(false);
  const [focusLocation,        setFocusLocation]        = useState<any | null>(null);

  // Fetch locations from API
  const loadLocations = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchLocations({
        search:        searchQuery         || undefined,
        category:      selectedCategory   !== 'all' ? selectedCategory : undefined,
        hostel_region: selectedHostelRegion || undefined,
      });
      setLocations(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load locations. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedHostelRegion]);

  // Debounce search — wait 300ms after typing
  useEffect(() => {
    const timer = setTimeout(loadLocations, 300);
    return () => clearTimeout(timer);
  }, [loadLocations]);

  function handleLocationClick(location: Location) {
    setSelectedLocation(location);
    setDialogOpen(true);
  }

  // Called when user clicks "Show on Map" in the dialog
  function handleShowOnMap(location: Location) {
    setDialogOpen(false);
    setShowMap(true);       // open the map
    setFocusLocation(location); // pan map to this location
    // Scroll to map
    setTimeout(() => {
      document.getElementById('campus-map-section')?.scrollIntoView({
        behavior: 'smooth', block: 'start'
      });
    }, 100);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Map Toggle */}
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={() => setShowMap(!showMap)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                showMap
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
                <line x1="9" y1="3" x2="9" y2="18"/>
                <line x1="15" y1="6" x2="15" y2="21"/>
              </svg>
              {showMap ? 'Hide Map' : 'Show Campus Map'}
            </button>
          </div>

          {/* Campus Map */}
          {showMap && (
            <div id="campus-map-section" className="mb-6">
              <CampusMap
                isEditing={false}
                focusLocation={focusLocation}
              />
            </div>
          )}

          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={(category) => {
              setSelectedCategory(category);
              if (category !== 'residential') setSelectedHostelRegion(null);
            }}
          />

          {selectedCategory === 'residential' && (
            <HostelRegionSelector
              selectedRegion={selectedHostelRegion}
              onRegionSelect={setSelectedHostelRegion}
            />
          )}

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="text-center py-10">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 max-w-md mx-auto">
                <div className="text-5xl mb-3">⚠️</div>
                <p className="text-gray-600 dark:text-gray-400">{error}</p>
                <button
                  onClick={loadLocations}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && locations.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 max-w-md mx-auto">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                  No Results Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
              </div>
            </div>
          )}

          {/* Location grid */}
          {!loading && !error && locations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {locations.map((location) => (
                <LocationCard
                  key={location.id}
                  location={location}
                  onClick={() => handleLocationClick(location)}
                />
              ))}
            </div>
          )}

        </div>
      </main>

      <LocationDialog
        location={selectedLocation}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onShowOnMap={handleShowOnMap}
      />
    </div>
  );
}

export default Home;
