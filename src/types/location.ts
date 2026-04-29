export type LocationCategory = 'academic' | 'residential' | 'dining' | 'recreation' | 'services';

export type HostelRegion = 'upschool' | 'downschool';

export interface MapCoordinates {
  lat: number;
  lng: number;
}

export interface Location {
  id: string;
  name: string;
  category: LocationCategory;
  description: string;
  image: string;
  hours: string;
  contact: string;
  tips: string[];
  hostelRegion?: HostelRegion;
  isHighRise?: boolean;
  floors?: number;
  coordinates?: MapCoordinates;
}
