'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  ArrowUpRight,
  Home,
  CalendarCheck,
  RefreshCw,
  ChevronRight,
  DollarSign,
  BarChart3,
  HelpCircle,
  Target,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  Plus,
} from 'lucide-react';

interface HostStats {
  totalRevenue: number;
  viewingRequests: number;
  conversionRate: number;
}

interface ChartData {
  labels: string[];
  values: number[];
}

interface TopListing {
  roomId: number;
  roomName: string;
  totalViews: number;
  totalBookings: number;
}

const formatCurrency = (amount: number) => {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)} tỷ`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)} triệu`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`;
  }
  return amount.toString();
};

const formatFullCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

// Tooltip component để giải thích chỉ số
const Tooltip = ({ text }: { text: string }) => (
  <div className="group relative inline-flex ml-1.5">
    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-normal w-48 text-center z-50 shadow-lg">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
    </div>
  </div>
);

export default function HostDashboardOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState<HostStats | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [topListings, setTopListings] = useState<TopListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, chartRes, topRes] = await Promise.all([
        fetch(`${API_URL}/host-dashboard/stats`, { credentials: 'include' }),
        fetch(`${API_URL}/host-dashboard/chart?year=${selectedYear}`, { credentials: 'include' }),
        fetch(`${API_URL}/host-dashboard/top-listings?limit=5`, { credentials: 'include' }),
      ]);

      const [statsData, chartDataRes, topData] = await Promise.all([
        statsRes.json(),
        chartRes.json(),
        topRes.json(),
      ]);

      setStats(statsData);
      setChartData(chartDataRes);
      setTopListings(topData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, selectedYear]);

  const chartValues = chartData?.values && Array.isArray(chartData.values) ? chartData.values : [];
  const maxChartValue = chartValues.length > 0 ? Math.max(...chartValues, 1) : 1;
  const totalYearRevenue = chartValues.reduce((a, b) => a + b, 0);
  const avgMonthRevenue = chartValues.filter(v => v > 0).length > 0 
    ? totalYearRevenue / chartValues.filter(v => v > 0).length 
    : 0;
  const currentMonth = new Date().getMonth();
  const lastMonthRevenue = chartValues[currentMonth - 1] || 0;
  const thisMonthRevenue = chartValues[currentMonth] || 0;
  const revenueChange = lastMonthRevenue > 0 
    ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
    : 0;

  // Tính số booking từ top listings
  const totalBookings = topListings.reduce((sum, item) => sum + item.totalBookings, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Tổng quan
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Xin chào, {user?.fullName || 'Host'}! Đây là tình hình kinh doanh của bạn.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/room/post"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
              >
                <Plus className="w-4 h-4" />
                Đăng tin mới
              </Link>
              <button
                onClick={fetchDashboardData}
                disabled={loading}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                title="Làm mới dữ liệu"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-6 space-y-6">
        {/* Stats Cards - 4 cột */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tổng doanh thu */}
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-sm text-gray-500">Tổng doanh thu</p>
                  <Tooltip text="Tổng số tiền cọc bạn đã nhận được từ các giao dịch thành công" />
                </div>
                {loading ? (
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-28 mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(stats?.totalRevenue || 0)}đ
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Tiền cọc đã nhận
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Lượt xem */}
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-sm text-gray-500">Lượt xem</p>
                  <Tooltip text="Tổng số lần khách hàng xem chi tiết các tin đăng của bạn" />
                </div>
                {loading ? (
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-20 mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {(stats?.viewingRequests || 0).toLocaleString('vi-VN')}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Tất cả tin đăng
                </p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>

          {/* Tỷ lệ chuyển đổi */}
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-sm text-gray-500">Tỷ lệ chuyển đổi</p>
                  <Tooltip text="Phần trăm khách xem tin và đặt cọc thành công. Tỷ lệ cao = tin hấp dẫn!" />
                </div>
                {loading ? (
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-16 mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats?.conversionRate || 0}%
                  </p>
                )}
                {/* Mini progress bar */}
                <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((stats?.conversionRate || 0) * 10, 100)}%` }}
                  />
                </div>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>

          {/* Số booking */}
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-sm text-gray-500">Booking thành công</p>
                  <Tooltip text="Tổng số đơn đặt phòng đã được xác nhận và thanh toán" />
                </div>
                {loading ? (
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-12 mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {totalBookings}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Đơn xác nhận
                </p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Biểu đồ doanh thu - Bar Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Doanh thu theo tháng</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Biểu đồ thể hiện tiền cọc nhận được mỗi tháng
                </p>
              </div>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[2024, 2025, 2026].map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Summary */}
            <div className="flex items-center gap-6 mb-5 pb-5 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Tổng năm</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(totalYearRevenue)}đ</p>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Trung bình/tháng</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(avgMonthRevenue)}đ</p>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">So với tháng trước</p>
                <p className={`text-lg font-bold flex items-center gap-1 ${revenueChange >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {revenueChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {revenueChange >= 0 ? '+' : ''}{revenueChange.toFixed(1)}%
                </p>
              </div>
            </div>

            {loading ? (
              <div className="h-52 bg-gray-100 rounded-lg animate-pulse" />
            ) : chartValues.every(v => v === 0) ? (
              <div className="h-52 flex flex-col items-center justify-center text-center">
                <BarChart3 className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">Chưa có dữ liệu doanh thu</p>
                <p className="text-sm text-gray-400 mt-1">Dữ liệu sẽ hiển thị khi có giao dịch thành công</p>
              </div>
            ) : (
              <div className="h-52 flex items-end gap-1.5">
                {chartValues.map((value, index) => {
                  const height = maxChartValue > 0 ? (value / maxChartValue) * 100 : 0;
                  const isCurrentMonth = index === currentMonth && selectedYear === new Date().getFullYear();
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1.5 group">
                      <div className="w-full relative">
                        <div
                          className={`w-full rounded transition-all duration-300 cursor-pointer ${
                            isCurrentMonth 
                              ? 'bg-blue-600 hover:bg-blue-700' 
                              : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                          style={{ height: `${Math.max(height, 2)}%`, minHeight: '4px' }}
                        />
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-10">
                          <span className="font-medium">Tháng {index + 1}:</span> {formatFullCurrency(value)}
                        </div>
                      </div>
                      <span className={`text-[10px] font-medium ${isCurrentMonth ? 'text-blue-600' : 'text-gray-400'}`}>
                        {index + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tỷ lệ chuyển đổi - Donut Chart */}
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Hiệu suất chuyển đổi</h2>
            <p className="text-sm text-gray-500 mb-5">Tỷ lệ khách xem → đặt phòng</p>

            {loading ? (
              <div className="flex flex-col items-center py-6">
                <div className="w-32 h-32 bg-gray-100 rounded-full animate-pulse" />
              </div>
            ) : (
              <div className="flex flex-col items-center py-4">
                {/* Donut Chart */}
                <div className="relative w-36 h-36">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50" cy="50" r="40"
                      fill="none"
                      stroke="#f3f4f6"
                      strokeWidth="12"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="50" cy="50" r="40"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${(stats?.conversionRate || 0) * 2.51} 251`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  {/* Center text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">{stats?.conversionRate || 0}%</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-5 space-y-2 w-full">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-600">
                      <Eye className="w-4 h-4" />
                      Lượt xem
                    </span>
                    <span className="font-semibold text-gray-900">{(stats?.viewingRequests || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-4 h-4" />
                      Booking thành công
                    </span>
                    <span className="font-semibold text-gray-900">{totalBookings}</span>
                  </div>
                </div>

                {/* Rating */}
                <div className="mt-4 pt-4 border-t border-gray-100 w-full text-center">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                    (stats?.conversionRate || 0) >= 5 ? 'bg-green-50 text-green-700' :
                    (stats?.conversionRate || 0) >= 2 ? 'bg-blue-50 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {(stats?.conversionRate || 0) >= 5 ? 'Xuất sắc' :
                     (stats?.conversionRate || 0) >= 2 ? 'Tốt' : 'Cần cải thiện'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top Listings & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Listings */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Phòng hiệu quả nhất</h2>
                <p className="text-sm text-gray-500 mt-0.5">Xếp hạng theo lượt xem và booking</p>
              </div>
              <Link
                href="/dashboard/host/rooms"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Xem tất cả
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <div className="p-5 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : topListings.length === 0 ? (
              <div className="p-8 text-center">
                <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Chưa có tin đăng nào</p>
                <Link
                  href="/room/post"
                  className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Đăng tin đầu tiên
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {topListings.map((listing, index) => {
                  const convRate = listing.totalViews > 0 
                    ? ((listing.totalBookings / listing.totalViews) * 100).toFixed(1) 
                    : '0';
                  const viewPercent = stats?.viewingRequests 
                    ? (listing.totalViews / stats.viewingRequests) * 100 
                    : 0;
                  return (
                    <Link
                      key={listing.roomId}
                      href={`/rooms/${listing.roomId}`}
                      className="flex items-center gap-4 p-4 hover:bg-gray-50 transition group"
                    >
                      {/* Rank */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-200 text-gray-600' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {index + 1}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition">
                          {listing.roomName}
                        </p>
                        {/* Progress bar for views */}
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${Math.min(viewPercent, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 w-12 text-right">{viewPercent.toFixed(0)}%</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <p className="font-semibold text-gray-900">{listing.totalViews.toLocaleString()}</p>
                          <p className="text-xs text-gray-400">lượt xem</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-gray-900">{listing.totalBookings}</p>
                          <p className="text-xs text-gray-400">booking</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-blue-600">{convRate}%</p>
                          <p className="text-xs text-gray-400">chuyển đổi</p>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
              <div className="space-y-2">
                <Link
                  href="/room/post"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition group"
                >
                  <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Plus className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Đăng tin mới</p>
                    <p className="text-xs text-gray-500">Thêm phòng cho thuê</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>

                <Link
                  href="/dashboard/host/rooms"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition group"
                >
                  <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Home className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Quản lý phòng</p>
                    <p className="text-xs text-gray-500">Xem & chỉnh sửa tin</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>

                <Link
                  href="/dashboard/host/bookings"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition group"
                >
                  <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                    <CalendarCheck className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Yêu cầu thuê</p>
                    <p className="text-xs text-gray-500">Xử lý booking</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>

                <Link
                  href="/dashboard/host/analytics"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition group"
                >
                  <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Thống kê chi tiết</p>
                    <p className="text-xs text-gray-500">Phân tích chuyên sâu</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}
