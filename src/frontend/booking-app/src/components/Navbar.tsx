"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const { user, logout } = useAuth();
  const isAuthenticated = !!user;
  const handleHostClick = () => {
    if (isAuthenticated) {
      router.push("/room/post");
    } else {
      router.push("/login?redirect=/room/post");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
      setIsMenuOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Image
                src="/logo.png"
                alt="BookingApp Logo"
                width={150}
                height={60}
                className="h-full w-auto"
                priority
              />
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-6">
            <button
              onClick={handleHostClick}
              className="px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-150 shadow-sm"
            >
              Cho thuê phòng
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-gray-50 transition-colors border border-gray-300"
                >
                  <svg
                    className="h-5 w-5 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                  {user?.avatarUrl ? (

                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="h-8 w-8 rounded-full object-cover border border-gray-200"
                    />
                  ) : (

                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center border border-transparent">
                      <span className="text-white text-sm font-medium">
                        {user?.fullName?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 min-w-[256px] bg-white rounded-lg shadow-xl py-2 border border-gray-200">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-l font-semibold text-gray-900 truncate">
                        {user?.fullName}
                      </p>
                      <p className="text-l text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-l text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        Hồ sơ
                      </div>
                    </Link>
                    <Link
                      href="dashboard/bookings"
                      className="block px-4 py-2 text-l text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        Đặt phòng của tôi
                      </div>
                    </Link>

                    <Link
                      href="/watchlist"
                      className="block px-4 py-2 text-l text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
                          />
                        </svg>
                        Yêu thích
                      </div>
                    </Link>

   
                    <hr className="my-2" />
                    <Link
                      href="/dashboard/my-rooms"
                      className="block px-4 py-2 text-l text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        Quản lý phòng
                      </div>
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-l text-red-600 hover:bg-red-50 transition-colors whitespace-nowrap"
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Đăng xuất
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>


        </div>
      </div>
    </nav>
  );
}
