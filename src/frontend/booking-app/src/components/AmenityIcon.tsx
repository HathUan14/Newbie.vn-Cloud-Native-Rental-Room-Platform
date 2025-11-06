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

const iconMap: Record<string, any> = {
  'WiFi miễn phí': Wifi,
  'Máy lạnh': Wind,
  'Nóng lạnh': Flame,
  'WC riêng': Bath,
  'Chỗ để xe': Car,
  'Giờ giấc tự do': Clock,
  'Không chung chủ': Home,
  'Kệ bếp': CookingPot,
  'Máy giặt': WashingMachine,
  'Tủ lạnh': Refrigerator,
  'Giường': BedDouble,
  'Tủ quần áo': Archive,
  'Thang máy': Building2,
  'An ninh 24/7': Shield,
  'Ban công': Dock,
  'Cho nuôi pet': Dog,
  'Bếp chung': UtensilsCrossed,
  'Full nội thất': Sofa,
};

export default function AmenityIcon({ amenityName }: { amenityName: string }) {
  const Icon = iconMap[amenityName] || CheckCircle;
  return <Icon className="w-5 h-5 text-blue-600 flex-shrink-0" />;
}