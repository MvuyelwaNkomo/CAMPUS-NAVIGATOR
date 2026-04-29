import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { LocationCategory } from '@/types/location';
import { Badge } from '@/components/ui/badge';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: LocationCategory | 'all';
  onCategoryChange: (category: LocationCategory | 'all') => void;
}

const categories: { value: LocationCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'academic', label: 'Academic' },
  { value: 'residential', label: 'Residential' },
  { value: 'dining', label: 'Dining' },
  { value: 'recreation', label: 'Recreation' },
  { value: 'services', label: 'Services' }
];

export default function SearchBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange
}: SearchBarProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          type="text"
          placeholder="Search locations..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-12 text-base dark:bg-gray-700 dark:border-gray-600"
        />
      </div>
      
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Badge
            key={category.value}
            variant={selectedCategory === category.value ? 'default' : 'outline'}
            className={`cursor-pointer px-4 py-2 text-sm font-medium transition-all ${
              selectedCategory === category.value
                ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
                : 'hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-gray-700 dark:hover:border-blue-500'
            }`}
            onClick={() => onCategoryChange(category.value)}
          >
            {category.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}
