import {
  Wifi,
  Wind,
  Flame,
  Bath,
  Car,
  Clock,
  Home,
  CookingPot,
  WashingMachine,
  Refrigerator,
  BedDouble,
  Archive,
  Building2,
  Shield,
  Dock,
  Dog,
  UtensilsCrossed,
  Sofa,
  CheckCircle
} from 'lucide-react';

const iconMap: Record<string, { icon: any; color: string }> = {
  'WiFi miễn phí': { icon: Wifi, color: 'text-blue-600' },
  'Máy lạnh': { icon: Wind, color: 'text-cyan-600' },
  'Nóng lạnh': { icon: Flame, color: 'text-orange-600' },
  'WC riêng': { icon: Bath, color: 'text-indigo-600' },
  'Chỗ để xe': { icon: Car, color: 'text-purple-600' },
  'Giờ giấc tự do': { icon: Clock, color: 'text-green-600' },
  'Không chung chủ': { icon: Home, color: 'text-pink-600' },
  'Kệ bếp': { icon: CookingPot, color: 'text-amber-600' },
  'Máy giặt': { icon: WashingMachine, color: 'text-teal-600' },
  'Tủ lạnh': { icon: Refrigerator, color: 'text-sky-600' },
  'Giường': { icon: BedDouble, color: 'text-violet-600' },
  'Tủ quần áo': { icon: Archive, color: 'text-rose-600' },
  'Thang máy': { icon: Building2, color: 'text-slate-600' },
  'An ninh 24/7': { icon: Shield, color: 'text-red-600' },
  'Ban công': { icon: Dock, color: 'text-emerald-600' },
  'Cho nuôi pet': { icon: Dog, color: 'text-yellow-600' },
  'Bếp chung': { icon: UtensilsCrossed, color: 'text-lime-600' },
  'Full nội thất': { icon: Sofa, color: 'text-fuchsia-600' },
};

export default function AmenityIcon({
  amenityName,
  className
}: {
  amenityName: string;
  className?: string;
}) {
  const amenity = iconMap[amenityName] || { icon: CheckCircle, color: 'text-gray-600' };
  const Icon = amenity.icon;

  return (
    <div className={`p-2 bg-white rounded-lg ${className || ''}`}>
      <Icon className={`w-5 h-5 ${amenity.color}`} />
    </div>
  );
}