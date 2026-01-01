'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import toast, { Toaster } from 'react-hot-toast';
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
  RefreshCw,
  FileWarning,
  Upload,
  Image as ImageIcon,
  X,
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
  dispute?: {
    id: number;
    status: 'PENDING' | 'RESOLVED_REFUND' | 'RESOLVED_DENIED';
    reason: string;
    refundAmount: number;
    adminDecisionNote?: string;
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
  const [paymentMessage, setPaymentMessage] = useState<{ type: 'success' | 'error' | 'failed', text: string } | null>(null);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);
  const [evidenceImages, setEvidenceImages] = useState<File[]>([]);
  const [evidencePreviews, setEvidencePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    if (!authLoading && user) {
      fetchBookings();
      checkPaymentResult();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const checkPaymentResult = () => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');

    if (paymentStatus === 'success') {
      setPaymentMessage({ type: 'success', text: 'Thanh toán cọc thành công! Đơn đặt phòng đã được xác nhận.' });
      window.history.replaceState({}, '', '/dashboard/bookings');
    } else if (paymentStatus === 'failed') {
      setPaymentMessage({ type: 'failed', text: 'Thanh toán thất bại. Vui lòng thử lại.' });
      window.history.replaceState({}, '', '/dashboard/bookings');
    } else if (paymentStatus === 'error') {
      setPaymentMessage({ type: 'error', text: 'Có lỗi xảy ra khi xử lý thanh toán.' });
      window.history.replaceState({}, '', '/dashboard/bookings');
    }
  };

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
        toast.success('Đã hủy yêu cầu thành công');
        fetchBookings();
      } else {
        toast.error(result.msg || 'Không thể hủy');
      }
    } catch (err) {
      toast.error('Lỗi kết nối');
    } finally {
      setCancellingId(null);
    }
  };

  const handlePayment = async (booking: Booking) => {
    try {
      const response = await fetch(`${API_URL}/payment/create-vnpay-url`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: booking.depositAmount,
        }),
      });

      const result = await response.json();

      if (result.success && result.paymentUrl) {
        // Redirect sang VNPay
        window.location.href = result.paymentUrl;
      } else {
        toast.error(result.message || 'Không thể tạo URL thanh toán');
      }
    } catch (err) {
      toast.error('Lỗi kết nối máy chủ');
    }
  };

  const handleOpenDisputeModal = (booking: Booking) => {
    if (booking.dispute) {
      toast.error('Booking này đã có khiếu nại, không thể gửi thêm!');
      return;
    }
    setSelectedBooking(booking);
    setDisputeReason('');
    setEvidenceImages([]);
    setEvidencePreviews([]);
    setShowDisputeModal(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const totalFiles = evidenceImages.length + newFiles.length;

    if (totalFiles > 5) {
      toast.error('Chỉ được tải lên tối đa 5 ảnh');
      return;
    }

    // Validate file types and sizes
    for (const file of newFiles) {
      if (!file.type.startsWith('image/')) {
        toast.error(`File ${file.name} không phải là ảnh`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} vượt quá 5MB`);
        return;
      }
    }

    setEvidenceImages(prev => [...prev, ...newFiles]);

    // Create previews
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEvidencePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setEvidenceImages(prev => prev.filter((_, i) => i !== index));
    setEvidencePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitDispute = async () => {
    if (!selectedBooking || !disputeReason.trim()) {
      toast.error('Vui lòng nhập lý do khiếu nại');
      return;
    }

    if (selectedBooking.dispute) {
      toast.error('Booking này đã có khiếu nại trước đó!');
      return;
    }

    setSubmittingDispute(true);
    
    try {
      // Create FormData for multipart/form-data
      const formData = new FormData();
      formData.append('bookingId', selectedBooking.id.toString());
      formData.append('reason', disputeReason);

      // Add images if any
      if (evidenceImages.length > 0) {
        setUploadingImages(true);
        evidenceImages.forEach(file => {
          formData.append('images', file);
        });
      }

      // Create dispute with FormData
      const response = await fetch(`${API_URL}/dispute/create`, {
        method: 'POST',
        credentials: 'include',
        body: formData, // Send FormData directly, no Content-Type header needed
      });

      const result = await response.json();
      console.log('Dispute create response:', result);

      if (result.success) {
        toast.success('Gửi khiếu nại thành công! Admin sẽ xem xét trong 24-48h.', {
          duration: 5000,
          icon: '✅',
        });
        setShowDisputeModal(false);
        fetchBookings(); 
      } else {
        const errorMsg = result.msg || result.message || 'Không thể gửi khiếu nại';
        console.error('Dispute error:', result);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('Submit dispute error:', err);
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setSubmittingDispute(false);
      setUploadingImages(false);
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
      <Toaster position="top-center" reverseOrder={false} />
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
        {/* Payment Result Message */}
        {paymentMessage && (
          <div className={`mb-6 p-4 rounded-lg border-2 ${paymentMessage.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' :
              paymentMessage.type === 'failed' ? 'bg-red-50 border-red-500 text-red-800' :
                'bg-orange-50 border-orange-500 text-orange-800'
            }`}>
            <div className="flex items-center justify-between">
              <p className="font-semibold">{paymentMessage.text}</p>
              <button onClick={() => setPaymentMessage(null)} className="text-gray-500 hover:text-gray-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

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
                onPayment={handlePayment}
                onDispute={handleOpenDisputeModal}
                isCancelling={cancellingId === booking.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dispute Modal */}
      {showDisputeModal && selectedBooking && (
        <div
className="
  fixed inset-0 z-50
  bg-gray-900/10 dark:bg-black/25
  flex items-center justify-center
  p-4
"

        >

          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FileWarning className="w-6 h-6 text-orange-600" />
                    Gửi khiếu nại
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">Admin sẽ xem xét trong 24-48h</p>
                </div>
                <button
                  onClick={() => setShowDisputeModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <XCircle className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Booking Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Thông tin đặt phòng</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã đặt phòng:</span>
                    <span className="font-semibold">#{selectedBooking.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phòng:</span>
                    <span className="font-semibold">{selectedBooking.room.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tiền cọc:</span>
                    <span className="font-semibold text-blue-600">{formatCurrency(selectedBooking.depositAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Lý do khiếu nại <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Mô tả chi tiết vấn đề bạn gặp phải (ví dụ: phòng không đúng hình ảnh, thiết bị hỏng, chủ nhà không phản hồi...)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows={6}
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Vui lòng cung cấp thông tin chi tiết để Admin có thể xem xét chính xác
                </p>
              </div>

              {/* Image Upload Section */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Ảnh minh chứng
                </label>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-orange-500 transition">
                  <input
                    type="file"
                    id="evidence-upload"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="evidence-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Upload className="w-10 h-10 text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Nhấp để tải ảnh lên
                    </p>
                  </label>
                </div>

                {/* Image Previews */}
                {evidencePreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {evidencePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Evidence ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Warning */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-orange-800">
                    <p className="font-semibold mb-1">Lưu ý quan trọng:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Mỗi đơn chỉ được khiếu nại 1 lần</li>
                      <li>Admin sẽ xem xét và quyết định trong 24-48h</li>
                      <li>Quyết định của Admin là cuối cùng</li>
                      <li className="font-bold text-red-700">Mọi hành vi cung cấp bằng chứng giả mạo sẽ dẫn đến việc từ chối khiếu nại ngay lập tức và khóa tài khoản vĩnh viễn</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDisputeModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                  disabled={submittingDispute}
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmitDispute}
                  disabled={submittingDispute || uploadingImages || !disputeReason.trim()}
                  className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingImages ? 'Đang tải ảnh...' : submittingDispute ? 'Đang gửi...' : 'Gửi khiếu nại'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function BookingCard({
  booking,
  onCancel,
  onPayment,
  onDispute,
  isCancelling
}: {
  booking: Booking;
  onCancel: (id: number) => void;
  onPayment: (booking: Booking) => void;
  onDispute: (booking: Booking) => void;
  isCancelling: boolean;
}) {
  const statusConfig = STATUS_CONFIG[booking.status];
  const StatusIcon = statusConfig.icon;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
      <div className="md:flex">
        {/* Image */}
        <div className="md:w-64 h-48 md:h-auto relative bg-gray-200 flex-shrink-0">
          {booking.room.images?.[0] ? (
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

          {/* Dispute Status */}
          {booking.dispute && (
            <div className={`border rounded-lg p-3 mb-4 ${booking.dispute.status === 'PENDING' ? 'bg-yellow-50 border-yellow-200' :
                booking.dispute.status === 'RESOLVED_REFUND' ? 'bg-green-50 border-green-200' :
                  'bg-red-50 border-red-200'
              }`}>
              <div className="flex items-center gap-2 mb-2">
                <FileWarning className={`w-4 h-4 ${booking.dispute.status === 'PENDING' ? 'text-yellow-600' :
                    booking.dispute.status === 'RESOLVED_REFUND' ? 'text-green-600' :
                      'text-red-600'
                  }`} />
                <p className="text-xs font-semibold">
                  {booking.dispute.status === 'PENDING' ? ' Khiếu nại đang chờ xử lý' :
                    booking.dispute.status === 'RESOLVED_REFUND' ? ' Khiếu nại được chấp nhận' :
                      ' Khiếu nại bị từ chối'}
                </p>
              </div>
              <p className="text-xs text-gray-700 mb-1">
                <strong>Lý do:</strong> {booking.dispute.reason}
              </p>
              {booking.dispute.adminDecisionNote && (
                <p className="text-xs text-gray-700 mb-1">
                  <strong>Phản hồi Admin:</strong> {booking.dispute.adminDecisionNote}
                </p>
              )}
              {booking.dispute.refundAmount > 0 && (
                <p className="text-xs font-semibold text-green-700">
                  Số tiền hoàn: {formatCurrency(booking.dispute.refundAmount)}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {booking.status === 'APPROVED' && (
              <button
                onClick={() => onPayment(booking)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
              >
                <CreditCard className="w-4 h-4" />
                Thanh toán cọc
              </button>
            )}

            {booking.status === 'CONFIRMED' && !booking.dispute && (
              <button
                onClick={() => onDispute(booking)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition"
              >
                <FileWarning className="w-4 h-4" />
                Khiếu nại
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
