'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

const Icons = {
    Mail: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>,
    CheckCircle: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Edit: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>,
    Plus: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>,
    Clock: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Eye: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Trash: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
};

export default function MyPostsPage() {
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [resending, setResending] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('ALL');

    const status = searchParams.get('status');

    useEffect(() => {
        const fetchMyRooms = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
                const res = await fetch(`${API_URL}/rooms/my-rooms`, {
                    credentials: 'include'
                });
                const data = await res.json();
                if (data.success) {
                    setPosts(data.data.map((room: any) => ({
                        ...room,
                        pricePerMonth: Number(room.pricePerMonth),
                        area: Number(room.area),
                        images: room.images || []
                    })));
                }
            } catch (error) {
                console.error(error);
                toast.error("Không thể tải danh sách tin");
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchMyRooms();
    }, [user]);

    // 2. Hàm gửi lại email xác thực (Chỉ gọi khi bấm nút)
    const handleResendEmail = async () => {
        try {
            setResending(true);
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const res = await fetch(`${API_URL}/auth/resend-verification`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (res.ok) {
                toast.success("Đã gửi lại email kích hoạt!");
            } else {
                toast.error("Gửi thất bại, vui lòng thử lại sau.");
            }
        } catch (error) {
            toast.error("Lỗi kết nối.");
        } finally {
            setResending(false);
        }
    };

    // Filter posts
    const filteredPosts = filterStatus === 'ALL' 
        ? posts 
        : posts.filter(p => p.moderationStatus === filterStatus);

    // Stats
    const stats = {
        total: posts.length,
        draft: posts.filter(p => p.moderationStatus === 'DRAFT').length,
        pending: posts.filter(p => p.moderationStatus === 'PENDING').length,
        approved: posts.filter(p => p.moderationStatus === 'APPROVED').length,
        rejected: posts.filter(p => p.moderationStatus === 'REJECTED').length,
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Tin đăng của tôi</h1>
                            <p className="text-slate-600 mt-1">Quản lý và theo dõi trạng thái tin đăng</p>
                        </div>
                        <Link 
                            href="/room/post" 
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-colors shadow-sm"
                        >
                            <Icons.Plus /> Đăng tin mới
                        </Link>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <StatCard 
                            label="Tất cả" 
                            count={stats.total} 
                            color="slate"
                            active={filterStatus === 'ALL'}
                            onClick={() => setFilterStatus('ALL')}
                        />
                        <StatCard 
                            label="Nháp" 
                            count={stats.draft} 
                            color="gray"
                            active={filterStatus === 'DRAFT'}
                            onClick={() => setFilterStatus('DRAFT')}
                        />
                        <StatCard 
                            label="Chờ duyệt" 
                            count={stats.pending} 
                            color="blue"
                            active={filterStatus === 'PENDING'}
                            onClick={() => setFilterStatus('PENDING')}
                        />
                        <StatCard 
                            label="Đã duyệt" 
                            count={stats.approved} 
                            color="emerald"
                            active={filterStatus === 'APPROVED'}
                            onClick={() => setFilterStatus('APPROVED')}
                        />
                        <StatCard 
                            label="Từ chối" 
                            count={stats.rejected} 
                            color="red"
                            active={filterStatus === 'REJECTED'}
                            onClick={() => setFilterStatus('REJECTED')}
                        />
                    </div>
                </div>

                {/* Alerts */}
                {status === 'verification_needed' && (
                    <div className="mb-6 bg-white border border-amber-200 rounded-xl p-5 flex items-start gap-4 shadow-sm">
                        <div className="flex-shrink-0 w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
                            <Icons.Mail />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 text-sm">Xác thực email để đăng tin</h3>
                            <p className="text-slate-600 text-sm mt-1">
                                Kiểm tra email <span className="font-medium">{user?.email}</span> để xác thực tài khoản
                            </p>
                            <div className="flex gap-2 mt-3">
                                <button 
                                    onClick={() => window.open('https://mail.google.com', '_blank')}
                                    className="text-sm font-medium text-amber-600 hover:text-amber-700"
                                >
                                    Mở Gmail
                                </button>
                                <span className="text-slate-300">•</span>
                                <button 
                                    onClick={handleResendEmail}
                                    disabled={resending}
                                    className="text-sm font-medium text-slate-600 hover:text-slate-700 disabled:opacity-50"
                                >
                                    {resending ? 'Đang gửi...' : 'Gửi lại'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="mb-6 bg-white border border-green-200 rounded-xl p-5 flex items-start gap-4 shadow-sm">
                        <div className="flex-shrink-0 w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                            <Icons.CheckCircle />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 text-sm">Đã gửi tin thành công</h3>
                            <p className="text-slate-600 text-sm mt-1">
                                Tin đăng đang chờ kiểm duyệt, sẽ được phê duyệt trong thời gian sớm nhất
                            </p>
                        </div>
                    </div>
                )}

                {/* Posts Grid */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-white rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : posts.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                        <p className="text-slate-500 mb-3">Chưa có tin đăng nào</p>
                        <Link href="/room/post" className="text-slate-900 font-medium hover:underline">
                            Tạo tin đăng đầu tiên →
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredPosts.map((room) => (
                            <PostCard key={room.id} room={room} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Stat Card Component
function StatCard({ label, count, color, active, onClick }: { 
    label: string; 
    count: number; 
    color: string; 
    active: boolean;
    onClick: () => void;
}) {
    // Màu thống nhất khi active
    const activeBg = 'bg-slate-600';
    const activeBorder = 'border-slate-900';
    const activeText = 'text-white';
    
    // Màu khi không active dựa vào color prop
    const inactiveClasses = {
        slate: 'bg-white text-slate-700 border-slate-200 hover:border-slate-300',
        gray: 'bg-white text-slate-700 border-slate-200 hover:border-slate-300',
        blue: 'bg-white text-slate-700 border-slate-200 hover:border-slate-300',
        emerald: 'bg-white text-slate-700 border-slate-200 hover:border-slate-300',
        red: 'bg-white text-slate-700 border-slate-200 hover:border-slate-300',
    }[color] || 'bg-white text-slate-700 border-slate-200 hover:border-slate-300';

    return (
        <button
            onClick={onClick}
            className={`border rounded-lg p-4 transition-all cursor-pointer text-left 
                ${active ? `${activeBg} ${activeText} ${activeBorder}` : inactiveClasses}`}
        >
            <div className={`text-2xl font-bold ${active ? 'text-white' : 'text-slate-900'}`}>{count}</div>
            <div className={`text-xs font-medium mt-1 ${active ? 'text-white/80' : 'text-slate-600'}`}>{label}</div>
        </button>
    );
}


function PostCard({ room }: { room: any }) {
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'bg-slate-100 text-slate-700';
            case 'PENDING': return 'bg-blue-100 text-blue-700';
            case 'APPROVED': return 'bg-emerald-100 text-emerald-700';
            case 'REJECTED': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'Nháp';
            case 'PENDING': return 'Chờ duyệt';
            case 'APPROVED': return 'Đang hiển thị';
            case 'REJECTED': return 'Bị từ chối';
            default: return status;
        }
    };

    const thumbnail = room.images?.[0]?.imageUrl || 'https://placehold.co/600x400?text=No+Image';

    return (
        <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 overflow-hidden group">
            <div className="p-5 flex gap-5">
                {/* Thumbnail */}
                <div className="relative w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100">
                    <Image 
                        src={thumbnail} 
                        alt={room.title} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    <span className={`absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-semibold ${getStatusStyle(room.moderationStatus)}`}>
                        {getStatusLabel(room.moderationStatus)}
                    </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg line-clamp-2 mb-2 group-hover:text-slate-700 transition-colors">
                            {room.title}
                        </h3>
                        
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
                            <span className="font-semibold text-slate-900">
                                {new Intl.NumberFormat('vi-VN').format(room.pricePerMonth)} đ/tháng
                            </span>
                            <span className="text-slate-300">•</span>
                            <span>{room.area} m²</span>
                            <span className="text-slate-300">•</span>
                            <span className="truncate max-w-[300px]">{room.district}, {room.city}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Icons.Clock />
                            <span>Cập nhật {new Date(room.updatedAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                        
                        <div className="flex gap-2">
                            <Link 
                                href={`/rooms/${room.id}`}
                                target="_blank"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-slate-900 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                <Icons.Eye /> Xem
                            </Link>
                            <Link 
                                href={`/room/edit/${room.id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors"
                            >
                                <Icons.Edit /> Chỉnh sửa
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}