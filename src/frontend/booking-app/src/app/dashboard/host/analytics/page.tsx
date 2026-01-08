'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  DollarSign,
  CalendarCheck,
  Home,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
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
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export default function HostAnalyticsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<HostStats | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [topListings, setTopListings] = useState<TopListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [comparisonYear, setComparisonYear] = useState(new Date().getFullYear() - 1);
  const [previousYearData, setPreviousYearData] = useState<ChartData | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, chartRes, prevChartRes, topRes] = await Promise.all([
        fetch(`${API_URL}/host-dashboard/stats`, { credentials: 'include' }),
        fetch(`${API_URL}/host-dashboard/chart?year=${selectedYear}`, { credentials: 'include' }),
        fetch(`${API_URL}/host-dashboard/chart?year=${comparisonYear}`, { credentials: 'include' }),
        fetch(`${API_URL}/host-dashboard/top-listings?limit=10`, { credentials: 'include' }),
      ]);

      const [statsData, chartDataRes, prevChartDataRes, topData] = await Promise.all([
        statsRes.json(),
        chartRes.json(),
        prevChartRes.json(),
        topRes.json(),
      ]);

      setStats(statsData);
      setChartData(chartDataRes);
      setPreviousYearData(prevChartDataRes);
      setTopListings(topData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user, selectedYear]);

  // Calculate year-over-year growth
  const currentTotal = chartData?.values.reduce((a, b) => a + b, 0) || 0;
  const previousTotal = previousYearData?.values.reduce((a, b) => a + b, 0) || 0;
  const yoyGrowth = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

  // Find best month
  const maxRevenueMonth = chartData 
    ? chartData.values.indexOf(Math.max(...chartData.values))
    : -1;

  const maxChartValue = chartData ? Math.max(...chartData.values, 1) : 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Thống kê chi tiết</h1>
              <p className="text-slate-500 mt-1">
                Phân tích hiệu suất cho thuê của bạn
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[2024, 2025, 2026].map((year) => (
                  <option key={year} value={year}>Năm {year}</option>
                ))}
              </select>
              <button
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-8 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              {yoyGrowth !== 0 && (
                <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  yoyGrowth > 0 ? 'text-blue-600 bg-blue-50' : 'text-red-600 bg-red-50'
                }`}>
                  {yoyGrowth > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(yoyGrowth).toFixed(1)}%
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">Tổng doanh thu năm {selectedYear}</p>
            {loading ? (
              <div className="h-8 bg-slate-200 rounded animate-pulse w-32" />
            ) : (
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(currentTotal)}</p>
            )}
          </div>

          {/* Total Views */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                <Activity className="w-3 h-3" />
                Tổng
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">Lượt xem phòng</p>
            {loading ? (
              <div className="h-8 bg-slate-200 rounded animate-pulse w-24" />
            ) : (
              <p className="text-2xl font-bold text-slate-900">
                {(stats?.viewingRequests || 0).toLocaleString('vi-VN')}
              </p>
            )}
          </div>

          {/* Conversion Rate */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <PieChart className="w-6 h-6 text-purple-600" />
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                <BarChart3 className="w-3 h-3" />
                Tỷ lệ
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">Tỷ lệ chuyển đổi</p>
            {loading ? (
              <div className="h-8 bg-slate-200 rounded animate-pulse w-20" />
            ) : (
              <p className="text-2xl font-bold text-slate-900">{stats?.conversionRate || 0}%</p>
            )}
          </div>

          {/* Best Month */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <CalendarCheck className="w-6 h-6 text-amber-600" />
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3" />
                Top
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">Tháng hiệu quả nhất</p>
            {loading ? (
              <div className="h-8 bg-slate-200 rounded animate-pulse w-28" />
            ) : (
              <p className="text-2xl font-bold text-slate-900">
                {maxRevenueMonth >= 0 ? `Tháng ${maxRevenueMonth + 1}` : 'Chưa có'}
              </p>
            )}
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Biểu đồ doanh thu</h2>
              <p className="text-sm text-slate-500">So sánh doanh thu theo tháng</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-sm text-slate-600">{selectedYear}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-300 rounded-full" />
                <span className="text-sm text-slate-600">{comparisonYear}</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="h-80 bg-slate-100 rounded-xl animate-pulse" />
          ) : (
            <div className="h-80">
              <div className="h-full flex items-end gap-2 pb-8 relative">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-8 w-16 flex flex-col justify-between text-xs text-slate-500">
                  <span>{formatCurrency(maxChartValue)}</span>
                  <span>{formatCurrency(maxChartValue * 0.75)}</span>
                  <span>{formatCurrency(maxChartValue * 0.5)}</span>
                  <span>{formatCurrency(maxChartValue * 0.25)}</span>
                  <span>0</span>
                </div>

                {/* Chart bars */}
                <div className="flex-1 h-full flex items-end gap-2 ml-20">
                  {chartData?.values.map((value, index) => {
                    const height = maxChartValue > 0 ? (value / maxChartValue) * 100 : 0;
                    const prevValue = previousYearData?.values[index] || 0;
                    const prevHeight = maxChartValue > 0 ? (prevValue / maxChartValue) * 100 : 0;

                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="w-full flex items-end justify-center gap-1 h-full">
                          {/* Previous year bar */}
                          <div className="relative w-1/3">
                            <div
                              className="w-full bg-slate-200 rounded-t-lg transition-all duration-300"
                              style={{ height: `${Math.max(prevHeight, 2)}%`, minHeight: '4px' }}
                            />
                          </div>
                          {/* Current year bar */}
                          <div className="relative w-1/3">
                            <div
                              className="w-full bg-blue-500 rounded-t-lg transition-all duration-300 hover:bg-blue-600 cursor-pointer"
                              style={{ height: `${Math.max(height, 2)}%`, minHeight: '4px' }}
                            />
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                              <p className="font-bold">{chartData?.labels[index]}</p>
                              <p className="text-blue-400">{selectedYear}: {formatCurrency(value)}</p>
                              <p className="text-slate-400">{comparisonYear}: {formatCurrency(prevValue)}</p>
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-medium text-slate-500">
                          T{index + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top Listings Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Bảng xếp hạng phòng</h2>
            <p className="text-sm text-slate-500">Phòng có hiệu suất tốt nhất của bạn</p>
          </div>

          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : topListings.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500">Chưa có dữ liệu thống kê</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Xếp hạng
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Tên phòng
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Lượt xem
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Bookings
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Tỷ lệ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topListings.map((listing, index) => {
                    const convRate = listing.totalViews > 0 
                      ? ((listing.totalBookings / listing.totalViews) * 100).toFixed(1)
                      : '0';
                    return (
                      <tr key={listing.roomId} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                          <div className={`
                            w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm
                            ${index === 0 ? 'bg-amber-100 text-amber-700' : 
                              index === 1 ? 'bg-slate-200 text-slate-600' : 
                              index === 2 ? 'bg-orange-100 text-orange-700' : 
                              'bg-slate-100 text-slate-500'}
                          `}>
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <a
                            href={`/rooms/${listing.roomId}`}
                            className="font-medium text-slate-900 hover:text-blue-600 transition"
                          >
                            {listing.roomName}
                          </a>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <Eye className="w-4 h-4 text-slate-400" />
                            <span className="font-medium text-slate-700">
                              {listing.totalViews.toLocaleString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 font-medium text-sm rounded-full">
                            {listing.totalBookings}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`font-medium ${
                            Number(convRate) > 5 ? 'text-blue-600' : 
                            Number(convRate) > 2 ? 'text-amber-600' : 'text-slate-500'
                          }`}>
                            {convRate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
