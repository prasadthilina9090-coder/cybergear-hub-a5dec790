import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Product, ProductCategory, PcPartType } from '@/types/database';
import type { FilterState } from '@/components/products/ProductFilters';

interface UseProductsOptions {
  category?: ProductCategory;
  pcPartType?: PcPartType;
  featured?: boolean;
  limit?: number;
}

export function useProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        let query = supabase
          .from('products')
          .select('*')
          .eq('is_active', true);

        if (options.category) {
          query = query.eq('category', options.category);
        }

        if (options.pcPartType) {
          query = query.eq('pc_part_type', options.pcPartType);
        }

        if (options.featured) {
          query = query.eq('is_featured', true);
        }

        if (options.limit) {
          query = query.limit(options.limit);
        }

        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) throw error;
        
        // Cast the data to Product[] since we know the structure
        setProducts((data || []) as unknown as Product[]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch products'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [options.category, options.pcPartType, options.featured, options.limit]);

  return { products, isLoading, error };
}

export function useFilteredProducts(
  products: Product[],
  filters: FilterState
) {
  return useMemo(() => {
    return products.filter((product) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          product.name.toLowerCase().includes(searchLower) ||
          product.brand?.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Price range filter
      const price = product.sale_price || product.price;
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
        return false;
      }

      // Brand filter
      if (filters.brands.length > 0 && product.brand) {
        if (!filters.brands.includes(product.brand)) return false;
      }

      // RAM filter
      if (filters.ramOptions.length > 0 && product.specs?.ram) {
        if (!filters.ramOptions.some((ram) => product.specs.ram?.includes(ram))) {
          return false;
        }
      }

      // Storage filter
      if (filters.storageOptions.length > 0 && product.specs?.storage) {
        if (!filters.storageOptions.some((storage) => product.specs.storage?.includes(storage))) {
          return false;
        }
      }

      // In stock filter
      if (filters.inStock && product.stock_quantity === 0) {
        return false;
      }

      return true;
    });
  }, [products, filters]);
}

export function useProductById(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;
        setProduct(data as unknown as Product);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch product'));
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  return { product, isLoading, error };
}
