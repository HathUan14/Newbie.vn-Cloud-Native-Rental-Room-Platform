'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ReactNode } from "react";
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { MapPin, Share2, Heart, Users,  Maximize2, Calendar, Shield, Phone, ExternalLink, AlertTriangle, CheckCircle2, Zap, Droplets, Wifi, Bike, Lock, FileText } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import DescriptionViewer from '@/components/DescriptionViewer';

// --- CONSTANTS & UTILS ---
const ROOM_TYPE_LABELS: Record<string, string> = {
  ROOM: 'Phòng trọ',
  STUDIO: 'Căn hộ Studio',
  DORM: 'KTX / Ở ghép',
  HOUSE: 'Nhà nguyên căn',
};

const GENDER_LABELS: Record<string, string> = {
  ALL: 'Nam & Nữ',
  MALE: 'Chỉ Nam',
  FEMALE: 'Chỉ Nữ',
};

const UTILITY_UNIT_LABELS: Record<string, string> = {
  KWH: 'kwh',
  M3: 'm³',
  PERSON: 'người/tháng',
  ROOM: 'phòng/tháng',
  FREE: 'Miễn phí',
};

const formatCurrency = (amount: number | string) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(amount));
};

// --- DYNAMIC MAP COMPONENT ---
const MapViewer = dynamic(() => Promise.resolve(MapComponent), {
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-500"><span>Đang tải bản đồ...</span></div>,
});

function MapComponent({ lat, lng }: { lat: number; lng: number }) {
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const leaflet = await import('leaflet');

      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
      setL(leaflet);
    })();
  }, []);

  if (!L) return null;

  const { MapContainer, TileLayer, Marker, Popup } = require('react-leaflet');

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={16}
      scrollWheelZoom={true}
      zoomControl={true}
      doubleClickZoom={true}
      style={{ height: '500px', width: '100%', borderRadius: '1rem', zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]}>
        <Popup>
          <div className="text-center">
            <p className="font-bold text-gray-900">📍 Vị trí phòng trọ</p>
            <p className="text-xs text-gray-600 mt-1">Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}</p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}

// --- MAIN COMPONENT ---
export default function RoomDetailPage() {
  const params = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showAllImages, setShowAllImages] = useState(false);

  useEffect(() => {
    const fetchRoomDetail = async () => {
      try {
        const response = await fetch(`http://localhost:3000/rooms/${params.id}`);
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error('Error fetching room:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetail();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy phòng</h2>
          <Link href="/search" className="text-blue-600 hover:underline">
            Quay lại tìm kiếm
          </Link>
        </div>
      </div>
    );
  }

  return <RoomDetailContent data={data} selectedImage={selectedImage} setSelectedImage={setSelectedImage} showAllImages={showAllImages} setShowAllImages={setShowAllImages} />;
}

function RoomDetailContent({ data, selectedImage, setSelectedImage, showAllImages, setShowAllImages }: any) {
  const images = data.images || [];
  const amenities = data.roomAmenities || [];
  const [isSaved, setIsSaved] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-slate-800 pb-20">
        {/* 1. HEADER & BREADCRUMB */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <nav className="text-sm text-gray-500 mb-4 flex items-center gap-2 flex-wrap">
              <Link href="/" className="hover:text-blue-600 transition">Trang chủ</Link>
              <span>/</span>
              <Link href="/search" className="hover:text-blue-600 transition">Tìm kiếm</Link>
              <span>/</span>
              <Link href={`/search?city=${encodeURIComponent(data.city)}`} className="hover:text-blue-600 transition">
                {data.city}
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium truncate">{data.district}</span>
            </nav>

            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight mb-3">
                  {data.title}
                </h1>
                <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">{data.address}, {data.ward}</span>
                  </div>
                  <span className="hidden sm:inline">•</span>
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                    {ROOM_TYPE_LABELS[data.roomType]}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${data.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                    {data.status === 'AVAILABLE' ? 'Còn trống' : 'Đã cho thuê'}
                  </span>
                </div>
              </div>

              <div className="hidden md:flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-gray-100 text-sm font-medium transition border border-gray-200 bg-white">
                  <Share2 className="w-4 h-4" />
                  <span>Chia sẻ</span>
                </button>
                <button
                  onClick={() => setIsSaved(!isSaved)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition border ${isSaved
                    ? 'bg-red-50 border-red-200 text-red-600'
                    : 'border-gray-200 bg-white hover:bg-gray-100'
                    }`}
                >
                  <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  <span>{isSaved ? 'Đã lưu' : 'Lưu tin'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. IMAGE GALLERY WITH LIGHTBOX */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 h-[300px] md:h-[500px] rounded-2xl overflow-hidden relative">
            {/* Main Image */}
            <div
              className="md:col-span-2 relative h-full bg-gray-200 group cursor-pointer overflow-hidden"
              onClick={() => setShowAllImages(true)}
            >
              <Image
                src={images[0]?.imageUrl || '/placeholder.jpg'}
                alt="Main room"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                priority
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>

            {/* Side Images Grid */}
            <div className="hidden md:grid grid-cols-2 gap-3 md:col-span-2">
              {images.slice(1, 5).map((img: any, idx: number) => (
                <div
                  key={img.id}
                  className="relative h-full bg-gray-200 group cursor-pointer overflow-hidden"
                  onClick={() => { setSelectedImage(idx + 1); setShowAllImages(true); }}
                >
                  <Image
                    src={img.imageUrl}
                    alt={`Room ${idx + 2}`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>
              ))}
            </div>

            {images.length > 5 && (
              <button
                onClick={() => setShowAllImages(true)}
                className="absolute bottom-4 right-4 bg-white hover:bg-gray-50 border-2 border-gray-900 px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Xem tất cả {images.length} ảnh
              </button>
            )}
          </div>
        </div>

        {/* 3. MAIN CONTENT (Split Layout) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

            {/* LEFT COLUMN (Details) */}
            <div className="lg:col-span-2 space-y-6">

              {/* Host Info & Quick Stats */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-3">
                      {ROOM_TYPE_LABELS[data.roomType]} tại {data.district}
                    </h2>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{data.guestCapacity} người</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Maximize2 className="w-4 h-4" />
                        <span>{data.area} m²</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{GENDER_LABELS[data.gender]}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="py-4">
                <DescriptionViewer description={data.description} />
              </div>

              {/* Amenities */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  Tiện nghi có sẵn
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {amenities.map((item: any) => (
                    <div key={item.amenity.id} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-blue-50 hover:border-blue-200 border border-gray-100 transition-all group">
                      <div
                        className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors [&>svg]:w-full [&>svg]:h-full flex-shrink-0"
                        dangerouslySetInnerHTML={{ __html: item.amenity.icon }}
                      />
                      <span className="text-gray-800 font-medium text-sm">{item.amenity.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Costs Breakdown */}
              <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  Chi phí sinh hoạt
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CostItem
                    label="Tiền điện"
                    value={`${formatCurrency(data.electricityPrice)} / ${UTILITY_UNIT_LABELS[data.electricityUnit]}`}
                    icon={<Zap size={20} className="text-gray-700" />}
                  />

                  <CostItem
                    label="Tiền nước"
                    value={`${formatCurrency(data.waterPrice)} / ${UTILITY_UNIT_LABELS[data.waterUnit]}`}
                    icon={<Droplets size={20} className="text-gray-700" />}
                  />

                  <CostItem
                    label="Internet Wifi"
                    value={data.wifiPrice === "0" ? "Miễn phí" : formatCurrency(data.wifiPrice)}
                    icon={<Wifi size={20} className="text-gray-700" />}
                  />

                  <CostItem
                    label="Phí gửi xe"
                    value={data.parkingFee === "0" ? "Miễn phí" : formatCurrency(data.parkingFee)}
                    icon={<Bike size={20} className="text-gray-700" />}
                  />

                  <CostItem
                    label="Tiền đặt cọc"
                    value={formatCurrency(data.deposit)}
                    icon={<Lock size={20} className="text-gray-700" />}
                    highlight
                  />

                  <CostItem
                    label="Hợp đồng tối thiểu"
                    value={`${data.minLeaseTerm} tháng`}
                    icon={<FileText size={20} className="text-gray-700" />}
                  />
                </div>

              </div>

              {/* Location Map */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
    
                  Vị trí chính xác
                </h3>
                <p className="text-gray-600 mb-4 text-sm bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {data.address}, {data.ward}, {data.district}, {data.city}
                </p>

                <div className="relative z-0 shadow-lg rounded-xl overflow-hidden">
                  <MapViewer lat={data.latitude} lng={data.longitude} />
                </div>
              </div>

              {/* Footer Info */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Cập nhật lần cuối: {format(new Date(data.updatedAt), "dd/MM/yyyy 'lúc' HH:mm", { locale: vi })}</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (Sticky Booking Card) */}
            <div className="relative">
              <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6 sticky top-24">
                {/* Price Card */}
                <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-slate-900">
                        {formatCurrency(data.pricePerMonth)}
                      </span>
                      <span className="text-slate-500 font-medium text-sm">/tháng</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {data.deposit > 0 ? (
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-md text-xs font-bold border border-green-200">
                        <Shield className="w-3 h-3" />
                        Cọc: {formatCurrency(data.deposit)}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Miễn phí cọc</span>
                    )}
                  </div>
                </div>

                {/* 2. CHỦ NHÀ (Tối giản) */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                    {data.host.fullName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 uppercase font-semibold tracking-wide">Chủ nhà</p>
                    <p className="font-bold text-slate-900 truncate">{data.host.fullName}</p>
                  </div>
                  {/* Link xem profile host nếu cần */}
                  <button className="text-xs text-blue-600 font-medium hover:underline">
                    Xem hồ sơ
                  </button>
                </div>

                {/* 3. NÚT HÀNH ĐỘNG (Primary Action) */}
                <div className="space-y-3 mb-6">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-base active:scale-[0.98]">
                    <CheckCircle2 className="w-5 h-5" />
                    THUÊ PHÒNG NGAY
                  </button>
                  <p className="text-[11px] text-center text-slate-400">
                    Gửi yêu cầu thuê miễn phí & chờ chủ nhà xác nhận
                  </p>
                </div>

                {/* 4. LIÊN HỆ PHỤ (Secondary Actions) */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <a
                    href={`tel:${data.host.phoneNumber}`}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all"
                  >
                    <Phone className="w-4 h-4" />
                    Gọi điện
                  </a>
                  <a
                    href={`https://zalo.me/${data.host.phoneNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-blue-100 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-sm transition-all"
                  >
                    <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M22.782 0.166016H27.199C33.2653 0.166016 36.8103 1.05701 39.9572 2.74421C43.1041 4.4314 45.5875 6.89585 47.2557 10.0428C48.9429 13.1897 49.8339 16.7347 49.8339 22.801V27.1991C49.8339 33.2654 48.9429 36.8104 47.2557 39.9573C45.5685 43.1042 43.1041 45.5877 39.9572 47.2559C36.8103 48.9431 33.2653 49.8341 27.199 49.8341H22.8009C16.7346 49.8341 13.1896 48.9431 10.0427 47.2559C6.89583 45.5687 4.41243 43.1042 2.7442 39.9573C1.057 36.8104 0.166016 33.2654 0.166016 27.1991V22.801C0.166016 16.7347 1.057 13.1897 2.7442 10.0428C4.43139 6.89585 6.89583 4.41245 10.0427 2.74421C13.1707 1.05701 16.7346 0.166016 22.782 0.166016Z" fill="#0068FF" />
                      <path opacity="0.12" fill-rule="evenodd" clip-rule="evenodd" d="M49.8336 26.4736V27.1994C49.8336 33.2657 48.9427 36.8107 47.2555 39.9576C45.5683 43.1045 43.1038 45.5879 39.9569 47.2562C36.81 48.9434 33.265 49.8344 27.1987 49.8344H22.8007C17.8369 49.8344 14.5612 49.2378 11.8104 48.0966L7.27539 43.4267L49.8336 26.4736Z" fill="#001A33" />
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M7.779 43.5892C10.1019 43.846 13.0061 43.1836 15.0682 42.1825C24.0225 47.1318 38.0197 46.8954 46.4923 41.4732C46.8209 40.9803 47.1279 40.4677 47.4128 39.9363C49.1062 36.7779 50.0004 33.22 50.0004 27.1316V22.7175C50.0004 16.629 49.1062 13.0711 47.4128 9.91273C45.7385 6.75436 43.2461 4.28093 40.0877 2.58758C36.9293 0.894239 33.3714 0 27.283 0H22.8499C17.6644 0 14.2982 0.652754 11.4699 1.89893C11.3153 2.03737 11.1636 2.17818 11.0151 2.32135C2.71734 10.3203 2.08658 27.6593 9.12279 37.0782C9.13064 37.0921 9.13933 37.1061 9.14889 37.1203C10.2334 38.7185 9.18694 41.5154 7.55068 43.1516C7.28431 43.399 7.37944 43.5512 7.779 43.5892Z" fill="white" />
                      <path d="M20.5632 17H10.8382V19.0853H17.5869L10.9329 27.3317C10.7244 27.635 10.5728 27.9194 10.5728 28.5639V29.0947H19.748C20.203 29.0947 20.5822 28.7156 20.5822 28.2606V27.1421H13.4922L19.748 19.2938C19.8428 19.1801 20.0134 18.9716 20.0893 18.8768L20.1272 18.8199C20.4874 18.2891 20.5632 17.8341 20.5632 17.2844V17Z" fill="#0068FF" />
                      <path d="M32.9416 29.0947H34.3255V17H32.2402V28.3933C32.2402 28.7725 32.5435 29.0947 32.9416 29.0947Z" fill="#0068FF" />
                      <path d="M25.814 19.6924C23.1979 19.6924 21.0747 21.8156 21.0747 24.4317C21.0747 27.0478 23.1979 29.171 25.814 29.171C28.4301 29.171 30.5533 27.0478 30.5533 24.4317C30.5723 21.8156 28.4491 19.6924 25.814 19.6924ZM25.814 27.2184C24.2785 27.2184 23.0273 25.9672 23.0273 24.4317C23.0273 22.8962 24.2785 21.645 25.814 21.645C27.3495 21.645 28.6007 22.8962 28.6007 24.4317C28.6007 25.9672 27.3685 27.2184 25.814 27.2184Z" fill="#0068FF" />
                      <path d="M40.4867 19.6162C37.8516 19.6162 35.7095 21.7584 35.7095 24.3934C35.7095 27.0285 37.8516 29.1707 40.4867 29.1707C43.1217 29.1707 45.2639 27.0285 45.2639 24.3934C45.2639 21.7584 43.1217 19.6162 40.4867 19.6162ZM40.4867 27.2181C38.9322 27.2181 37.681 25.9669 37.681 24.4124C37.681 22.8579 38.9322 21.6067 40.4867 21.6067C42.0412 21.6067 43.2924 22.8579 43.2924 24.4124C43.2924 25.9669 42.0412 27.2181 40.4867 27.2181Z" fill="#0068FF" />
                      <path d="M29.4562 29.0944H30.5747V19.957H28.6221V28.2793C28.6221 28.7153 29.0012 29.0944 29.4562 29.0944Z" fill="#0068FF" />
                    </svg>

                    Chat Zalo
                  </a>
                </div>

                {/* 5. CẢNH BÁO AN TOÀN (Trust Signal) */}
                <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 mb-4">
                  <div className="flex gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-700 leading-relaxed">
                      <span className="font-bold text-orange-700">Cảnh báo an toàn:</span> Không chuyển tiền đặt cọc trực tiếp cho chủ nhà. Nền tảng chỉ hoàn tiền cho các giao dịch thực hiện qua Website.
                    </div>
                  </div>
                </div>

                {/* 6. FOOTER LINKS */}
                <div className="text-center pt-3 border-t border-slate-100">
                  <a
                    href="/policies"
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Quy trình thuê & Chính sách hoàn tiền
                  </a>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>


      {/* IMAGE LIGHTBOX MODAL */}
      {
        showAllImages && (
          <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
            <button
              onClick={() => setShowAllImages(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition z-10"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="max-w-5xl w-full">
              <div className="relative aspect-video mb-4">
                <Image
                  src={images[selectedImage]?.imageUrl || images[0]?.imageUrl}
                  alt={`Room image ${selectedImage + 1}`}
                  fill
                  className="object-contain"
                />
              </div>

              <div className="flex items-center justify-center gap-2 mb-4">
                <button
                  onClick={() => setSelectedImage((prev: number) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <span className="text-white font-medium px-4">
                  {selectedImage + 1} / {images.length}
                </span>

                <button
                  onClick={() => setSelectedImage((prev: number) => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto">
                {images.map((img: any, idx: number) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative aspect-video rounded-lg overflow-hidden border-2 transition ${selectedImage === idx ? 'border-blue-500 scale-105' : 'border-transparent hover:border-white/50'
                      }`}
                  >
                    <Image src={img.imageUrl} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )
      }
    </>
  );
}

// --- HELPER COMPONENTS ---
function CostItem({
  label,
  value,
  icon,
  highlight = false,
}: {
  label: string;
  value: string;
  icon: ReactNode;   // ⭐ Cho phép truyền SVG, icon JSX
  highlight?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 text-gray-700 flex items-center justify-center">
            {icon}   {/* ⭐ icon SVG đưa thẳng vào đây */}
          </span>
          <span className="text-gray-700 font-medium text-sm">{label}</span>
        </div>
        <span
          className={`font-bold text-sm ${highlight ? "text-blue-600" : "text-gray-900"
            }`}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, highlight = false }: { icon: string, label: string, value: string, highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <span className="text-gray-600 font-medium">{label}</span>
      </div>
      <span className={`font-semibold ${highlight ? 'text-green-600' : 'text-gray-900'}`}>
        {value}
      </span>
    </div>
  );
}