'use client';

import StarRating from '@/components/StarRating';
import { useState } from 'react';

type Review = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  reviewer: {
    id: number;
    fullName: string;
    avatarUrl?: string | null;
  };
};

type Props = {
  currentUser: any;
  hostId: number;
  myReview: Review | null;
  myRating: number;
  setMyRating: (v: number) => void;
  myComment: string;
  setMyComment: (v: string) => void;
  isSubmittingReview: boolean;
  reviews: Review[];
  onSubmitReview: () => void;
  onUpdateReview: (reviewId: number) => void;
};

export default function ReviewSection({
  currentUser,
  hostId,
  myReview,
  myRating,
  setMyRating,
  myComment,
  setMyComment,
  isSubmittingReview,
  reviews,
  onSubmitReview,
  onUpdateReview,
}: Props) {

    const [isEditingReview, setIsEditingReview] = useState(false);
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">
        Đánh giá về chủ nhà
      </h3>

      {/* My Review */}
      <div className="mb-8">
        <h4 className="font-semibold text-gray-800 mb-3">
          { currentUser.id == hostId ? 'Bạn là chủ nhà' :
            myReview ? 'Đánh giá của bạn' : 'Viết đánh giá'
          }
        </h4>

        {/* Nếu đã tồn tại comment rổi thì chỉ có thể chỉnh sửa, nếu chưa thì có thể post comment mới  */}
        {/* Nếu là host thì không thể bình luận hay chỉnh sửa */}
        {currentUser ? (
            currentUser.id === hostId ? (   
                <p className="text-sm text-gray-500">
                    Hãy quan tâm đến cảm nghĩ của khách hàng nhé.
                </p>
            ) :
            // Editing
            myReview ? (
            <div className="flex gap-4 p-4 bg-gray-50 rounded-xl border">
              {myReview.reviewer.avatarUrl ? (
                <img
                  src={myReview.reviewer.avatarUrl}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling;
                    if (fallback) (fallback as HTMLElement).style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center flex-shrink-0"
                style={{ display: myReview.reviewer.avatarUrl ? 'none' : 'flex' }}
              >
                <span className="text-white text-sm font-medium">
                  {myReview.reviewer.fullName?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">
                    {myReview.reviewer.fullName}
                  </p>
                  <span className="text-sm text-gray-500">
                    {new Date(myReview.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* View Mode (trước khi edit) */}
                {!isEditingReview && (
                <>
                    <StarRating value={myReview.rating} readonly />

                    <p className="text-gray-700 mt-2 text-sm">
                    {myReview.comment}
                    </p>

                    <button
                    onClick={() => {
                        setIsEditingReview(true);
                        setMyRating(myReview.rating);
                        setMyComment(myReview.comment);
                    }}
                    className="text-sm text-blue-600 mt-2 hover:underline"
                    >
                    Chỉnh sửa
                    </button>
                </>
                )}
                {/* Edit mode (Vào trạng thái edit) */}
                {isEditingReview && (
                <div className="mt-3 space-y-3">
                    <StarRating value={myRating} onChange={setMyRating} />

                    <textarea
                    value={myComment}
                    onChange={(e) => setMyComment(e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <div className="flex gap-3">
                    <button
                        onClick={() => {
                        onUpdateReview(myReview.id); // gọi API PATCH
                        setIsEditingReview(false);
                        }}
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700"
                    >
                        Cập nhật
                    </button>

                    <button
                        onClick={() => {
                        setIsEditingReview(false);
                        setMyRating(myReview.rating);
                        setMyComment(myReview.comment);
                        }}
                        className="px-4 py-2 rounded-xl border text-sm text-gray-600 hover:bg-gray-100"
                    >
                        Hủy
                    </button>
                    </div>
                </div>
                )}

              </div>
            </div>
          ) : ( // Submitting
            <div className="space-y-4">
              <StarRating value={myRating} onChange={setMyRating} />

              <textarea
                value={myComment}
                onChange={(e) => setMyComment(e.target.value)}
                rows={4}
                placeholder="Chia sẻ trải nghiệm của bạn về chủ nhà..."
                className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />

              <button
                onClick={onSubmitReview}
                disabled={isSubmittingReview || myRating === 0}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Gửi đánh giá
              </button>
            </div>
          )
        ) : (
          <p className="text-sm text-gray-500">
            Vui lòng đăng nhập để đánh giá chủ nhà.
          </p>
        )}
      </div>

      {/* Other Reviews */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-4">
          Đánh giá từ người khác
        </h4>

        {reviews.length === 0 ? (
          <p className="text-gray-500 text-sm">
            Chưa có đánh giá nào.
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="flex gap-4 p-4 rounded-xl border border-gray-100"
              >
                {review.reviewer.avatarUrl ? (
                  <img
                    src={review.reviewer.avatarUrl}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling;
                      if (fallback) (fallback as HTMLElement).style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center flex-shrink-0"
                  style={{ display: review.reviewer.avatarUrl ? 'none' : 'flex' }}
                >
                  <span className="text-white text-sm font-medium">
                    {review.reviewer.fullName?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-gray-900">
                      {review.reviewer.fullName}
                    </p>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <StarRating value={review.rating} readonly />

                  <p className="text-gray-700 mt-2 text-sm">
                    {review.comment}
                  </p>
                </div>
              </div>
            ))}

            {/* 🔮 Pagination placeholder */}
            {/* <ReviewPagination /> */}
          </div>
        )}
      </div>
    </div>
  );
}
