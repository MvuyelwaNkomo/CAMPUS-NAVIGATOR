// client/src/components/HostelRegionSelector.tsx

import { Building2, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { HostelRegion } from '@/types/location';

interface HostelRegionSelectorProps {
  selectedRegion: HostelRegion | null;
  onRegionSelect: (region: HostelRegion | null) => void;
}

export default function HostelRegionSelector({
  selectedRegion,
  onRegionSelect
}: HostelRegionSelectorProps) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
        <Building2 className="w-5 h-5 text-blue-600" />
        Select Hostel Region
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Upschool */}
        <Card
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
            selectedRegion === 'upschool'
              ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30'
              : 'bg-white dark:bg-gray-800'
          }`}
          onClick={() => onRegionSelect(selectedRegion === 'upschool' ? null : 'upschool')}
        >
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
              selectedRegion === 'upschool'
                ? 'bg-blue-500 text-white'
                : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
            }`}>
              <ArrowUp className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-100">Upschool</h4>
            {/* Fixed: 7 hostels (Kariba, Tanganyika, Bangweulu, Mweru, Kafue, Lusemfwa, Chambeshi) — 4 High-Rise */}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              7 Hostels • 4 High-Rise
            </p>
          </CardContent>
        </Card>

        {/* Downschool */}
        <Card
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
            selectedRegion === 'downschool'
              ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/30'
              : 'bg-white dark:bg-gray-800'
          }`}
          onClick={() => onRegionSelect(selectedRegion === 'downschool' ? null : 'downschool')}
        >
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
              selectedRegion === 'downschool'
                ? 'bg-green-500 text-white'
                : 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
            }`}>
              <ArrowDown className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-100">Downschool</h4>
            {/* Fixed: 5 hostels (Zambezi, Luangwa, Kalungwishi, Luapula, Mulungushi) — all single-storey */}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              5 Hostels • Standard
            </p>
          </CardContent>
        </Card>
      </div>

      {selectedRegion && (
        <button
          onClick={() => onRegionSelect(null)}
          className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← Show all hostels
        </button>
      )}
    </div>
  );
}
