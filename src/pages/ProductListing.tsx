import { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProductGrid from '@/components/products/ProductGrid';
import ProductFilters, { FilterState } from '@/components/products/ProductFilters';
import { useProducts, useFilteredProducts } from '@/hooks/useProducts';
import type { ProductCategory, PcPartType } from '@/types/database';

interface CategoryConfig {
  title: string;
  description: string;
  category?: ProductCategory;
  pcPartType?: PcPartType;
}

const categoryConfigs: Record<string, CategoryConfig> = {
  pc: {
    title: 'Gaming PCs',
    description: 'Pre-built high-performance gaming systems',
    category: 'pc',
  },
  'pc-parts': {
    title: 'PC Parts',
    description: 'Premium components for custom builds',
    category: 'pc_parts',
  },
  mobile: {
    title: 'Smartphones',
    description: 'Latest flagship mobile devices',
    category: 'mobile',
  },
  accessories: {
    title: 'Accessories',
    description: 'Gaming peripherals and add-ons',
    category: 'mobile_accessories',
  },
};

export default function ProductListing() {
  const location = useLocation();
  // Extract category from pathname (e.g., '/pc' -> 'pc', '/pc-parts' -> 'pc-parts')
  const pathCategory = location.pathname.slice(1); // Remove leading '/'
  const config = categoryConfigs[pathCategory] || {
    title: 'All Products',
    description: 'Browse our complete catalog',
  };

  const { products, isLoading } = useProducts({ 
    category: config.category,
    pcPartType: config.pcPartType,
  });

  const maxPrice = useMemo(() => {
    if (products.length === 0) return 5000;
    return Math.ceil(Math.max(...products.map(p => p.price)) / 100) * 100;
  }, [products]);

  const availableBrands = useMemo(() => {
    const brands = new Set(products.map(p => p.brand).filter(Boolean) as string[]);
    return Array.from(brands).sort();
  }, [products]);

  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, maxPrice],
    brands: [],
    ramOptions: [],
    storageOptions: [],
    inStock: false,
    search: '',
  });

  const filteredProducts = useFilteredProducts(products, filters);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">{config.title}</h1>
          <p className="text-muted-foreground">{config.description}</p>
        </div>

        <div className="flex gap-8">
          {/* Filters */}
          <ProductFilters
            filters={filters}
            onFiltersChange={setFilters}
            availableBrands={availableBrands}
            maxPrice={maxPrice}
          />

          {/* Products */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <ProductGrid products={filteredProducts} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
