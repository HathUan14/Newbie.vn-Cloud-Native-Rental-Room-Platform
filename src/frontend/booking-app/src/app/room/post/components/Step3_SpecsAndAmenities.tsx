import React from 'react';
import { FormData } from '../types';
import { FURNISHED_AMENITIES, SHARED_AMENITIES } from '../constants';
import Counter from './Counter';

interface Step3Props {
    formData: FormData;
    handleInputChange: (field: keyof FormData, value: any) => void;
}

const Step3_SpecsAndAmenities: React.FC<Step3Props> = ({ formData, handleInputChange }) => {

    const toggleAmenity = (amenityId: number) => {
        const idStr = amenityId.toString();

        const currentAmenities = formData.amenities || [];
        const isSelected = currentAmenities.includes(idStr);

        let newAmenities;
        if (isSelected) {
            newAmenities = currentAmenities.filter(id => id !== idStr);
        } else {
            newAmenities = [...currentAmenities, idStr];
        }

        handleInputChange('amenities', newAmenities);
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Specs Section (Giữ nguyên) */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h4 className="text-lg font-semibold mb-4">Thông số cơ bản</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-700">Diện tích (m²)</span>
                        <div className="w-32">
                            <input
                                type="number"
                                className="w-full p-2 text-center border-b-2 border-gray-200 focus:border-black outline-none font-bold text-lg"
                                value={formData.area}
                                onChange={e => handleInputChange('area', Number(e.target.value))}
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-700">Sức chứa tối đa (người)</span>
                        <Counter
                            value={formData.guestCapacity}
                            onChange={v => handleInputChange('guestCapacity', v)}
                            min={1}
                        />
                    </div>
                </div>
            </div>

            {/* --- Amenities Grid (ĐÃ SỬA) --- */}
            <div>
                <h4 className="text-lg font-semibold mb-4">🛋️ Nội thất phòng</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {FURNISHED_AMENITIES.map(am => {
                        // Sửa logic check ID (ép kiểu string để so sánh an toàn)
                        const isSelected = formData.amenities.includes(am.id.toString());
                        return (
                            <div
                                key={am.id} // Dùng ID làm key
                                onClick={() => toggleAmenity(am.id)} // Gọi hàm toggle mới
                                className={`cursor-pointer p-3 rounded-xl border flex items-center space-x-3 transition-all ${isSelected ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600' : 'border-gray-200 hover:border-gray-400'}`}
                            >
                                <div
                                    className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-indigo-600' : 'text-gray-600'}`}
                                    dangerouslySetInnerHTML={{ __html: am.icon }}
                                />
                                <span className={`text-sm ${isSelected ? 'font-semibold text-indigo-900' : 'text-gray-700'}`}>{am.name}</span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* --- Shared Amenities (ĐÃ SỬA) --- */}
            <div>
                <h4 className="text-lg font-semibold mb-4">🏢 Tiện ích chung</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {SHARED_AMENITIES.map(am => {
                        const isSelected = formData.amenities.includes(am.id.toString());
                        return (
                            <div
                                key={am.id}
                                onClick={() => toggleAmenity(am.id)}
                                className={`cursor-pointer p-3 rounded-xl border flex items-center space-x-3 transition-all ${isSelected ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600' : 'border-gray-200 hover:border-gray-400'}`}
                            >
                                <div
                                    className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-indigo-600' : 'text-gray-600'}`}
                                    dangerouslySetInnerHTML={{ __html: am.icon }}
                                />
                                <span className={`text-sm ${isSelected ? 'font-semibold text-indigo-900' : 'text-gray-700'}`}>{am.name}</span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Rules */}
            <div className="border-t pt-6">
                <h4 className="text-lg font-semibold mb-4">Quy định phòng</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between p-4 border rounded-xl">
                        <div>
                            <div className="font-medium">Giới tính</div>
                            <div className="text-xs text-gray-500">Đối tượng cho thuê</div>
                        </div>
                        <select
                            value={formData.gender}
                            onChange={e => handleInputChange('gender', e.target.value as any)}
                            className="bg-gray-100 rounded-lg p-2 text-sm outline-none"
                        >
                            <option value="ALL">Tất cả</option>
                            <option value="MALE">Chỉ Nam</option>
                            <option value="FEMALE">Chỉ Nữ</option>
                        </select>
                    </div>

                    {/* Curfew Toggle */}
                    <div className="flex items-center justify-between p-4 border rounded-xl">
                        <div>
                            <div className="font-medium">Giờ giấc</div>
                            <div className="text-xs text-gray-500">{formData.curfew ? `Đóng cửa lúc ${formData.curfewTime}` : 'Tự do 24/24'}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handleInputChange('curfew', !formData.curfew)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.curfew ? 'bg-black' : 'bg-gray-300'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${formData.curfew ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                            {formData.curfew && (
                                <input
                                    type="time"
                                    value={formData.curfewTime}
                                    onChange={e => handleInputChange('curfewTime', e.target.value)}
                                    className="border rounded p-1 text-sm"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Step3_SpecsAndAmenities;
