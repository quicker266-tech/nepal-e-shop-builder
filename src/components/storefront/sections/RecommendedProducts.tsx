/**
 * RecommendedProducts Section Component
 * Displays product recommendations based on browsing behavior (Step 2.2)
 */

import { Sparkles, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecommendedProductsConfig {
  title?: string;
  subtitle?: string;
  productCount?: number;
  columns?: 2 | 3 | 4 | 5;
  showPrice?: boolean;
  showAddToCart?: boolean;
  algorithm?: 'similar' | 'bestsellers' | 'random';
}

interface Product {
  id: string;
  name: string;
  price: number;
  compare_at_price?: number | null;
  images?: { url: string }[];
  slug: string;
}

interface RecommendedProductsProps {
  config: RecommendedProductsConfig;
  products?: Product[];
  onProductClick?: (productSlug: string) => void;
  onAddToCart?: (productId: string) => void;
}

export function RecommendedProducts({
  config,
  products = [],
  onProductClick,
  onAddToCart,
}: RecommendedProductsProps) {
  const {
    title = 'You May Also Like',
    subtitle = 'Based on your browsing history',
    productCount = 4,
    columns = 4,
    showPrice = true,
    showAddToCart = true,
  } = config;

  // Placeholder products if none provided
  const displayProducts: Product[] = products.length > 0 ? products.slice(0, productCount) : [
    { id: '1', name: 'Premium Cotton T-Shirt', price: 39.99, slug: 'premium-cotton-tshirt', images: [] },
    { id: '2', name: 'Canvas Tote Bag', price: 29.99, compare_at_price: 49.99, slug: 'canvas-tote-bag', images: [] },
    { id: '3', name: 'Stainless Water Bottle', price: 24.99, slug: 'stainless-water-bottle', images: [] },
    { id: '4', name: 'Bamboo Sunglasses', price: 79.99, slug: 'bamboo-sunglasses', images: [] },
  ].slice(0, productCount);

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  };

  return (
    <section className="py-8 md:py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-xl md:text-2xl font-semibold">{title}</h2>
          </div>
          {subtitle && (
            <p className="text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {/* Products Grid */}
        <div className={`grid ${gridCols[columns]} gap-4 md:gap-6`}>
          {displayProducts.map(product => {
            const imageUrl = product.images?.[0]?.url || '/placeholder.svg';
            const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
            const discountPercent = hasDiscount
              ? Math.round((1 - product.price / product.compare_at_price!) * 100)
              : 0;

            return (
              <div
                key={product.id}
                className="group bg-background rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Product Image */}
                <div
                  className="aspect-square bg-muted overflow-hidden cursor-pointer relative"
                  onClick={() => onProductClick?.(product.slug)}
                >
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {hasDiscount && (
                    <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-medium px-2 py-1 rounded">
                      -{discountPercent}%
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3
                    className="font-medium text-sm md:text-base line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                    onClick={() => onProductClick?.(product.slug)}
                  >
                    {product.name}
                  </h3>

                  {showPrice && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-semibold text-primary">${product.price.toFixed(2)}</span>
                      {hasDiscount && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.compare_at_price!.toFixed(2)}
                        </span>
                      )}
                    </div>
                  )}

                  {showAddToCart && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mt-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart?.(product.id);
                      }}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
