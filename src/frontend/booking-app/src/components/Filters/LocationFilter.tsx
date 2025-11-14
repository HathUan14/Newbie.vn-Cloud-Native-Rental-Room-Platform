'use client';

import { useState } from 'react';

interface LocationFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const LOCATIONS = [
  'Quận 1',
  'Quận 2',
  'Quận 3',
  'Quận 4',
  'Quận 5',
  'Quận 6',
  'Quận 7',
  'Quận 8',
  'Quận 9',
  'Quận 10',
  'Quận 11',
  'Quận 12',
  'Thủ Đức',
  'Bình Thạnh',
  'Tân Bình',
  'Tân Phú',
  'Phú Nhuận',
  'Gò Vấp',
  'Bình Tân',
];

export default function LocationFilter({ value, onChange }: LocationFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredLocations = LOCATIONS.filter((loc) =>
    loc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:border-gray-400 transition bg-white"
      >
        <span className="text-sm font-medium"> Vị trí</span>
        {value && (
          <span className="text-xs text-gray-600">{value}</span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50">
            <h3 className="text-lg font-semibold mb-4">Chọn vị trí</h3>
            
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm quận, huyện..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            />

            <div className="max-h-96 overflow-y-auto space-y-1">
              {filteredLocations.map((location) => (
                <button
                  key={location}
                  onClick={() => {
                    onChange(location);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-lg transition ${
                    value === location
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {location}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className="w-full mt-4 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              Xóa bộ lọc
            </button>
          </div>
        </>
      )}
    </div>
  );
}