import { MapPin, Clock, Phone, Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Location } from '@/types/location';

interface LocationCardProps {
  location: Location;
  onClick: () => void;
}

const categoryColors: Record<string, string> = {
  academic: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
  residential: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
  dining: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
  recreation: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
  services: 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700'
};

const regionColors: Record<string, string> = {
  upschool: 'bg-blue-500 text-white',
  downschool: 'bg-green-500 text-white'
};

export default function LocationCard({ location, onClick }: LocationCardProps) {
  return (
    <Card 
      className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-blue-300 dark:hover:border-blue-600 dark:bg-gray-800"
      onClick={onClick}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={location.image}
          alt={location.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
          <Badge className={`${categoryColors[location.category]} capitalize font-semibold`}>
            {location.category}
          </Badge>
          {location.hostelRegion && (
            <Badge className={`${regionColors[location.hostelRegion]} capitalize font-semibold text-xs`}>
              {location.hostelRegion}
            </Badge>
          )}
        </div>
        {location.isHighRise && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-amber-500 text-white font-semibold text-xs flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              High-Rise • {location.floors} Floors
            </Badge>
          </div>
        )}
      </div>
      
      <CardHeader className="pb-3">
        <CardTitle className="text-xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {location.name}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-base dark:text-gray-400">
          {location.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-2">
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-1">{location.hours}</span>
        </div>
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-1">{location.contact.split('|')[0].trim()}</span>
        </div>
        <div className="pt-2">
          <span className="text-blue-600 dark:text-blue-400 font-medium text-sm group-hover:underline">
            View Details →
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
