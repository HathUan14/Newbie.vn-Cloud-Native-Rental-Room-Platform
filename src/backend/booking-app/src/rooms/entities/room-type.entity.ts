import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Room } from '../../rooms/entities/room.entity';

@Entity({ name: 'room_types' })
export class RoomType {
  @PrimaryGeneratedColumn({ name: 'room_type_id' })
  id: number;

  @Column({ name: 'type_name', type: 'varchar', length: 100, unique: true })
  name: string;

  @OneToMany(() => Room, (room) => room.roomType)
  rooms: Room[];
}