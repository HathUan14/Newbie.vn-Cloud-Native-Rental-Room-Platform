import { Users, MapPin} from 'lucide-react';

export default function RoomInfo({ room }: { room: any }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{room.title}</h1>

      <div className="flex flex-wrap gap-6 text-gray-600 mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <span className="font-medium">Phòng {room.guestCapacity} người</span>
        </div>
        <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
          <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <p className="text-gray-700 leading-relaxed">
              {room.addressStreet}, {room.ward}, {room.district}, {room.city}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}