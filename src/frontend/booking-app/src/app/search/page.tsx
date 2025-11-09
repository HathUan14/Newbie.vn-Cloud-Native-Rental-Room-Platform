'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchResultCard from '@/components/SearchResultCard';
import PriceFilter from '@/components/Filters/PriceFilter';
import AmenitiesFilter from '@/components/Filters/AmenitiesFilter';
import SizeFilter from '@/components/Filters/SizeFilter';
import LocationFilter from '@/components/Filters/LocationFilter';
import SortDropdown from '@/components/Filters/SortDropdown';
import { SearchFilters, Room } from '@/types/search';

export default function SearchPage() {
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState<SearchFilters>({
    priceRange: [0, 10000000],
    sizeRange: [0, 100],
    amenities: [],
    location: searchParams.get('location') || '',
    sortBy: 'newest',
  });

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchRooms();
  }, [filters, page]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const sortMap: Record<string, string> = {
        'newest': 'createdAt:DESC',
        'price-asc': 'pricePerMonth:ASC',
        'price-desc': 'pricePerMonth:DESC',
        'size-asc': 'area_sqm:ASC',
        'size-desc': 'area_sqm:DESC',
      };

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sort: sortMap[filters.sortBy] || 'createdAt:DESC',
        minPrice: filters.priceRange[0].toString(),
        maxPrice: filters.priceRange[1].toString(),
        minArea: filters.sizeRange[0].toString(),
        maxArea: filters.sizeRange[1].toString(),
      });

      if (filters.location) {
        queryParams.append('city', filters.location);
      }

      if (filters.amenities.length > 0) {
        queryParams.append('amenities', filters.amenities.join(','));
      }

      console.log('🔍 Fetching rooms with params:', queryParams.toString());

      const response = await fetch(`http://localhost:3000/rooms?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      console.log('✅ API Response:', result);

      // ✅ Map API response to Room type
      if (result.success && result.data) {
        const mappedRooms: Room[] = (result.data.data || []).map((apiRoom: any) => ({
          id: apiRoom.id,
          title: apiRoom.title,
          description: apiRoom.description,
          price: apiRoom.price,
          size: apiRoom.size,
          location: apiRoom.location,
          address: apiRoom.address,
          status: apiRoom.status,
          roomType: apiRoom.roomType,
          amenities: apiRoom.amenities || [],
          images: apiRoom.images || [],
          rating: apiRoom.rating || 0,
          reviewCount: 0,
          available: apiRoom.available,
        }));

        setRooms(mappedRooms);
        setTotal(result.data.total || 0);
      } else {
        setRooms([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('❌ Error fetching rooms:', error);
      setRooms([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const clearAllFilters = () => {
    setFilters({
      priceRange: [0, 10000000],
      sizeRange: [0, 100],
      amenities: [],
      location: '',
      sortBy: 'newest',
    });
    setPage(1);
  };

  const activeFiltersCount = 
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000000 ? 1 : 0) +
    (filters.sizeRange[0] > 0 || filters.sizeRange[1] < 100 ? 1 : 0) +
    (filters.amenities.length > 0 ? 1 : 0) +
    (filters.location ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mt-10 sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <PriceFilter
              value={filters.priceRange}
              onChange={(value) => setFilters({ ...filters, priceRange: value })}
            />
            
            <SizeFilter
              value={filters.sizeRange}
              onChange={(value) => setFilters({ ...filters, sizeRange: value })}
            />
            
            <AmenitiesFilter
              value={filters.amenities}
              onChange={(value) => setFilters({ ...filters, amenities: value })}
            />
            
            <LocationFilter
              value={filters.location}
              onChange={(value) => setFilters({ ...filters, location: value })}
            />

            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Xóa bộ lọc ({activeFiltersCount})
              </button>
            )}
          </div>

          {/* Results Info & Sort */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Tìm thấy <span className="font-semibold text-gray-900">{total}</span> kết quả
              {filters.location && (
                <span> tại <span className="font-semibold text-gray-900">{filters.location}</span></span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>

              <SortDropdown
                value={filters.sortBy}
                onChange={(value) => setFilters({ ...filters, sortBy: value as any })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse">
                <div className="h-64 bg-gray-300" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-300 rounded w-3/4" />
                  <div className="h-4 bg-gray-300 rounded w-1/2" />
                  <div className="h-8 bg-gray-300 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Không tìm thấy kết quả
            </h3>
            <p className="text-gray-600 mb-6">
              Thử điều chỉnh bộ lọc hoặc tìm kiếm ở khu vực khác
            </p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        ) : (
          <>
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-6'
            }>
              {rooms.map((room) => (
                <SearchResultCard key={room.id} room={room} />
              ))}
            </div>

            {/* Pagination */}
            {total > 12 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Trước
                </button>
                
                {[...Array(Math.ceil(total / 12))].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`px-4 py-2 rounded-lg transition ${
                      page === i + 1
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setPage(Math.min(Math.ceil(total / 12), page + 1))}
                  disabled={page === Math.ceil(total / 12)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}