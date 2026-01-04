/**
 * ProductSort Section Component
 * Displays sort options for product listings (Step 2.2)
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowUpDown } from 'lucide-react';

interface ProductSortConfig {
  options?: Array<'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest' | 'popular'>;
  defaultSort?: string;
}

interface ProductSortProps {
  config: ProductSortConfig;
  value?: string;
  onChange?: (value: string) => void;
  totalProducts?: number;
}

const SORT_LABELS: Record<string, string> = {
  price_asc: 'Price: Low to High',
  price_desc: 'Price: High to Low',
  name_asc: 'Name: A to Z',
  name_desc: 'Name: Z to A',
  newest: 'Newest First',
  popular: 'Most Popular',
};

export function ProductSort({
  config,
  value,
  onChange,
  totalProducts,
}: ProductSortProps) {
  const {
    options = ['newest', 'price_asc', 'price_desc', 'popular'],
    defaultSort = 'newest',
  } = config;

  const currentValue = value || defaultSort;

  return (
    <div className="flex items-center justify-between py-4 border-b">
      {/* Product Count */}
      {totalProducts !== undefined && (
        <p className="text-sm text-muted-foreground">
          Showing {totalProducts} product{totalProducts !== 1 ? 's' : ''}
        </p>
      )}

      {/* Sort Dropdown */}
      <div className="flex items-center gap-2">
        <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground hidden sm:inline">Sort by:</span>
        <Select value={currentValue} onValueChange={onChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {options.map(option => (
              <SelectItem key={option} value={option}>
                {SORT_LABELS[option] || option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
