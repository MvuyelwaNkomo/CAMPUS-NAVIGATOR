import { Clock, Phone, Mail, Lightbulb, X, Building2, MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Location } from '@/types/location';

interface LocationDialogProps {
  location: Location | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categoryColors: Record<string, string> = {
  academic: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
  residential: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
  dining: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
  recreation: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
  services: 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700'
};

export default function LocationDialog({ location, open, onOpenChange }: LocationDialogProps) {
  if (!location) return null;

  const [email, phone] = location.contact.split('|').map(s => s.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-gray-800">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <div className="relative h-64 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-lg">
          <img
            src={location.image}
            alt={location.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <Badge className={`${categoryColors[location.category]} capitalize font-semibold text-sm px-3 py-1`}>
              {location.category}
            </Badge>
            {location.hostelRegion && (
              <Badge className={`${location.hostelRegion === 'upschool' ? 'bg-blue-500' : 'bg-green-500'} text-white capitalize font-semibold text-sm px-3 py-1`}>
                {location.hostelRegion}
              </Badge>
            )}
          </div>
          {location.isHighRise && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-amber-500 text-white font-semibold text-sm px-3 py-1 flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                High-Rise • {location.floors} Floors
              </Badge>
            </div>
          )}
        </div>

        <DialogHeader>
          <DialogTitle className="text-3xl font-bold dark:text-gray-100">{location.name}</DialogTitle>
          <DialogDescription className="text-base pt-2 dark:text-gray-400">
            {location.description}
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-4" />

        <div className="space-y-6">
          {location.hostelRegion && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2 dark:text-gray-100">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Location Details
              </h3>
              <div className="pl-7 space-y-1">
                <p className="text-muted-foreground">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Region:</span>{' '}
                  <span className="capitalize">{location.hostelRegion}</span>
                </p>
                {location.isHighRise && (
                  <p className="text-muted-foreground">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Building Type:</span>{' '}
                    High-Rise ({location.floors} Floors)
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2 dark:text-gray-100">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Operating Hours
            </h3>
            <p className="text-muted-foreground pl-7">{location.hours}</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2 dark:text-gray-100">
              <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Contact Information
            </h3>
            <div className="pl-7 space-y-2">
              {email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${email}`} className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline">
                    {email}
                  </a>
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${phone}`} className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline">
                    {phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2 dark:text-gray-100">
              <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Tips for First-Years
            </h3>
            <ul className="pl-7 space-y-2">
              {location.tips.map((tip, index) => (
                <li key={index} className="text-muted-foreground flex gap-2">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
