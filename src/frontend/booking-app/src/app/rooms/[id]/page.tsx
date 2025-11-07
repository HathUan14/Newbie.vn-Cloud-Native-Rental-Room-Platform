import RoomInfo from "@/components/RoomInfo";
import AmenityList from "@/components/AmenityList";
import HostInfo from "@/components/HostInfo";
import ImageGallery from "@/components/ImageGallery";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";

type Host = {
  id: number;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  avatarUrl: string | null;
};

type RoomType = {
  id: number;
  name: string;
};

type RoomImage = {
  id: number;
  imageUrl: string;
  isThumbnail: boolean;
};

type Amenity = {
  id: number;
  name: string;
};

type RoomAmenity = {
  roomId: number;
  amenityId: number;
  amenity: Amenity;
};

type Room = {
  id: number;
  hostId: number;
  roomTypeId: number;
  title: string;
  description: string;
  area_sqm: number;
  addressStreet: string;
  ward: string;
  district: string;
  city: string;
  pricePerMonth: string;
  depositAmount: string;
  guestCapacity: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  host: Host;
  roomType: RoomType;
  images: RoomImage[];
  roomAmenities: RoomAmenity[];
};

type ApiResponse = {
  success: boolean;
  data: Room;
};

async function fetchRoomDetail(id: string): Promise<Room | null> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const res = await fetch(`${API_URL}/rooms/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const response: ApiResponse = await res.json();

    if (!response.success || !response.data) {
      return null;
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching room:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const room = await fetchRoomDetail(id);

  if (!room) {
    return {
      title: "Phòng không tồn tại",
    };
  }

  return {
    title: `${room.title} | Booking App`,
    description: room.description.substring(0, 160),
  };
}

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const room = await fetchRoomDetail(id);

  if (!room) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <a href="/" className="hover:text-blue-600">
              Trang chủ
            </a>
            <span>/</span>
            <a href="/rooms" className="hover:text-blue-600">
              Phòng trọ
            </a>
            <span>/</span>
            <span className="text-gray-900 font-medium">{room.title}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {/* Gallery Ảnh */}
            <ImageGallery images={room.images} />

            {/* Room Info */}
            <RoomInfo room={room} />

            {/* Amenities */}
            <AmenityList amenities={room.roomAmenities} />

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <h2 className="text-xl font-bold mb-3">Mô tả chi tiết</h2>
              <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">
                {room.description}
              </p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-5">
              <div className="bg-white rounded-lg shadow-lg p-5">
                <div className="mb-5">
                  <div className="text-xs text-gray-600 mb-1">Mức giá</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-blue-600">
                      {parseFloat(room.pricePerMonth) >= 1000000
                        ? `${(parseFloat(room.pricePerMonth) / 1000000).toFixed(
                            1
                          )} triệu`
                        : new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(parseFloat(room.pricePerMonth))}
                    </span>
                    <span className="text-gray-500 text-base">/tháng</span>
                  </div>
                </div>

                <div className="space-y-2.5 mb-5 pb-5 border-b">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Diện tích:</span>
                    <span className="font-semibold">{room.area_sqm}m²</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Đặt cọc:</span>
                    <span className="font-semibold">
                      {parseFloat(room.depositAmount) >= 1000000
                        ? `${(parseFloat(room.depositAmount) / 1000000).toFixed(
                            1
                          )} triệu`
                        : new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(parseFloat(room.depositAmount))}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <button className="w-full bg-blue-600 text-white py-2.5 text-sm rounded-lg font-semibold hover:bg-blue-700 transition">
                    Đặt phòng ngay
                  </button>
                  <button className="w-full border border-blue-600 text-blue-600 py-2.5 text-sm rounded-lg font-semibold hover:bg-blue-50 transition">
                    Liên hệ chủ nhà
                  </button>
                </div>
              </div>

              {/* Host Info */}
              <HostInfo host={room.host} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
