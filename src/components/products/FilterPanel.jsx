'use client';

import { useState, useCallback } from 'react';

/**
 * FilterPanel Component
 * Allows users to filter products by various attributes
 */
export default function FilterPanel({
  onFilterChange = () => {},
  priceRange = { min: 0, max: 1000 },
  inStockOnly = false,
  className = ''
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [minPrice, setMinPrice] = useState(priceRange.min);
  const [maxPrice, setMaxPrice] = useState(priceRange.max);
  const [filterInStock, setFilterInStock] = useState(inStockOnly);

  const handlePriceChange = useCallback((type, value) => {
    const numValue = parseFloat(value) || 0;

    if (type === 'min') {
      setMinPrice(numValue);
      onFilterChange({ minPrice: numValue, maxPrice, inStock: filterInStock });
    } else {
      setMaxPrice(numValue);
      onFilterChange({ minPrice, maxPrice: numValue, inStock: filterInStock });
    }
  }, [minPrice, maxPrice, filterInStock, onFilterChange]);

  const handleInStockChange = useCallback((checked) => {
    setFilterInStock(checked);
    onFilterChange({ minPrice, maxPrice, inStock: checked });
  }, [minPrice, maxPrice, onFilterChange]);

  const handleReset = useCallback(() => {
    setMinPrice(priceRange.min);
    setMaxPrice(priceRange.max);
    setFilterInStock(false);
    onFilterChange({ minPrice: priceRange.min, maxPrice: priceRange.max, inStock: false });
  }, [priceRange, onFilterChange]);

  return (
    <div className={`${className}`}>
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="md:hidden text-primary-600 hover:text-primary-700 font-semibold"
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {/* Filter Content */}
      <div className={`space-y-6 ${isExpanded ? 'block' : 'hidden md:block'}`}>

        {/* Price Range Filter */}
        <div className="border-b pb-6">
          <h4 className="font-semibold text-gray-900 mb-4">Price Range</h4>

          <div className="space-y-4">
            {/* Min Price */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Min Price: ${minPrice.toFixed(2)}
              </label>
              <input
                type="range"
                min={priceRange.min}
                max={priceRange.max}
                value={minPrice}
                onChange={(e) => handlePriceChange('min', e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Max Price: ${maxPrice.toFixed(2)}
              </label>
              <input
                type="range"
                min={priceRange.min}
                max={priceRange.max}
                value={maxPrice}
                onChange={(e) => handlePriceChange('max', e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
            </div>

            {/* Price Input Fields */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Min</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Max</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="1000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stock Status Filter */}
        <div className="border-b pb-6">
          <h4 className="font-semibold text-gray-900 mb-4">Availability</h4>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={filterInStock}
              onChange={(e) => handleInStockChange(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
            />
            <span className="text-gray-700">In Stock Only</span>
          </label>
        </div>

        {/* Reset Button */}
        <div>
          <button
            onClick={handleReset}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
}
