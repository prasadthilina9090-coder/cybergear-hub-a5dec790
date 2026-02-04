import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export interface FilterState {
  priceRange: [number, number];
  brands: string[];
  ramOptions: string[];
  storageOptions: string[];
  inStock: boolean;
  search: string;
}

interface ProductFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableBrands: string[];
  maxPrice: number;
}

const RAM_OPTIONS = ['8GB', '16GB', '32GB', '64GB', '128GB'];
const STORAGE_OPTIONS = ['256GB', '512GB', '1TB', '2TB', '4TB'];

export default function ProductFilters({
  filters,
  onFiltersChange,
  availableBrands,
  maxPrice,
}: ProductFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const toggleArrayFilter = (key: 'brands' | 'ramOptions' | 'storageOptions', value: string) => {
    const current = localFilters[key];
    const newArray = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilter(key, newArray);
  };

  const clearFilters = () => {
    const cleared: FilterState = {
      priceRange: [0, maxPrice],
      brands: [],
      ramOptions: [],
      storageOptions: [],
      inStock: false,
      search: '',
    };
    setLocalFilters(cleared);
    onFiltersChange(cleared);
  };

  const hasActiveFilters =
    filters.brands.length > 0 ||
    filters.ramOptions.length > 0 ||
    filters.storageOptions.length > 0 ||
    filters.inStock ||
    filters.search ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < maxPrice;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <Label className="text-sm font-medium">Search</Label>
        <Input
          placeholder="Search products..."
          value={localFilters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="mt-2"
        />
      </div>

      {/* Price Range */}
      <div>
        <Label className="text-sm font-medium">
          Price Range: ${localFilters.priceRange[0]} - ${localFilters.priceRange[1]}
        </Label>
        <Slider
          value={localFilters.priceRange}
          onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
          max={maxPrice}
          step={50}
          className="mt-4"
        />
      </div>

      {/* In Stock */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="inStock"
          checked={localFilters.inStock}
          onCheckedChange={(checked) => updateFilter('inStock', !!checked)}
        />
        <Label htmlFor="inStock" className="text-sm cursor-pointer">
          In Stock Only
        </Label>
      </div>

      <Accordion type="multiple" defaultValue={['brands', 'ram', 'storage']}>
        {/* Brands */}
        {availableBrands.length > 0 && (
          <AccordionItem value="brands">
            <AccordionTrigger className="text-sm font-medium">Brands</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2">
                {availableBrands.map((brand) => (
                  <div key={brand} className="flex items-center gap-2">
                    <Checkbox
                      id={`brand-${brand}`}
                      checked={localFilters.brands.includes(brand)}
                      onCheckedChange={() => toggleArrayFilter('brands', brand)}
                    />
                    <Label htmlFor={`brand-${brand}`} className="text-sm cursor-pointer">
                      {brand}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* RAM */}
        <AccordionItem value="ram">
          <AccordionTrigger className="text-sm font-medium">RAM</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-2">
              {RAM_OPTIONS.map((ram) => (
                <div key={ram} className="flex items-center gap-2">
                  <Checkbox
                    id={`ram-${ram}`}
                    checked={localFilters.ramOptions.includes(ram)}
                    onCheckedChange={() => toggleArrayFilter('ramOptions', ram)}
                  />
                  <Label htmlFor={`ram-${ram}`} className="text-sm cursor-pointer">
                    {ram}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Storage */}
        <AccordionItem value="storage">
          <AccordionTrigger className="text-sm font-medium">Storage</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-2">
              {STORAGE_OPTIONS.map((storage) => (
                <div key={storage} className="flex items-center gap-2">
                  <Checkbox
                    id={`storage-${storage}`}
                    checked={localFilters.storageOptions.includes(storage)}
                    onCheckedChange={() => toggleArrayFilter('storageOptions', storage)}
                  />
                  <Label htmlFor={`storage-${storage}`} className="text-sm cursor-pointer">
                    {storage}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          <X className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-20 p-4 rounded-lg bg-card border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Filters</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear
              </Button>
            )}
          </div>
          <FilterContent />
        </div>
      </div>

      {/* Mobile Filter Button */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="lg:hidden">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                Active
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle className="font-display">Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
