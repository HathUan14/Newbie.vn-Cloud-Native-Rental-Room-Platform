import React from 'react';
import { FormData } from '../types';
import Label from './Label';
import LocationPicker from './LocationPicker';
import locationData from '../../../data.json';

interface Step2Props {
    formData: FormData;
    handleInputChange: (field: keyof FormData, value: any) => void;
    errors: Record<string, string>;
    availableDistricts: any[];
    availableWards: any[];
}

const Step2_Location: React.FC<Step2Props> = ({ formData, handleInputChange, errors, availableDistricts, availableWards }) => {
    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <Label required>Tỉnh/Thành</Label>
                    <select
                        className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-black"
                        value={formData.province}
                        onChange={e => handleInputChange('province', e.target.value)}
                    >
                        <option value="">Chọn Tỉnh/Thành</option>
                        {locationData.cities.map(c => <option key={c.city_code} value={c.city_code}>{c.city_name}</option>)}
                    </select>
                </div>
                <div>
                    <Label required>Quận/Huyện</Label>
                    <select
                        className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100"
                        value={formData.district}
                        onChange={e => handleInputChange('district', e.target.value)}
                        disabled={!formData.province}
                    >
                        <option value="">Chọn Quận/Huyện</option>
                        {availableDistricts.map(d => <option key={d.district_code} value={d.district_code}>{d.district_name}</option>)}
                    </select>
                </div>
                <div>
                    <Label required>Phường/Xã</Label>
                    <select
                        className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100"
                        value={formData.ward}
                        onChange={e => handleInputChange('ward', e.target.value)}
                        disabled={!formData.district}
                    >
                        <option value="">Chọn Phường/Xã</option>
                        {availableWards.map(w => <option key={w.ward_code} value={w.ward_code}>{w.ward_name}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <Label required>Địa chỉ cụ thể</Label>
                <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-black"
                    placeholder="Số nhà, tên đường..."
                    value={formData.address}
                    onChange={e => handleInputChange('address', e.target.value)}
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>

            <div className="rounded-xl overflow-hidden border border-gray-200">
                <div className="bg-gray-50 px-4 py-2 border-b text-sm font-medium text-gray-500">Ghim vị trí chính xác trên bản đồ</div>
                <LocationPicker
                    initialPosition={[formData.latitude, formData.longitude]}
                    cityCode={formData.province}
                    districtCode={formData.district}
                    wardCode={formData.ward}
                    onLocationSelect={(lat: number, lng: number) => {
                        handleInputChange('latitude', lat);
                        handleInputChange('longitude', lng);
                    }}
                />
            </div>
        </div>
    );
};

export default Step2_Location;
