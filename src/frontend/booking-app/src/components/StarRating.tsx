'use client';

import { Star } from "lucide-react"; // dùng star trong comment

// Rating dùng Star
export default  function StarRating({
    value,
    onChange,
    readonly = false,
  }: {
    value: number;
    onChange?: (v: number) => void;
    readonly?: boolean;
  }) {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 cursor-pointer ${
              value >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            }`}
            onClick={() => !readonly && onChange?.(star)}
          />
        ))}
      </div>
    );
  }