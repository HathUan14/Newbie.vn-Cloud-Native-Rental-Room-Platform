'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Room } from '@/types/search';
import { useCloudinaryImage } from '@/hooks/useCloudinaryImages';

interface SearchResultCardProps {
  room: Room;
}

export default function SearchResultCard({ room }: SearchResultCardProps) {
  // ✅ Lấy thumbnail (ảnh đầu tiên hoặc ảnh có isThumbnail = true)
  const thumbnailImage = room.images.find(img => img.isThumbnail) || room.images[0];
  const { imageUrl, isLoading } = useCloudinaryImage(thumbnailImage?.url || '');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <Link
      href={`/rooms/${room.id}`}
      className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-64 overflow-hidden bg-gray-200">
        {isLoading ? (
          <div className="w-full h-full bg-gray-300 animate-pulse" />
        ) : (
          <Image
            src={imageUrl}
            alt={room.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
        
        {/* Badge */}
        {!room.available && (
          <div className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
            Đã cho thuê
          </div>
        )}
        
        {/* Heart */}
        <button 
          className="absolute top-4 right-4 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition"
          onClick={(e) => {
            e.preventDefault();
            // TODO: Add to wishlist
          }}
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="line-clamp-1">{room.location}</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition">
          {room.title}
        </h3>

        {/* Info */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <span>📏</span>
            <span>{room.size}m²</span>
          </div>
          {room.rating > 0 && (
            <div className="flex items-center gap-1">
              <span>⭐</span>
              <span className="font-medium">{room.rating}</span>
              {room.reviewCount && (
                <span className="text-gray-400">({room.reviewCount})</span>
              )}
            </div>
          )}
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mb-4">
          {room.amenities.slice(0, 3).map((amenity) => (
            <span
              key={amenity.id}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {amenity.name}
            </span>
          ))}
          {room.amenities.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              +{room.amenities.length - 3}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-end justify-between pt-3 border-t border-gray-100">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {formatPrice(room.price)}
            </p>
            <p className="text-xs text-gray-500">/ tháng</p>
          </div>
          
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition">
            Xem chi tiết
          </button>
        </div>
      </div>
    </Link>
  );
}