'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  Calendar, 
  MapPin, 
  CreditCard, 
  XCircle, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Home,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Types
interface Booking {
  id: number;
  roomId: number;
  moveInDate: string;
  depositAmount: number;
  totalPrice: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CONFIRMED' | 'CANCELLED_BY_RENTER' | 'CANCELLED_BY_HOST';
  rejectReason?: string;
  cancelReason?: string;
  createdAt: string;
  room: {
    id: number;
    title: string;
    address: string;
    district: string;
    city: string;
    pricePerMonth: number;
    images: Array<{ imageUrl: string }>;
  };
}

const STATUS_CONFIG = {
  PENDING: {
    label: 'Chờ xác nhận',
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    icon: Clock,
    description: 'Đang chờ chủ nhà xem xét',
  },
  APPROVED: {
    label: 'Đã chấp nhận',
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: CheckCircle,
    description: 'Chủ nhà đã chấp nhận yêu cầu',
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: CheckCircle,
    description: 'Đã thanh toán & xác nhận',
  },
  REJECTED: {
    label: 'Đã từ chối',
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: XCircle,
    description: 'Chủ nhà đã từ chối',
  },
  CANCELLED_BY_RENTER: {
    label: 'Đã hủy',
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    icon: XCircle,
    description: 'Bạn đã hủy yêu cầu',
  },
  CANCELLED_BY_HOST: {
    label: 'Chủ nhà hủy',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: AlertCircle,
    description: 'Chủ nhà đã hủy',
  },
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export default function MyBookingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    if (!authLoading && user) {
      fetchBookings();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchBookings = async () => {
    try {
      const response = await fetch(`${API_URL}/booking/my-bookings`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      console.log(result.data);
      if (result.success) {
        setBookings(result.data);
      } else {
        setError(result.msg || 'Không thể tải danh sách đặt phòng');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: number) => {
    const reason = prompt('Lý do hủy (tùy chọn):');
    if (reason === null) return;

    setCancellingId(bookingId);
    try {
      const response = await fetch(`${API_URL}/booking/cancel/${bookingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reason }),
      });

      const result = await response.json();
      if (result.success) {
        alert('✅ Đã hủy yêu cầu thành công');
        fetchBookings(); 
      } else {
        alert('❌ ' + (result.msg || 'Không thể hủy'));
      }
    } catch (err) {
      alert('❌ Lỗi kết nối');
    } finally {
      setCancellingId(null);
    }
  };

  // Sửa lỗi cú pháp Loading [cite: 132]
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Sửa lỗi cú pháp check User [cite: 146]
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Yêu cầu đăng nhập</h2>
          <p className="text-gray-600 mb-6">Vui lòng đăng nhập để xem danh sách đơn đặt phòng của bạn</p>
          <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header và các phần khác giữ nguyên như code của bạn */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Đơn đặt phòng của tôi</h1>
              <p className="text-sm text-gray-600 mt-1">Quản lý và theo dõi trạng thái các yêu cầu thuê phòng</p>
            </div>
            <button onClick={fetchBookings} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600" title="Làm mới">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(STATUS_CONFIG).map(([status, config]) => {
              const count = bookings.filter(b => b.status === status).length;
              return (
                <div key={status} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center gap-2">
                    <config.icon className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-medium text-gray-600">{config.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {bookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có đơn đặt phòng nào</h3>
            <Link href="/search" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition">
              Tìm phòng ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={handleCancel}
                isCancelling={cancellingId === booking.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


function BookingCard({ 
  booking, 
  onCancel, 
  isCancelling 
}: { 
  booking: Booking; 
  onCancel: (id: number) => void;
  isCancelling: boolean;
}) {
  const statusConfig = STATUS_CONFIG[booking.status];
  const StatusIcon = statusConfig.icon;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
      <div className="md:flex">
        {/* Image */}
        <div className="md:w-64 h-48 md:h-auto relative bg-gray-200 flex-shrink-0">
          {booking.room.images?.[0]? (
            <img
              src={booking.room.images[0].imageUrl}
              alt={booking.room.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Home className="w-12 h-12 text-gray-400" />
            </div>
          )}
          <div className="absolute top-3 right-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${statusConfig.color} backdrop-blur-sm bg-opacity-90`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 md:p-6">
          <div className="flex justify-between items-start gap-4 mb-4">
            <div className="flex-1">
              <Link 
                href={`/rooms/${booking.room.id}`}
                className="text-lg font-bold text-gray-900 hover:text-blue-600 transition line-clamp-1 mb-2"
              >
                {booking.room.title}
              </Link>
              <div className="flex flex-col gap-1.5 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="line-clamp-1">
                    {booking.room.address}, {booking.room.district}, {booking.room.city}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Dọn vào: {format(new Date(booking.moveInDate), 'dd/MM/yyyy', { locale: vi })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Price Info */}
          <div className="grid grid-cols-2 gap-3 mb-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs text-gray-600 mb-1">Giá thuê/tháng</p>
              <p className="font-bold text-gray-900">{formatCurrency(booking.totalPrice)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Tiền cọc</p>
              <p className="font-bold text-blue-600">{formatCurrency(booking.depositAmount)}</p>
            </div>
          </div>

          {/* Status Description */}
          <p className="text-sm text-gray-600 mb-4">
            {statusConfig.description}
          </p>

          {/* Reject/Cancel Reason */}
          {(booking.rejectReason || booking.cancelReason) && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-4">
              <p className="text-xs font-semibold text-red-900 mb-1">
                {booking.rejectReason ? 'Lý do từ chối:' : 'Lý do hủy:'}
              </p>
              <p className="text-sm text-red-700">
                {booking.rejectReason || booking.cancelReason}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {booking.status === 'APPROVED' && (
              <button 
                onClick={() => alert('🚧 Tính năng thanh toán đang được phát triển')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
              >
                <CreditCard className="w-4 h-4" />
                Thanh toán cọc
              </button>
            )}

            {booking.status === 'PENDING' && (
              <button
                onClick={() => onCancel(booking.id)}
                disabled={isCancelling}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-red-300 text-red-600 hover:bg-red-50 font-semibold rounded-lg transition disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                {isCancelling ? 'Đang hủy...' : 'Hủy yêu cầu'}
              </button>
            )}

            <Link
              href={`/rooms/${booking.room.id}`}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-lg transition"
            >
              Xem phòng
            </Link>
          </div>

          {/* Timestamp */}
          <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-100">
            Đặt lúc: {format(new Date(booking.createdAt), "dd/MM/yyyy 'lúc' HH:mm", { locale: vi })}
          </p>
        </div>
      </div>
    </div>
  );
}
