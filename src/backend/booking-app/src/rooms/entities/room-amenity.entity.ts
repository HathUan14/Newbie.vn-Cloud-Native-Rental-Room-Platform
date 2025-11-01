import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Room } from './room.entity';
import { Amenity } from './amenity.entity';

@Entity({ name: 'room_amenities' })
export class RoomAmenity {
 
  @PrimaryColumn({ name: 'room_id' })
  roomId: number;

  @PrimaryColumn({ name: 'amenity_id' })
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