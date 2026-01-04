/**
 * RecentlyViewed Section Component
 * Displays products the customer has recently viewed (Step 2.2)
 */

import { Clock } from 'lucide-react';

interface RecentlyViewedConfig {
  title?: string;
  productCount?: number;
  columns?: 2 | 3 | 4 | 5;
  showPrice?: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  compare_at_price?: number | null;
  images?: { url: string }[];
  slug: string;
}

interface RecentlyViewedProps {
  config: RecentlyViewedConfig;
  products?: Product[];
  onProductClick?: (productSlug: string) => void;
}

export function RecentlyViewed({
  config,
  products = [],
  onProductClick,
}: RecentlyViewedProps) {
  const {
    title = 'Recently Viewed',
    productCount = 4,
    columns = 4,
    showPrice = true,
  } = config;

  // Placeholder products if none provided
  const displayProducts: Product[] = products.length > 0 ? products.slice(0, productCount) : [
    { id: '1', name: 'Classic White Sneakers', price: 89.99, slug: 'classic-white-sneakers', images: [] },
    { id: '2', name: 'Leather Backpack', price: 149.99, compare_at_price: 199.99, slug: 'leather-backpack', images: [] },
    { id: '3', name: 'Wireless Headphones', price: 199.99, slug: 'wireless-headphones', images: [] },
    { id: '4', name: 'Minimalist Watch', price: 299.99, slug: 'minimalist-watch', images: [] },
  ].slice(0, productCount);

  if (displayProducts.length === 0) {
    return null;
  }

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  };

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-xl md:text-2xl font-semibold">{title}</h2>
        </div>

        {/* Products Grid */}
        <div className={`grid ${gridCols[columns]} gap-4 md:gap-6`}>
          {displayProducts.map(product => {
            const imageUrl = product.images?.[0]?.url || '/placeholder.svg';
            const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;

            return (
              <div
                key={product.id}
                className="group cursor-pointer"
                onClick={() => onProductClick?.(product.slug)}
              >
                {/* Product Image */}
                <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-3">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Product Info */}
                <h3 className="font-medium text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>

                {showPrice && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-semibold">${product.price.toFixed(2)}</span>
                    {hasDiscount && (
                      <span className="text-sm text-muted-foreground line-through">
                        ${product.compare_at_price!.toFixed(2)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
