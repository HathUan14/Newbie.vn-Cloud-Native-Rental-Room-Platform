import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Index, // ✅ Import Index
} from 'typeorm';
import { Room } from '../../rooms/entities/room.entity';

@Entity({ name: 'room_types' })
@Index('idx_room_types_name', ['name']) // ✅ Index cho search by name
export class RoomType {
  @PrimaryGeneratedColumn({ name: 'room_type_id' })
  id: number;

  @Column({ 
    name: 'type_name', 
    type: 'varchar', 
    length: 100, 
    unique: true // ✅ Unique tự động tạo index
  })
  @Index() // ✅ Index riêng để search nhanh
  name: string;

  @OneToMany(() => Room, (room) => room.roomType)
  rooms: Room[];
}