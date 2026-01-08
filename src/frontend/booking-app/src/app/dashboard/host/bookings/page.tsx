'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
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
  RefreshCw,
  MessageSquare,
  Building2,
  Filter,
  Search,
  ChevronDown,
  DollarSign,
} from 'lucide-react';

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
    color: 'bg-amber-500',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    icon: Clock,
    description: 'Yêu cầu mới cần xem xét',
  },
  APPROVED: {
    label: 'Đã chấp nhận',
    color: 'bg-blue-500',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    icon: CheckCircle,
    description: 'Đã chấp nhận, chờ thanh toán',
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    color: 'bg-blue-500',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    icon: CheckCircle,
    description: 'Đã thanh toán & xác nhận',
  },
  REJECTED: {
    label: 'Đã từ chối',
    color: 'bg-red-500',
    bgLight: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    icon: XCircle,
    description: 'Đã từ chối yêu cầu',
  },
  CANCELLED_BY_RENTER: {
    label: 'Khách hủy',
    color: 'bg-slate-500',
    bgLight: 'bg-slate-50',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-200',
    icon: XCircle,
    description: 'Khách đã hủy yêu cầu',
  },
  CANCELLED_BY_HOST: {
    label: 'Đã hủy',
    color: 'bg-orange-500',
    bgLight: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
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
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [rejectModal, setRejectModal] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/booking/host-bookings`, {
        credentials: 'include',
      });
      const result = await response.json();
      if (result.success) {
        setBookings(result.data);
      } else {
        toast.error(result.msg || 'Không thể tải danh sách');
      }
    } catch (err) {
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchBookings();
  }, [user]);

  const handleApprove = async (bookingId: number) => {
    setProcessingId(bookingId);
    try {
      const response = await fetch(`${API_URL}/booking/host-process/${bookingId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Đã chấp nhận yêu cầu!');
        fetchBookings();
      } else {
        toast.error(result.msg || 'Không thể xử lý');
      }
    } catch (err) {
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }

    setProcessingId(rejectModal);
    try {
      const response = await fetch(`${API_URL}/booking/host-process/${rejectModal}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED', rejectReason }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Đã từ chối yêu cầu');
        setRejectModal(null);
        setRejectReason('');
        fetchBookings();
      } else {
        toast.error(result.msg || 'Không thể xử lý');
      }
    } catch (err) {
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredBookings = filterStatus === 'ALL' 
    ? bookings 
    : bookings.filter((b) => b.status === filterStatus);

  const statusCounts = {
    ALL: bookings.length,
    PENDING: bookings.filter((b) => b.status === 'PENDING').length,
    APPROVED: bookings.filter((b) => b.status === 'APPROVED').length,
    CONFIRMED: bookings.filter((b) => b.status === 'CONFIRMED').length,
    REJECTED: bookings.filter((b) => b.status === 'REJECTED').length,
    CANCELLED_BY_RENTER: bookings.filter((b) => b.status === 'CANCELLED_BY_RENTER').length,
    CANCELLED_BY_HOST: bookings.filter((b) => b.status === 'CANCELLED_BY_HOST').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Yêu cầu thuê phòng</h1>
              <p className="text-slate-500 mt-1">
                Xử lý các yêu cầu đặt phòng từ khách hàng
              </p>
            </div>
            <button
              onClick={fetchBookings}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-medium text-amber-700">Chờ duyệt</span>
              </div>
              <p className="text-2xl font-bold text-amber-900">{statusCounts.PENDING}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">Đã chấp nhận</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{statusCounts.APPROVED}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">Đã xác nhận</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{statusCounts.CONFIRMED}</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-medium text-purple-700">Tổng yêu cầu</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">{statusCounts.ALL}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-6 space-y-6">
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'PENDING', label: 'Chờ duyệt' },
            { key: 'APPROVED', label: 'Đã chấp nhận' },
            { key: 'CONFIRMED', label: 'Đã xác nhận' },
            { key: 'REJECTED', label: 'Từ chối' },
            { key: 'CANCELLED_BY_RENTER', label: 'Khách hủy' },
          ].map((status) => (
            <button
              key={status.key}
              onClick={() => setFilterStatus(status.key)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border
                ${filterStatus === status.key
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}
              `}
            >
              {status.label}
              <span className={`
                text-xs px-1.5 py-0.5 rounded-full
                ${filterStatus === status.key ? 'bg-white/20' : 'bg-slate-100'}
              `}>
                {statusCounts[status.key as keyof typeof statusCounts] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Booking List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="animate-pulse space-y-4">
                  <div className="flex gap-4">
                    <div className="w-32 h-24 bg-slate-200 rounded-xl" />
                    <div className="flex-1 space-y-3">
                      <div className="h-5 bg-slate-200 rounded w-3/4" />
                      <div className="h-4 bg-slate-200 rounded w-1/2" />
                      <div className="h-4 bg-slate-200 rounded w-2/3" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {filterStatus === 'ALL' ? 'Chưa có yêu cầu nào' : 'Không có yêu cầu'}
            </h3>
            <p className="text-slate-500">
              {filterStatus === 'ALL'
                ? 'Các yêu cầu đặt phòng sẽ hiển thị tại đây'
                : 'Thử thay đổi bộ lọc để xem các yêu cầu khác'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onApprove={() => handleApprove(booking.id)}
                onReject={() => {
                  setRejectModal(booking.id);
                  setRejectReason('');
                }}
                isProcessing={processingId === booking.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Từ chối yêu cầu</h3>
                <p className="text-sm text-slate-500">Vui lòng cho biết lý do</p>
              </div>
            </div>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối (bắt buộc)..."
              rows={4}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-slate-900 resize-none"
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setRejectModal(null);
                  setRejectReason('');
                }}
                disabled={processingId !== null}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleReject}
                disabled={processingId !== null || !rejectReason.trim()}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processingId ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  'Xác nhận từ chối'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BookingCard({
  booking,
  onApprove,
  onReject,
  isProcessing,
}: {
  booking: Booking;
  onApprove: () => void;
  onReject: () => void;
  isProcessing: boolean;
}) {
  const statusConfig = STATUS_CONFIG[booking.status];
  const StatusIcon = statusConfig.icon;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition">
      <div className="md:flex">
        {/* Image */}
        <div className="md:w-56 h-44 md:h-auto relative bg-slate-200 flex-shrink-0">
          {booking.room.images?.[0]?.imageUrl ? (
            <Image
              src={booking.room.images[0].imageUrl}
              alt={booking.room.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Home className="w-12 h-12 text-slate-400" />
            </div>
          )}
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white ${statusConfig.color} shadow-lg`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 md:p-6">
          {/* Room Info */}
          <Link
            href={`/rooms/${booking.room.id}`}
            className="text-lg font-bold text-slate-900 hover:text-blue-600 transition line-clamp-1 mb-2 block"
          >
            {booking.room.title}
          </Link>
          <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-4">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="line-clamp-1">
              {booking.room.address}, {booking.room.district}, {booking.room.city}
            </span>
          </div>

          {/* Renter Info */}
          <div className={`rounded-xl p-4 mb-4 border ${statusConfig.borderColor} ${statusConfig.bgLight}`}>
            <h4 className={`text-xs font-semibold ${statusConfig.textColor} mb-3 uppercase tracking-wide`}>
              Thông tin khách thuê
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <User className={`w-4 h-4 ${statusConfig.textColor} flex-shrink-0`} />
                <div>
                  <p className="text-xs text-slate-500">Họ tên</p>
                  <p className="font-semibold text-slate-900">{booking.renter.fullName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className={`w-4 h-4 ${statusConfig.textColor} flex-shrink-0`} />
                <div>
                  <p className="text-xs text-slate-500">Số điện thoại</p>
                  <a
                    href={`tel:${booking.renter.phoneNumber}`}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    {booking.renter.phoneNumber}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className={`w-4 h-4 ${statusConfig.textColor} flex-shrink-0`} />
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="font-semibold text-slate-900 truncate">{booking.renter.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className={`w-4 h-4 ${statusConfig.textColor} flex-shrink-0`} />
                <div>
                  <p className="text-xs text-slate-500">Ngày dọn vào</p>
                  <p className="font-semibold text-slate-900">
                    {format(new Date(booking.moveInDate), 'dd/MM/yyyy', { locale: vi })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Price Info */}
          <div className="grid grid-cols-2 gap-3 mb-4 p-4 bg-slate-50 rounded-xl">
            <div>
              <p className="text-xs text-slate-500 mb-1">Giá thuê/tháng</p>
              <p className="font-bold text-slate-900">{formatCurrency(booking.totalPrice)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Tiền cọc</p>
              <p className="font-bold text-blue-600">{formatCurrency(booking.depositAmount)}</p>
            </div>
          </div>

          {/* Reject/Cancel Reason */}
          {(booking.rejectReason || booking.cancelReason) && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4">
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
                onClick={onApprove}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold rounded-xl transition"
              >
                <CheckCircle className="w-4 h-4" />
                {isProcessing ? 'Đang xử lý...' : 'Chấp nhận'}
              </button>
              <button
                onClick={onReject}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50 font-semibold rounded-xl transition"
              >
                <XCircle className="w-4 h-4" />
                Từ chối
              </button>
            </div>
          )}

          {/* Timestamp */}
          <p className="text-xs text-slate-500 mt-4 pt-4 border-t border-slate-100">
            Yêu cầu lúc: {format(new Date(booking.createdAt), "dd/MM/yyyy 'lúc' HH:mm", { locale: vi })}
          </p>
        </div>
      </div>
    </div>
  );
}
