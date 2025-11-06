import { 
  Entity, 
  JoinColumn, 
  ManyToOne, 
  PrimaryColumn,
  Index, // ✅ Import Index
} from 'typeorm';
import { Room } from './room.entity';
import { Amenity } from './amenity.entity';

@Entity({ name: 'room_amenities' })
@Index('idx_room_amenities_room_id', ['roomId']) // ✅ Index cho room_id (QUAN TRỌNG!)
@Index('idx_room_amenities_amenity_id', ['amenityId']) // ✅ Index cho amenity_id
@Index('idx_room_amenities_composite', ['roomId', 'amenityId']) // ✅ Composite index (SIÊU QUAN TRỌNG!)
export class RoomAmenity {
  @PrimaryColumn({ name: 'room_id' })
  @Index() // ✅ Index riêng
  roomId: number;

  @PrimaryColumn({ name: 'amenity_id' })
  @Index() // ✅ Index riêng
  amenityId: number;

  @ManyToOne(() => Room, (room) => room.roomAmenities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @ManyToOne(() => Amenity, (amenity) => amenity.roomAmenities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'amenity_id' })
  amenity: Amenity;
}