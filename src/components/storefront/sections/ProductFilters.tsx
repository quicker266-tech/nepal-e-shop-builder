/**
 * ProductFilters Section Component
 * Displays filtering options for product listings (Step 2.2)
 */

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, Filter, X } from 'lucide-react';

interface ProductFiltersConfig {
  showPriceFilter?: boolean;
  showCategoryFilter?: boolean;
  showAttributeFilters?: boolean;
  layout?: 'sidebar' | 'horizontal' | 'drawer';
  collapsible?: boolean;
}

interface ProductFiltersProps {
  config: ProductFiltersConfig;
  categories?: Array<{ id: string; name: string; count?: number }>;
  priceRange?: { min: number; max: number };
  onFilterChange?: (filters: Record<string, unknown>) => void;
}

export function ProductFilters({
  config,
  categories = [],
  priceRange = { min: 0, max: 1000 },
  onFilterChange,
}: ProductFiltersProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [price, setPrice] = useState<[number, number]>([priceRange.min, priceRange.max]);
  const [openSections, setOpenSections] = useState<string[]>(['price', 'categories']);

  const {
    showPriceFilter = true,
    showCategoryFilter = true,
    collapsible = true,
  } = config;

  const toggleSection = (section: string) => {
    setOpenSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const updated = checked
      ? [...selectedCategories, categoryId]
      : selectedCategories.filter(id => id !== categoryId);
    setSelectedCategories(updated);
    onFilterChange?.({ categories: updated, priceRange: price });
  };

  const handlePriceChange = (value: number[]) => {
    setPrice([value[0], value[1]]);
    onFilterChange?.({ categories: selectedCategories, priceRange: [value[0], value[1]] });
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPrice([priceRange.min, priceRange.max]);
    onFilterChange?.({ categories: [], priceRange: [priceRange.min, priceRange.max] });
  };

  const hasActiveFilters = selectedCategories.length > 0 || price[0] !== priceRange.min || price[1] !== priceRange.max;

  // Placeholder categories if none provided
  const displayCategories = categories.length > 0 ? categories : [
    { id: '1', name: 'Electronics', count: 24 },
    { id: '2', name: 'Clothing', count: 56 },
    { id: '3', name: 'Home & Garden', count: 32 },
    { id: '4', name: 'Sports', count: 18 },
  ];

  return (
    <div className="space-y-4">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <span className="font-medium">Filters</span>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-sm">
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Price Filter */}
      {showPriceFilter && (
        <Collapsible
          open={!collapsible || openSections.includes('price')}
          onOpenChange={() => collapsible && toggleSection('price')}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
            Price Range
            {collapsible && (
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  openSections.includes('price') ? 'rotate-180' : ''
                }`}
              />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 pb-4">
            <div className="px-1">
              <Slider
                value={price}
                onValueChange={handlePriceChange}
                min={priceRange.min}
                max={priceRange.max}
                step={10}
                className="mb-2"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>${price[0]}</span>
                <span>${price[1]}</span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Category Filter */}
      {showCategoryFilter && (
        <Collapsible
          open={!collapsible || openSections.includes('categories')}
          onOpenChange={() => collapsible && toggleSection('categories')}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium border-t pt-4">
            Categories
            {collapsible && (
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  openSections.includes('categories') ? 'rotate-180' : ''
                }`}
              />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 space-y-2">
            {displayCategories.map(category => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`cat-${category.id}`}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={(checked) => handleCategoryChange(category.id, !!checked)}
                />
                <Label
                  htmlFor={`cat-${category.id}`}
                  className="text-sm flex-1 cursor-pointer flex justify-between"
                >
                  <span>{category.name}</span>
                  {category.count !== undefined && (
                    <span className="text-muted-foreground">({category.count})</span>
                  )}
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
