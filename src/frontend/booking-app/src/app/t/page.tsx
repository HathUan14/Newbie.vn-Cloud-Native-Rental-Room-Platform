'use client';

import Link from 'next/link';
import { CheckCircle, Home, FileText, ChevronRight } from 'lucide-react';

export default function PaymentSuccessPage() {
  // Dữ liệu giả lập (Sau này bạn sẽ lấy từ params hoặc API)
  const transactionDetails = {
    id: "BK-2025-8892",
    roomName: "Studio in Thủ Đức",
    address: "Làng Đại học, TP. Thủ Đức, TP.HCM",
    amount: "1.500.000 VND",
    method: "Ví MoMo",
    time: "13/12/2025 - 20:45",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- Header / Navbar (Giả lập giống screenshot) --- */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full text-white flex items-center justify-center font-bold">N</div>
                <span className="text-xl font-bold text-blue-600">Newbie<span className="text-xs text-gray-500">.com</span></span>
            </div>
            <div className="flex items-center gap-4">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">Cho thuê phòng</button>
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">N</div>
            </div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="max-w-3xl mx-auto pt-10 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Section 1: Success Indicator */}
          <div className="text-center pt-12 pb-8 px-8">
            <div className="flex justify-center mb-6">
              <CheckCircle className="w-24 h-24 text-green-500 animate-bounce-short" strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Đặt cọc thành công!
            </h1>
            <p className="text-gray-500 text-lg max-w-lg mx-auto">
              Vui lòng liên hệ chủ nhà và kiểm tra email để biết thêm chi tiết.
            </p>
          </div>

          {/* Section 2: Transaction Details Card */}
          <div className="px-8 pb-8">
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 max-w-lg mx-auto">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
                Chi tiết giao dịch
              </h3>
              
              <div className="space-y-4 text-sm sm:text-base">
                <div className="flex justify-between items-start">
                  <span className="text-gray-500">Mã đặt chỗ</span>
                  <span className="font-medium text-gray-900">{transactionDetails.id}</span>
                </div>

                <div className="flex justify-between items-start">
                  <span className="text-gray-500">Phòng thuê</span>
                  <div className="text-right">
                    <span className="block font-medium text-gray-900">{transactionDetails.roomName}</span>
                    <span className="block text-xs text-gray-400 mt-1 max-w-[200px] truncate">{transactionDetails.address}</span>
                  </div>
                </div>

                <div className="flex justify-between items-start">
                  <span className="text-gray-500">Thời gian</span>
                  <span className="font-medium text-gray-900">{transactionDetails.time}</span>
                </div>

                <div className="flex justify-between items-start">
                  <span className="text-gray-500">Phương thức</span>
                  <span className="font-medium text-gray-900 flex items-center gap-1">
                     {transactionDetails.method}
                  </span>
                </div>

                <div className="border-t border-gray-200 border-dashed my-2 pt-2">
                    <div className="flex justify-between items-center">
                    <span className="text-gray-900 font-semibold">Tổng thanh toán</span>
                    <span className="text-2xl font-bold text-blue-600">{transactionDetails.amount}</span>
                    </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Action Buttons */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/my-bookings" className="w-full sm:w-auto">
                <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg">
                    <FileText className="w-5 h-5" />
                    Xem Đặt phòng của tôi
                </button>
            </Link>
            
            <Link href="/" className="w-full sm:w-auto">
                <button className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-8 py-3.5 rounded-lg font-semibold transition-all">
                    <Home className="w-5 h-5" />
                    Về Trang chủ
                </button>
            </Link>
          </div>

        </div>

        {/* Footer Support Text */}
        <p className="text-center text-gray-400 text-sm mt-8">
            Cần hỗ trợ? Liên hệ <a href="#" className="text-blue-600 hover:underline">CSKH Newbie</a> hoặc gọi 0973277984
        </p>
      </main>
    </div>
  );
}