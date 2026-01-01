'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { 
  Calendar, 
  MapPin, 
  User,
  Phone,
  Mail,
  CheckCircle, 
  XCircle,
  Clock, 
  AlertCircle,
  Home,
  ArrowLeft,
  RefreshCw,
  MessageSquare,
  Building2
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
  renter: {
    id: number;
    fullName: string;
    email: string;
    phoneNumber: string;
    avatarUrl?: string;
  };
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
    label: 'Chờ xét duyệt',
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    icon: Clock,
    description: 'Yêu cầu mới cần xem xét',
  },
  APPROVED: {
    label: 'Đã chấp nhận',
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: CheckCircle,
    description: 'Đã chấp nhận, chờ thanh toán',
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
    description: 'Đã từ chối yêu cầu',
  },
  CANCELLED_BY_RENTER: {
    label: 'Khách hủy',
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    icon: XCircle,
    description: 'Khách đã hủy yêu cầu',
  },
  CANCELLED_BY_HOST: {
    label: 'Đã hủy',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: AlertCircle,
    description: 'Bạn đã hủy booking',
  },
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export default function HostBookingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);

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
      const response = await fetch(`${API_URL}/booking/host-bookings`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (result.success) {
        setBookings(result.data);
      } else {
        setError(result.msg || 'Không thể tải danh sách booking');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId: number) => {
    setProcessingId(bookingId);
    try {
      const response = await fetch(`${API_URL}/booking/host-process/${bookingId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'APPROVED' }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('✅ Đã chấp nhận yêu cầu thành công!');
        fetchBookings();
      } else {
        toast.error('❌ ' + (result.msg || 'Không thể xử lý'));
      }
    } catch (err) {
      toast.error('❌ Lỗi kết nối máy chủ');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (bookingId: number, reason: string) => {
    if (!reason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }

    setProcessingId(bookingId);
    try {
      const response = await fetch(`${API_URL}/booking/host-process/${bookingId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: 'REJECTED',
          rejectReason: reason 
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('✅ Đã từ chối yêu cầu');
        setShowRejectModal(null);
        fetchBookings();
      } else {
        toast.error('❌ ' + (result.msg || 'Không thể xử lý'));
      }
    } catch (err) {
      toast.error('❌ Lỗi kết nối máy chủ');
    } finally {
      setProcessingId(null);
    }
  };

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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Yêu cầu đăng nhập
          </h2>
          <p className="text-gray-600 mb-6">
            Vui lòng đăng nhập để quản lý booking
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  const pendingBookings = bookings.filter(b => b.status === 'PENDING');
  const approvedBookings = bookings.filter(b => b.status === 'APPROVED');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/"
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Quản lý yêu cầu thuê phòng
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Xem và xử lý các yêu cầu đặt phòng từ khách hàng
              </p>
            </div>
            <button
              onClick={fetchBookings}
              className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
              title="Làm mới"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-yellow-700" />
                <span className="text-xs font-medium text-yellow-700">Chờ duyệt</span>
              </div>
              <p className="text-2xl font-bold text-yellow-900">{pendingBookings.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-700" />
                <span className="text-xs font-medium text-green-700">Đã chấp nhận</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{approvedBookings.length}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-blue-700" />
                <span className="text-xs font-medium text-blue-700">Tổng yêu cầu</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{bookings.length}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-purple-700" />
                <span className="text-xs font-medium text-purple-700">Khách hàng</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">
                {new Set(bookings.map(b => b.renter.id)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Chưa có yêu cầu nào
            </h3>
            <p className="text-gray-600 mb-6">
              Các yêu cầu đặt phòng sẽ hiển thị tại đây
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onApprove={handleApprove}
                onReject={(id, reason) => handleReject(id, reason)}
                isProcessing={processingId === booking.id}
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
  onApprove, 
  onReject, 
  isProcessing 
}: { 
  booking: Booking; 
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  isProcessing: boolean;
}) {
  const statusConfig = STATUS_CONFIG[booking.status];
  const StatusIcon = statusConfig.icon;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
      <div className="md:flex">
        {/* Image */}
        <div className="md:w-64 h-48 md:h-auto relative bg-gray-200 flex-shrink-0">
          {booking.room.images?.[0]?.imageUrl ? (
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
              <div className="flex flex-col gap-1.5 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="line-clamp-1">
                    {booking.room.address}, {booking.room.district}, {booking.room.city}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Renter Info */}
          <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-100">
            <h4 className="text-xs font-semibold text-blue-900 mb-3 uppercase tracking-wide">
              Thông tin khách thuê
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-600">Họ tên</p>
                  <p className="font-semibold text-gray-900">{booking.renter.fullName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-600">Số điện thoại</p>
                  <a href={`tel:${booking.renter.phoneNumber}`} className="font-semibold text-blue-600 hover:underline">
                    {booking.renter.phoneNumber}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
                <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900">{booking.renter.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-600">Ngày dọn vào</p>
                  <p className="font-semibold text-gray-900">
                    {format(new Date(booking.moveInDate), 'dd/MM/yyyy', { locale: vi })}
                  </p>
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
          {booking.status === 'PENDING' && (
            <div className="flex gap-3">
              <button
                onClick={() => onApprove(booking.id)}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition"
              >
                <CheckCircle className="w-4 h-4" />
                {isProcessing ? 'Đang xử lý...' : 'Chấp nhận'}
              </button>
              <button
                onClick={() => onReject(booking.id)}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50 font-semibold rounded-lg transition"
              >
                <XCircle className="w-4 h-4" />
                Từ chối
              </button>
            </div>
          )}

          {/* Timestamp */}
          <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-100">
            Yêu cầu lúc: {format(new Date(booking.createdAt), "dd/MM/yyyy 'lúc' HH:mm", { locale: vi })}
          </p>
        </div>
      </div>
    </div>
  );
}

function RejectModal({ 
  onClose, 
  onSubmit, 
  isProcessing 
}: { 
  onClose: () => void; 
  onSubmit: (reason: string) => void;
  isProcessing: boolean;
}) {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Từ chối yêu cầu</h3>
              <p className="text-sm text-gray-600">Vui lòng cho biết lý do</p>
            </div>
          </div>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Nhập lý do từ chối (bắt buộc)"
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition text-gray-900 resize-none"
          />

          <div className="flex gap-3 mt-4">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
            >
              Hủy
            </button>
            <button
              onClick={() => onSubmit(reason)}
              disabled={isProcessing || !reason.trim()}
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition"
            >
              {isProcessing ? 'Đang xử lý...' : 'Xác nhận từ chối'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
