import { useState, useMemo } from 'react';
import Header from './Header';
import SearchBar from './SearchBar';
import LocationCard from './LocationCard';
import LocationDialog from './LocationDialog';
import HostelRegionSelector from './HostelRegionSelector';
import CampusMap from './CampusMap';
import { locations } from '@/data/locations';
import { Location, LocationCategory, HostelRegion, MapCoordinates } from '@/types/location';

function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<LocationCategory | 'all'>('all');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedHostelRegion, setSelectedHostelRegion] = useState<HostelRegion | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [isMapEditing, setIsMapEditing] = useState(false);

  const filteredLocations = useMemo(() => {
    return locations.filter((location) => {
      const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           location.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || location.category === selectedCategory;
      
      // If residential category is selected and a hostel region is selected, filter by region
      const matchesHostelRegion = 
        selectedCategory !== 'residential' || 
        !selectedHostelRegion || 
        location.hostelRegion === selectedHostelRegion;
      
      return matchesSearch && matchesCategory && matchesHostelRegion;
    });
  }, [searchQuery, selectedCategory, selectedHostelRegion]);

  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location);
    setDialogOpen(true);
  };

  const handleLocationPin = (location: Location, coordinates: MapCoordinates) => {
    // This would typically update the location's coordinates in a database
    console.log(`Pinning ${location.name} at coordinates:`, coordinates);
    // For now, we'll just log it - in a real app you'd save this to your backend
    alert(`Location "${location.name}" pinned at:\nLat: ${coordinates.lat}\nLng: ${coordinates.lng}\n\nNote: To save this permanently, you'll need to update the locations.ts file with these coordinates.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Map Toggle Buttons */}
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
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
                <line x1="9" y1="3" x2="9" y2="18"></line>
                <line x1="15" y1="6" x2="15" y2="21"></line>
              </svg>
              {showMap ? 'Hide Map' : 'Show Campus Map'}
            </button>
            {showMap && (
              <button
                onClick={() => setIsMapEditing(!isMapEditing)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isMapEditing 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-amber-300'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                {isMapEditing ? 'Done Editing' : 'Pin Locations'}
              </button>
            )}
          </div>

          {/* Campus Map */}
          {showMap && (
            <div className="mb-6">
              <CampusMap 
                isEditing={isMapEditing}
                onLocationSelect={handleLocationPin}
              />
            </div>
          )}

          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={(category) => {
              setSelectedCategory(category);
              // Reset hostel region when changing category
              if (category !== 'residential') {
                setSelectedHostelRegion(null);
              }
            }}
          />

          {selectedCategory === 'residential' && (
            <HostelRegionSelector
              selectedRegion={selectedHostelRegion}
              onRegionSelect={setSelectedHostelRegion}
            />
          )}

          {filteredLocations.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 max-w-md mx-auto">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">No Results Found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLocations.map((location) => (
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
      />
    </div>
  );
}

export default Home;
