"use client";

import { useState } from "react";

export default function Home() {
  const [filters, setFilters] = useState({
    city: "",
    priceRange: "",
    type: "",
    areaRange: "",
  });

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const cities = [
    "Hà Nội",
    "TP. Hồ Chí Minh",
    "Đà Nẵng",
    "Cần Thơ",
    "Hải Phòng",
    "Nha Trang",
  ];

  const roomTypes = ["Phòng trọ", "Căn hộ", "Nhà nguyên căn"];

  const priceRanges = [
    "Dưới 3 triệu",
    "3 – 5 triệu",
    "5 – 10 triệu",
    "Trên 10 triệu",
  ];

  const areaRanges = [
    "Dưới 20 m²",
    "20 – 40 m²",
    "40 – 60 m²",
    "Trên 60 m²",
  ];

  const handleSelect = (field: string, value: string) => {
    setFilters({ ...filters, [field]: value });
    setOpenDropdown(null);
  };

  const handleSearch = () => {
    console.log("Tìm kiếm với:", filters);
    // TODO: Gọi API tìm kiếm
  };

  const dropdownClass =
    "absolute mt-1 w-full bg-white border rounded-xl shadow-lg z-20 overflow-hidden";

  const dropdownItemClass =
    "px-4 py-2 hover:bg-blue-50 transition cursor-pointer";

  const inputBoxClass =
    "border rounded-xl px-4 py-2 bg-white cursor-pointer shadow-sm hover:shadow-md transition-all text-gray-800";

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col items-center px-6 py-16">

      {/* Thanh tìm kiếm */}
      <div className="w-full max-w-5xl bg-white/80 backdrop-blur-md shadow-2xl rounded-3xl p-6 flex flex-wrap items-end justify-between gap-4 border border-gray-200">
        {/* Thành phố */}
        <div className="relative flex-1 min-w-[180px]">
          <span className="block text-gray-600 font-medium mb-1">Vị trí</span>
          <div
            className={inputBoxClass}
            onClick={() =>
              setOpenDropdown(openDropdown === "city" ? null : "city")
            }
          >
            {filters.city || "Chọn thành phố"}
          </div>
          {openDropdown === "city" && (
            <div className={dropdownClass}>
              {cities.map((city) => (
                <div
                  key={city}
                  className={dropdownItemClass}
                  onClick={() => handleSelect("city", city)}
                >
                  {city}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Giá tiền */}
        <div className="relative flex-1 min-w-[180px]">
          <span className="block text-gray-600 font-medium mb-1">
            Giá tiền (triệu VNĐ)
          </span>
          <div
            className={inputBoxClass}
            onClick={() =>
              setOpenDropdown(openDropdown === "price" ? null : "price")
            }
          >
            {filters.priceRange || "Chọn khoảng giá"}
          </div>
          {openDropdown === "price" && (
            <div className={dropdownClass}>
              {priceRanges.map((range) => (
                <div
                  key={range}
                  className={dropdownItemClass}
                  onClick={() => handleSelect("priceRange", range)}
                >
                  {range}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Loại phòng */}
        <div className="relative flex-1 min-w-[180px]">
          <span className="block text-gray-600 font-medium mb-1">
            Loại phòng
          </span>
          <div
            className={inputBoxClass}
            onClick={() =>
              setOpenDropdown(openDropdown === "type" ? null : "type")
            }
          >
            {filters.type || "Chọn loại phòng"}
          </div>
          {openDropdown === "type" && (
            <div className={dropdownClass}>
              {roomTypes.map((t) => (
                <div
                  key={t}
                  className={dropdownItemClass}
                  onClick={() => handleSelect("type", t)}
                >
                  {t}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Diện tích */}
        <div className="relative flex-1 min-w-[180px]">
          <span className="block text-gray-600 font-medium mb-1">
            Diện tích (m²)
          </span>
          <div
            className={inputBoxClass}
            onClick={() =>
              setOpenDropdown(openDropdown === "area" ? null : "area")
            }
          >
            {filters.areaRange || "Chọn diện tích"}
          </div>
          {openDropdown === "area" && (
            <div className={dropdownClass}>
              {areaRanges.map((range) => (
                <div
                  key={range}
                  className={dropdownItemClass}
                  onClick={() => handleSelect("areaRange", range)}
                >
                  {range}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nút tìm kiếm */}
        <div className="min-w-[150px] flex justify-center">
          <button
            onClick={handleSearch}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-6 py-3 transition-all duration-200 shadow-md"
          >
            Tìm kiếm
          </button>
        </div>
      </div>
    </main>
  );
}
