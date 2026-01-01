'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { BookingCard } from '@/components/BookingCard';

// Icons tối giản
const Icons = {
    Home: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    Plus: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
    List: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>,
    Mail: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    Clock: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    UserRequest: () => (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 13l2 2m0 0l2-2m-2 2v6" />
        </svg>
    )
};

export default function MyRoomsDashboard() {
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const [activeView, setActiveView] = useState<'rooms' | 'bookings'>('rooms');
    const [posts, setPosts] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [roomToDelete, setRoomToDelete] = useState<{ id: number; title: string } | null>(null);
    const [processingBookingId, setProcessingBookingId] = useState<number | null>(null);

    const statusMsg = searchParams.get('status');

    useEffect(() => {
        const fetchMyRooms = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
                const res = await fetch(`${API_URL}/rooms/my-rooms`, { credentials: 'include' });
                const data = await res.json();
                if (data.success) setPosts(data.data);
            } catch (error) {
                toast.error("Không thể tải danh sách");
            } finally { setLoading(false); }
        };
        if (user) fetchMyRooms();
    }, [user]);

    const fetchBookings = async () => {
        if (!user) return;
        setBookingsLoading(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const res = await fetch(`${API_URL}/booking/host-bookings`, {
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                setBookings(data.data);
            } else {
                toast.error(data.msg || 'Không thể tải danh sách booking');
            }
        } catch (error) {
            toast.error('Lỗi khi tải booking');
        } finally {
            setBookingsLoading(false);
        }
    };

    useEffect(() => {
        if (activeView === 'bookings') {
            fetchBookings();
        }
    }, [activeView, user]);

    const handleDelete = (roomId: number, roomTitle: string) => {
        setRoomToDelete({ id: roomId, title: roomTitle });
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!roomToDelete) return;

        try {
            setDeletingId(roomToDelete.id);
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const res = await fetch(`${API_URL}/rooms/${roomToDelete.id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await res.json();

            if (res.ok && data.success) {
                toast.success('Đã xóa phòng thành công!');
                setPosts(posts.filter(p => p.id !== roomToDelete.id));
                setIsDeleteModalOpen(false);
                setRoomToDelete(null);
            } else {
                toast.error(data.message || 'Không thể xóa phòng');
            }
        } catch (error) {
            console.error(error);
            toast.error('Lỗi khi xóa phòng');
        } finally {
            setDeletingId(null);
        }
    };

    const cancelDelete = () => {
        setIsDeleteModalOpen(false);
        setRoomToDelete(null);
    };

    const handleApproveBooking = async (bookingId: number) => {
        setProcessingBookingId(bookingId);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const res = await fetch(`${API_URL}/booking/host-process/${bookingId}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'APPROVED' }),
            });
            const result = await res.json();
            if (result.success) {
                toast.success('Đã chấp nhận yêu cầu');
                fetchBookings();
            } else {
                toast.error(result.msg || 'Không thể xử lý');
            }
        } catch (err) {
            toast.error('Lỗi kết nối');
        } finally {
            setProcessingBookingId(null);
        }
    };

    const handleRejectBooking = async (bookingId: number, reason: string) => {
        if (!reason.trim()) {
            toast.error('Vui lòng nhập lý do từ chối');
            return;
        }
        setProcessingBookingId(bookingId);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const res = await fetch(`${API_URL}/booking/host-process/${bookingId}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'REJECTED', rejectReason: reason }),
            });
            const result = await res.json();
            if (result.success) {
                toast.success('Đã từ chối yêu cầu');
                fetchBookings();
            } else {
                toast.error(result.msg || 'Không thể xử lý');
            }
        } catch (err) {
            toast.error('Lỗi kết nối');
        } finally {
            setProcessingBookingId(null);
        }
    };

    const filteredPosts = filterStatus === 'ALL' ? posts : posts.filter(p => p.moderationStatus === filterStatus);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <aside className="w-72 bg-white border-r border-gray-200 hidden lg:flex flex-col fixed left-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto shadow-sm z-40">
                {/* Navigation */}
                <div className="flex-1 p-4 overflow-y-auto">
                    <nav className="space-y-8">
                        {/* Nhóm chính */}
                        <div>
                            <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Quản lý</p>
                            <div className="space-y-1">
                                <SidebarLink onClick={() => setActiveView('rooms')} icon={<Icons.List />} label="Tin đăng của tôi" active={activeView === 'rooms'} />
                                <SidebarLink href="/room/post" icon={<Icons.Plus />} label="Đăng tin mới" />
                            </div>
                        </div>

                        {/* Nhóm tương tác */}
                        <div>
                            <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Tương tác</p>
                            <div className="space-y-1">
                                <SidebarLink
                                    onClick={() => setActiveView('bookings')}
                                    icon={<Icons.UserRequest />}
                                    label="Yêu cầu thuê"
                                    
                                    active={activeView === 'bookings'}
                                />
                                <SidebarLink
                                    href="#"
                                    icon={<Icons.Mail />}
                                    label="Hộp thư"
                                    
                                />
                            </div>
                        </div>
                    </nav>
                </div>
            </aside>

            {/* Nội dung chính */}
            <main className="flex-1 lg:ml-72 p-6 lg:p-10 pt-20">
                {activeView === 'rooms' ? (
                    <>
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Quản lý tin đăng</h1>
                                <p className="text-slate-500 text-sm">Bạn đang có {posts.length} phòng đang quản lý</p>
                            </div>
                            <Link href="/room/post" className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all text-sm shadow-lg shadow-slate-200">
                                <Icons.Plus /> Đăng tin mới
                            </Link>
                        </div>

                        {/* Cảnh báo xác thực Email (Nếu có) */}
                        {statusMsg === 'verification_needed' && (
                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-8 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm">
                                        <Icons.Mail />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">Xác thực email để hiển thị tin</p>
                                        <p className="text-xs text-slate-600">Chúng tôi đã gửi link tới <b>{user?.email}</b></p>
                                    </div>
                                </div>
                                <button className="text-sm font-bold text-blue-600 hover:underline">Gửi lại link</button>
                            </div>
                        )}

                        {/* Bộ lọc trạng thái */}
                        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
                            {[
                                { key: 'ALL', label: 'Tất cả' },
                                { key: 'DRAFT', label: 'Nháp' },
                                { key: 'PENDING', label: 'Chờ duyệt' },
                                { key: 'APPROVED', label: 'Đang hiển thị' },
                                { key: 'NEEDS_EDIT', label: 'Cần sửa' },
                                { key: 'REJECTED', label: 'Bị từ chối' }
                            ].map((status) => (
                                <button
                                    key={status.key}
                                    onClick={() => setFilterStatus(status.key)}
                                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border
                                        ${filterStatus === status.key
                                            ? 'bg-slate-900 text-white border-slate-900'
                                            : 'bg-white text-slate-500 border-gray-100 hover:border-gray-300'}`}
                                >
                                    {status.label}
                                </button>
                            ))}
                        </div>

                        {/* Danh sách phòng */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                                {[1, 2, 3].map(i => <div key={i} className="h-80 bg-gray-200 animate-pulse" />)}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                                {filteredPosts.map((room) => (
                                    <SimpleRoomCard 
                                        key={room.id} 
                                        room={room} 
                                        onDelete={handleDelete}
                                        deleting={deletingId === room.id}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    /* Bookings View */
                    <div>

                        {bookingsLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-xl" />
                                ))}
                            </div>
                        ) : bookings.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="mx-auto w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Chưa có yêu cầu thuê</h3>
                                <p className="text-slate-500">Các yêu cầu thuê phòng sẽ hiển thị ở đây</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {bookings.map((booking: any) => (
                                    <BookingCard
                                        key={booking.id}
                                        booking={booking}
                                        onApprove={handleApproveBooking}
                                        onReject={(id, reason) => handleRejectBooking(id, reason)}
                                        isProcessing={processingBookingId === booking.id}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && roomToDelete && (
                <DeleteModal
                    roomTitle={roomToDelete.title}
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                    isDeleting={deletingId === roomToDelete.id}
                />
            )}
        </div>
    );
}

// --- Component phụ trợ ---

function DeleteModal({ roomTitle, onConfirm, onCancel, isDeleting }: {
    roomTitle: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDeleting: boolean;
}) {
    return (
        // Lớp nền cực nhẹ, gần như trong suốt để không làm tối màn hình
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-200/20 animate-in fade-in duration-200">
            {/* Hộp thoại phẳng, gọn gàng */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 max-w-sm w-full p-8 animate-in zoom-in-95 duration-200">
                
                {/* Icon đơn giản */}
                <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </div>

                {/* Nội dung */}
                <div className="text-center mb-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Xóa tin đăng?</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Bạn có chắc chắn muốn xóa <span className="font-semibold text-slate-700">"{roomTitle}"</span>? Thao tác này sẽ xóa vĩnh viễn dữ liệu.
                    </p>
                </div>

                {/* Nút bấm thiết kế phẳng hiện đại */}
                <div className="flex flex-col gap-2">
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="w-full py-3 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isDeleting ? (
                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        ) : "Xác nhận xóa"}
                    </button>
                    
                    <button
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="w-full py-3 text-sm font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-2xl transition-all disabled:opacity-50"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        </div>
    );
}

function SidebarLink({ href, onClick, icon, label, active = false, badge }: any) {
    const className = `flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
        active 
            ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`;

    const content = (
        <>
            <div className="flex items-center gap-3">
                <span className={active ? 'text-white' : 'text-slate-400'}>{icon}</span>
                <span>{label}</span>
            </div>
            {badge && (
                <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full min-w-[20px] text-center">
                    {badge}
                </span>
            )}
        </>
    );

    if (onClick) {
        return (
            <button onClick={onClick} className={className}>
                {content}
            </button>
        );
    }

    return (
        <Link href={href} className={className}>
            {content}
        </Link>
    );
}

function SimpleRoomCard({ room, onDelete, deleting }: { 
    room: any; 
    onDelete: (id: number, title: string) => void;
    deleting: boolean;
}) {
    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'APPROVED': return { label: 'Đang hoạt động', color: 'bg-emerald-500' };
            case 'PENDING': return { label: 'Chờ duyệt', color: 'bg-amber-500' };
            case 'REJECTED': return { label: 'Bị từ chối', color: 'bg-red-500' };
            case 'NEEDS_EDIT': return { label: 'Cần sửa', color: 'bg-orange-500' };
            case 'DRAFT': return { label: 'Nháp', color: 'bg-gray-500' };
            default: return { label: 'Nháp', color: 'bg-gray-500' };
        }
    };

    const statusBadge = getStatusBadge(room.moderationStatus);

    return (
        <div className="bg-white border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-300 group">
            {/* Image Section */}
            <div className="relative h-56 overflow-hidden">
                <Image
                    src={room.images?.[0]?.imageUrl || '/placeholder-room.jpg'}
                    alt={room.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Status Badge */}
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent p-4">
                    <span className={`inline-flex items-center px-3 py-1.5 text-xs font-bold text-white ${statusBadge.color} shadow-lg`}>
                        {statusBadge.label}
                    </span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-5">
                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {room.title}
                </h3>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">{room.district}, {room.city}</span>
                </div>

                {/* Price & Area */}
                <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-100">
                    <div>
                        <p className="text-xs text-gray-500 font-semibold mb-1">Giá thuê</p>
                        <p className="text-lg font-black text-blue-600">
                            {new Intl.NumberFormat('vi-VN').format(room.pricePerMonth)}
                            <span className="text-xs font-normal text-gray-500">đ/tháng</span>
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-semibold mb-1">Diện tích</p>
                        <p className="text-lg font-black text-gray-900">
                            {room.area}
                            <span className="text-sm font-normal text-gray-500">m²</span>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Icons.Clock />
                        <span>{new Date(room.updatedAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex gap-2">
                        <Link 
                            href={`/room/edit/${room.id}`} 
                            className="p-2.5 bg-gray-100 hover:bg-gray-900 hover:text-white text-gray-700 transition-all duration-200 group/btn"
                            title="Chỉnh sửa"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </Link>
                        {room.moderationStatus === 'APPROVED' && (
                            <Link 
                                href={`/rooms/${room.id}`} 
                                className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 shadow-sm hover:shadow-md"
                                title="Xem chi tiết"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </Link>
                        )}
                        <button
                            onClick={() => onDelete(room.id, room.title)}
                            disabled={deleting}
                            className="p-2.5 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Xóa phòng"
                        >
                            {deleting ? (
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

